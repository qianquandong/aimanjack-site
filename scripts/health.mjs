#!/usr/bin/env node
// Daily SEO/GEO health check for aimanjack.com — zero credentials, zero deps.
//   node scripts/health.mjs             compare live site to scripts/seo-baseline.json
//   node scripts/health.mjs --baseline  (re)capture the baseline after an intentional change
// Writes scripts/health/YYYY-MM-DD.json and exits 1 on any FAIL. GSC / GA4 / GEO probes are
// added by the scheduled task on top of this (see HEALTH-CHECK.md).
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const SITE = "https://aimanjack.com";
const PAGES = ["/", "/zh/", "/products/", "/zh/products/"];
const BASELINE = "scripts/seo-baseline.json";
const today = new Date().toISOString().slice(0, 10);
const checks = [];
const add = (id, status, detail = "") => checks.push({ id, status, detail });
const get = async (p, opt = {}) => { try { const t0 = Date.now(); const r = await fetch(p.startsWith("http") ? p : SITE + p, { redirect: "manual", ...opt }); return { status: r.status, loc: r.headers.get("location") ?? "", body: opt.method === "HEAD" ? "" : await r.text(), ms: Date.now() - t0 }; } catch { return { status: 0, loc: "", body: "", ms: 0 }; } };
const m = (html, re) => html.match(re)?.[1]?.trim() ?? "";

// 1. Uptime + TTFB-ish
for (const p of [...PAGES, "/sitemap.xml", "/robots.txt", "/llms.txt"]) {
  const r = await get(p);
  add(`up:${p}`, r.status === 200 ? "PASS" : "FAIL", `HTTP ${r.status} ${r.ms}ms`);
  if (p === "/") add("perf:home-fetch", r.ms < 800 ? "PASS" : "WARN", `${r.ms}ms full fetch (PSI weekly gives the real CWV)`);
}
add("up:404", (await get("/definitely-not-a-page-" + Date.now())).status === 404 ? "PASS" : "FAIL", "random path must 404, not soft-200");

// 2. Redirect map — every rule in _redirects must still hold on the live edge
const bad = [];
for (const line of readFileSync("_redirects", "utf8").split("\n")) {
  const [src, dst, code] = line.trim().split(/\s+/); if (!src || src.startsWith("#")) continue;
  const r = await get(src.replace("*", "x/"));
  if (String(r.status) !== code || !r.loc.endsWith(dst)) bad.push(`${src}→${r.status} ${r.loc || "(none)"}`);
}
add("redirects", bad.length ? "FAIL" : "PASS", bad.join("; ") || "all _redirects rules hold");

// 3. Sitemap ↔ pages parity
const sm = (await get("/sitemap.xml")).body;
const smUrls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1].replace(SITE, ""));
const missing = PAGES.filter((p) => !smUrls.includes(p));
add("sitemap:pages", missing.length ? "FAIL" : "PASS", missing.length ? `missing ${missing.join(",")}` : `${smUrls.length} urls`);

// 4. On-page invariants per page vs baseline (title, description, canonical, hreflang, H1, robots, schema types, og:image)
const snap = {};
for (const p of PAGES) {
  const h = (await get(p)).body;
  const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((x) => x[1]);
  let types = "PARSE_ERROR";
  try { types = [...new Set(ld.flatMap((j) => JSON.stringify(JSON.parse(j)).match(/"@type":"([A-Za-z]+)"/g) ?? []))].map((t) => t.split('"')[3]).sort().join(","); } catch {}
  snap[p] = {
    title: m(h, /<title>([^<]*)<\/title>/), description: m(h, /<meta name="description" content="([^"]*)"/),
    canonical: m(h, /<link rel="canonical" href="([^"]*)"/), hreflang: [...h.matchAll(/hreflang="([^"]+)"/g)].map((x) => x[1]).sort().join(","),
    h1: m(h, /<h1[^>]*>([\s\S]*?)<\/h1>/).replace(/<[^>]+>|\s+/g, " ").trim(), robots: m(h, /<meta name="robots" content="([^"]*)"/),
    schemaTypes: types, ogImage: m(h, /property="og:image" content="([^"]*)"/), smsLinks: (h.match(/href="sms:\+14694254142/g) ?? []).length,
    ga4: /googletagmanager\.com\/gtag/.test(h), h1Count: (h.match(/<h1[\s>]/g) ?? []).length,
  };
  add(`page:${p}:h1`, snap[p].h1Count === 1 ? "PASS" : "FAIL", `${snap[p].h1Count} h1`);
  add(`page:${p}:schema`, types !== "PARSE_ERROR" && types.includes("ProfessionalService") ? "PASS" : "FAIL", types.slice(0, 80));
  add(`page:${p}:cta`, snap[p].smsLinks >= 2 ? "PASS" : "FAIL", `${snap[p].smsLinks} sms: CTAs to (469) 425-4142`);
  if (p === "/") { add("page:/:og-image", (await get(snap[p].ogImage, { method: "HEAD" })).status === 200 ? "PASS" : "FAIL", snap[p].ogImage); add("track:ga4", snap[p].ga4 ? "PASS" : "FAIL", "no GA4 tag → visitors and conversion rate are unmeasurable"); }
}
if (process.argv.includes("--baseline") || !existsSync(BASELINE)) { writeFileSync(BASELINE, JSON.stringify({ capturedAt: today, pages: snap }, null, 1) + "\n"); add("drift", "PASS", `baseline captured → ${BASELINE}`); }
else {
  const base = JSON.parse(readFileSync(BASELINE, "utf8")).pages, diffs = [];
  for (const p of PAGES) for (const k of ["title", "description", "canonical", "hreflang", "h1", "robots", "schemaTypes", "ogImage"]) if (base[p]?.[k] !== snap[p][k]) diffs.push(`${p} ${k}: "${base[p]?.[k]}" → "${snap[p][k]}"`);
  add("drift", diffs.length ? "FAIL" : "PASS", diffs.join(" | ") || "no on-page drift vs baseline (intentional change? rerun with --baseline)");
}

// 5. GEO surface: robots lets AI crawlers in, llms.txt describes the CURRENT offer
const robots = (await get("/robots.txt")).body;
add("geo:robots", /User-agent: \*\s+Allow: \//.test(robots) && !/Disallow: \/\s*$/m.test(robots) ? "PASS" : "FAIL", "AI crawlers (GPTBot/OAI-SearchBot/PerplexityBot/ClaudeBot) must not be blocked");
const llms = (await get("/llms.txt")).body;
add("geo:llms-current", /training/i.test(llms) && /\$2,000/.test(llms) && /425-4142/.test(llms) ? "PASS" : "FAIL", "llms.txt must name training + $2,000 product + phone; stale copy misleads AI answers");

// 6. Data plumbing the task needs — WARN until Jack wires them (HEALTH-CHECK.md §2)
add("creds:google-api", existsSync(`${process.env.HOME}/.config/claude-seo/google-api.json`) ? "PASS" : "WARN", "GSC/GA4/PSI via claude-seo need ~/.config/claude-seo/google-api.json");

const out = { date: today, checks };
writeFileSync(`scripts/health/${today}.json`, JSON.stringify(out, null, 1) + "\n");
for (const c of checks) console.log(`${c.status.padEnd(4)} ${c.id.padEnd(26)} ${c.detail}`);
const fails = checks.filter((c) => c.status === "FAIL").length, warns = checks.filter((c) => c.status === "WARN").length;
console.log(`\n${fails} FAIL, ${warns} WARN → scripts/health/${today}.json`);
process.exit(fails ? 1 : 0);
