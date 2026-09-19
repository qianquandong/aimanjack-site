#!/usr/bin/env node
// Daily SEO/GEO health check for aimanjack.com — zero credentials, zero deps.
//   node scripts/health.mjs             compare live site to scripts/seo-baseline.json
//   node scripts/health.mjs --baseline  (re)capture the baseline after an intentional change
// Writes scripts/health/YYYY-MM-DD.json and exits 1 on any FAIL. GSC / GA4 / GEO probes are
// added by the scheduled task on top of this (see HEALTH-CHECK.md).
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const PROD = "https://aimanjack.com";
// SITE=https://<branch>.aimanjack.pages.dev node scripts/health.mjs → same checks against a preview deploy (canonicals still point at PROD, by design).
const SITE = (process.env.SITE || PROD).replace(/\/$/, "");
const PREVIEW = SITE !== PROD;
// Indexable routes (PRD 2026-09-18 §77). Add /ai-training-dallas/, /ai-workflow-training/, /ai-workshops/ and the team pages as they ship.
const EN = ["/", "/ai-training/", "/blog/", "/about/", "/contact/", "/book/"];
// Resource library (bilingual since the 2026-09 redesign): hubs plus one detail page of each type as a canary.
const EN_ONLY = ["/tools/", "/tools/ai-readiness-assessment/", "/use-cases/", "/use-cases/sales/", "/workflows/", "/workflows/prospect-research/", "/templates/", "/templates/sales-meeting-prep/"];
const PAGES = [...EN, ...EN_ONLY].flatMap((p) => [p, "/zh" + p]);
// Legacy receptionist routes: must still resolve (200) but carry noindex and stay out of the sitemap.
const LEGACY = ["/ai-receptionist/", "/pricing/", "/industries/", "/integrations/", "/tools/missed-call-calculator/", "/case-studies/", "/blog/how-much-do-missed-calls-cost/"];
// Receptionist-era marketing that must not appear on any indexable page (§79). Legal pages are the only exception.
const BANNED = [/AI receptionist/i, /Call our AI demo/i, /missed[- ]call calculator/i, /\$199/, /\$299/, /\$599/, /appointment businesses/i, /AI 前台/, /拨打 AI 演示/];
const BASELINE = "scripts/seo-baseline.json";
const today = new Date().toISOString().slice(0, 10);
const checks = [];
const add = (id, status, detail = "") => checks.push({ id, status, detail });
const get = async (p, opt = {}) => { try { const t0 = Date.now(); const r = await fetch(p.startsWith("http") ? p : SITE + p, { redirect: "manual", headers: { "user-agent": "Mozilla/5.0 (health check; aimanjack.com)" }, ...opt }); return { status: r.status, loc: r.headers.get("location") ?? "", body: opt.method === "HEAD" ? "" : await r.text(), ms: Date.now() - t0 }; } catch { return { status: 0, loc: "", body: "", ms: 0 }; } };
const m = (html, re) => html.match(re)?.[1]?.trim() ?? "";
const visible = (html) => html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<footer[\s\S]*?<\/footer>/g, "");

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

// 3. Sitemap ↔ pages parity: every indexable page in, every legacy route out
const sm = (await get("/sitemap.xml")).body;
const smUrls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1].replace(PROD, ""));
const missing = PAGES.filter((p) => !smUrls.includes(p));
add("sitemap:pages", missing.length ? "FAIL" : "PASS", missing.length ? `missing ${missing.join(",")}` : `${smUrls.length} urls`);
const leaked = LEGACY.filter((p) => smUrls.includes(p) || smUrls.includes("/zh" + p));
add("sitemap:legacy-out", leaked.length ? "FAIL" : "PASS", leaked.length ? `legacy in sitemap: ${leaked.join(",")}` : "no legacy receptionist routes in sitemap");

// 4. Legacy routes: 200 + noindex (robots.txt must NOT block them, or crawlers never read the noindex)
for (const p of LEGACY) {
  const r = await get(p);
  const robots = m(r.body, /<meta name="robots" content="([^"]*)"/);
  add(`legacy:${p}`, r.status === 200 && /noindex/.test(robots) ? "PASS" : "FAIL", `HTTP ${r.status}, robots="${robots}"`);
}

// 5. On-page invariants per indexable page vs baseline
const snap = {};
for (const p of PAGES) {
  const h = (await get(p)).body;
  const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((x) => x[1]);
  let types = "PARSE_ERROR", ldText = "";
  try { ldText = ld.join(""); types = [...new Set(ld.flatMap((j) => JSON.stringify(JSON.parse(j)).match(/"@type":"([A-Za-z]+)"/g) ?? []))].map((t) => t.split('"')[3]).sort().join(","); } catch {}
  const self = PROD + p;
  snap[p] = {
    title: m(h, /<title>([^<]*)<\/title>/), description: m(h, /<meta name="description" content="([^"]*)"/),
    canonical: m(h, /<link rel="canonical" href="([^"]*)"/), hreflang: [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)]   // <link> only: the header language switch also carries hreflang=
     .map((x) => x[1]).sort().join(","),
    h1: m(h, /<h1[^>]*>([\s\S]*?)<\/h1>/).replace(/<[^>]+>|\s+/g, " ").trim(), robots: m(h, /<meta name="robots" content="([^"]*)"/),
    schemaTypes: types, ogImage: m(h, /property="og:image" content="([^"]*)"/), bookLinks: (h.match(/href="\/(?:zh\/)?book\/"/g) ?? []).length,
    ga4: /googletagmanager\.com\/gtag/.test(h), h1Count: (h.match(/<h1[\s>]/g) ?? []).length,
  };
  const s = snap[p];
  add(`page:${p}:h1`, s.h1Count === 1 ? "PASS" : "FAIL", `${s.h1Count} h1`);
  add(`page:${p}:meta`, s.title && s.description && s.canonical === self && s.hreflang === "en,x-default,zh" && /^index/.test(s.robots) ? "PASS" : "FAIL", `canonical=${s.canonical} robots=${s.robots} hreflang=${s.hreflang}`);
  add(`page:${p}:schema`, types !== "PARSE_ERROR" && types.includes("ProfessionalService") ? "PASS" : "FAIL", types.slice(0, 80));
  add(`page:${p}:cta`, s.bookLinks >= 1 ? "PASS" : "FAIL", `${s.bookLinks} links to /book/ (Book a Workshop)`);
  // Label must say what the click does: "Call" → tel:, "Text" → sms:, "Email" → mailto:
  const mism = [...h.matchAll(/<a [^>]*href="(tel:|sms:|mailto:)[^"]*"[^>]*>([^<]*)<\/a>/g)].filter(([, proto, t]) =>
    (/\bCall\b|打|拨/.test(t) && proto !== "tel:") || (/\bText\b|短信/.test(t) && proto !== "sms:") || (/\bEmail\b|邮件/.test(t) && proto !== "mailto:")).map(([, proto, t]) => `${proto} "${t.trim()}"`);
  add(`page:${p}:cta-labels`, mism.length ? "FAIL" : "PASS", mism.join("; ") || "every CTA label matches its protocol");
  // Banned receptionist marketing, in visible copy and in JSON-LD (footer excluded: A2P legal text mentions missed calls)
  const hits = BANNED.filter((re) => re.test(visible(h)) || re.test(ldText)).map(String);
  add(`page:${p}:no-receptionist`, hits.length ? "FAIL" : "PASS", hits.join(" ") || "no receptionist marketing");
  if (p === "/") { add("page:/:og-image", (await get(s.ogImage.replace(PROD, SITE), { method: "HEAD" })).status === 200 ? "PASS" : "FAIL", s.ogImage); add("track:ga4", s.ga4 ? "PASS" : "FAIL", s.ga4 ? "GA4 present" : "GA4 missing → visitors and conversion rate are unmeasurable"); }
}
if (PREVIEW) add("drift", "PASS", "skipped on a preview origin (baseline is production)");
else if (process.argv.includes("--baseline") || !existsSync(BASELINE)) { writeFileSync(BASELINE, JSON.stringify({ capturedAt: today, pages: snap }, null, 1) + "\n"); add("drift", "PASS", `baseline captured → ${BASELINE}`); }
else {
  const base = JSON.parse(readFileSync(BASELINE, "utf8")).pages, diffs = [];
  for (const p of PAGES) for (const k of ["title", "description", "canonical", "hreflang", "h1", "robots", "schemaTypes", "ogImage"]) if (base[p]?.[k] !== snap[p][k]) diffs.push(`${p} ${k}: "${base[p]?.[k]}" → "${snap[p][k]}"`);
  add("drift", diffs.length ? "FAIL" : "PASS", diffs.join(" | ") || "no on-page drift vs baseline (intentional change? rerun with --baseline)");
}

// 6. GEO surface: robots lets AI crawlers in, llms.txt describes the CURRENT offer
const robots = (await get("/robots.txt")).body;
add("geo:robots", /User-agent: \*\s+Allow: \//.test(robots) && !/Disallow: \/\s*$/m.test(robots) ? "PASS" : "FAIL", "AI crawlers (GPTBot/OAI-SearchBot/PerplexityBot/ClaudeBot) must not be blocked");
const llms = (await get("/llms.txt")).body;
add("geo:llms-current", /corporate AI training/i.test(llms) && /\$1,500/.test(llms) && /425-4142/.test(llms) && !/receptionist|\$199/i.test(llms) ? "PASS" : "FAIL", "llms.txt must describe corporate AI training + $1,500 half-day + SMS number, and nothing about the receptionist");

// 7. Data plumbing the task needs — WARN until Jack wires them (HEALTH-CHECK.md §2)
add("creds:google-api", existsSync(`${process.env.HOME}/.config/claude-seo/google-api.json`) ? "PASS" : "WARN", "GSC/GA4/PSI via claude-seo need ~/.config/claude-seo/google-api.json");

const out = { date: today, checks };
if (!PREVIEW) writeFileSync(`scripts/health/${today}.json`, JSON.stringify(out, null, 1) + "\n");
for (const c of checks) console.log(`${c.status.padEnd(4)} ${c.id.padEnd(30)} ${c.detail}`);
const fails = checks.filter((c) => c.status === "FAIL").length, warns = checks.filter((c) => c.status === "WARN").length;
console.log(`\n${fails} FAIL, ${warns} WARN → scripts/health/${today}.json`);
process.exit(fails ? 1 : 0);
