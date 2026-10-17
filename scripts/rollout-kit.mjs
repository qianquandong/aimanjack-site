#!/usr/bin/env node
// AI Rollout Kit for small teams (2026-10-17): the free download offered in exchange for an email.
// Five existing worksheets from the template library (src/content/templates.mjs, EN + ZH), in rollout order, plus a
// cover and a short "how to use" page. Every page stays public on the site; the PDF is the convenient bundle.
//
//   node scripts/rollout-kit.mjs      → downloads/ai-rollout-kit-en.pdf, downloads/ai-rollout-kit-zh.pdf
//
// Renders an HTML file per language and prints it with headless Edge/Chrome (same browser lookup as brand-kit.mjs).
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { TEMPLATES } from '../src/content/templates.mjs';
import { loc } from '../src/resources.mjs';
import { SITE, EMAIL, SMS_DISPLAY } from '../src/config.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'downloads'), TMP = join(ROOT, '.preview', 'rollout-kit');
const BROWSER = [process.env.CHROME, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => p && existsSync(p));
if (!BROWSER) throw new Error('No Edge/Chrome found; set CHROME=/path/to/browser');

// Rollout order: pick the work → approve the tools → set data rules → write the workflow down → review after two weeks.
const STEPS = ['ai-use-case-discovery-worksheet', 'ai-tool-approval-checklist', 'ai-data-boundaries-one-pager', 'ai-workflow-one-pager', 'two-week-workflow-review'];

const COPY = {
  en: {
    title: 'AI Rollout Kit for Small Teams', sub: 'Five one-page worksheets to take a team from “people are trying ChatGPT” to approved tools, clear data rules and workflows that are actually used.',
    by: 'AI Man Jack · Jack Qian · Dallas–Fort Worth', how: 'How to use this kit',
    steps: ['Pick two or three tasks worth doing with AI (worksheet 1). Recurring, clear inputs, an output a person can check.', 'Approve the tools before anyone puts company work into them (worksheet 2).', 'Write down what never goes into an AI tool and who signs off on outputs (worksheet 3). Post it where the team can see it.', 'For each task, write the workflow on one page so a colleague could repeat it (worksheet 4).', 'After two weeks, review each workflow: keep, change or stop (worksheet 5).'],
    note: 'Print the pages, or copy the text from the online versions at aimanjack.com/templates/. No AI tool is needed to fill them in.',
    help: 'Want help running this with your team?', helpP: `Jack runs hands-on AI training for business teams, onsite in Dallas–Fort Worth or live online. Book a 20-minute call at ${SITE.replace('https://', '')}/book/ or email ${EMAIL}.`,
    step: (n) => `Step ${n} of 5`, online: 'Online version:',
  },
  zh: {
    title: '小团队 AI 落地套件', sub: '五张一页纸工作表，带团队从“有人在试 ChatGPT”走到：批准的工具、清楚的数据规则，以及真正在用的工作流。',
    by: 'AI Man Jack · Jack Qian · 达拉斯—沃斯堡', how: '怎么用这套工作表',
    steps: ['挑两三件值得用 AI 做的事（工作表 1）：重复出现、输入清楚、结果能由人核对。', '在任何人把公司工作放进 AI 工具之前，先批准工具（工作表 2）。', '写下哪些内容绝不能进 AI 工具、输出由谁签字（工作表 3），贴在团队看得到的地方。', '每件事写成一页工作流，让同事也能照做（工作表 4）。', '两周后逐条复盘：保留、调整还是停用（工作表 5）。'],
    note: '可以直接打印，也可以到 aimanjack.com/zh/templates/ 复制在线版的文字。填写不需要任何 AI 工具。',
    help: '想让 Jack 带你的团队把这套做下来？', helpP: `Jack 为企业团队做 AI 实操培训，达拉斯—沃斯堡上门或线上直播。在 ${SITE.replace('https://', '')}/zh/book/ 预约 20 分钟通话，或发邮件到 ${EMAIL}。`,
    step: (n) => `第 ${n} 步 / 共 5 步`, online: '在线版：',
  },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function html(lang) {
  const c = COPY[lang], pre = lang === 'zh' ? '/zh' : '';
  const sheets = STEPS.map((slug, i) => {
    const t = loc(TEMPLATES.find((x) => x.slug === slug), lang);
    return `<section class="page"><p class="k">${c.step(i + 1)}</p><h2>${esc(t.title)}</h2><p class="d">${esc(t.description)}</p><pre>${esc(t.body)}</pre>
<p class="foot">${c.online} ${SITE.replace('https://', '')}${pre}/templates/${slug}/ · AI Man Jack</p></section>`;
  }).join('\n');
  return `<!doctype html><html lang="${lang === 'zh' ? 'zh-CN' : 'en'}"><head><meta charset="utf-8"><title>${c.title}</title><style>
@font-face{font-family:'Satoshi';src:url('${pathToFileURL(join(ROOT, 'fonts/Satoshi-latin-2.woff2')).href}') format('woff2');font-weight:300 900}
@page{size:Letter;margin:0.5in 0.55in}@page :first{margin:0}
*{box-sizing:border-box}body{margin:0;font-family:'Satoshi','Segoe UI','Microsoft YaHei','PingFang SC',sans-serif;color:#1D1A19;font-size:11.5pt;line-height:1.5}
.page{page-break-after:always}.page:last-child{page-break-after:auto}
.cover{display:flex;flex-direction:column;justify-content:center;background:#F2EEE6;padding:1in;height:11in;min-height:0}
.mark{width:64px;height:64px;border-radius:14px;background:#1D1A19;color:#fff;font-weight:800;font-size:38px;display:flex;align-items:center;justify-content:center;position:relative;margin-bottom:28px}
.mark:after{content:'';position:absolute;right:9px;top:9px;width:10px;height:10px;border-radius:50%;background:#A8552F}
h1{font-size:40pt;line-height:1.05;margin:0 0 18px;font-weight:800;letter-spacing:-.02em}h2{font-size:20pt;margin:2px 0 6px;font-weight:800}
.sub{font-size:15pt;max-width:5.6in;color:#3d3835}.by{margin-top:36px;font-size:10.5pt;color:#6b625c;letter-spacing:.04em}
.k{color:#A8552F;font-weight:700;font-size:9.5pt;letter-spacing:.08em;text-transform:uppercase;margin:0}.d{color:#4a443f;margin:0 0 10px;font-size:10.5pt}
ol{padding-left:20px}ol li{margin:0 0 10px}.box{border:1.5px solid #1D1A19;border-radius:12px;padding:16px 18px;margin-top:22px}
pre{font-family:Consolas,'Courier New','Microsoft YaHei',monospace;font-size:8.8pt;line-height:1.36;white-space:pre-wrap;background:#FBF9F5;border:1px solid #E4DED3;border-radius:10px;padding:14px 16px;margin:0}
.foot{font-size:8.5pt;color:#8a817a;border-top:1px solid #E4DED3;padding-top:6px;margin:12px 0 0}
</style></head><body>
<section class="page cover"><div class="mark">J</div><h1>${c.title}</h1><p class="sub">${c.sub}</p><p class="by">${c.by} · ${SITE.replace('https://', '')}</p></section>
<section class="page"><p class="k">AI Man Jack</p><h2>${c.how}</h2><ol>${c.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol><p>${c.note}</p>
<div class="box"><strong>${c.help}</strong><p style="margin:6px 0 0">${c.helpP} ${lang === 'zh' ? '短信' : 'Text'}: ${SMS_DISPLAY}</p></div></section>
${sheets}
</body></html>`;
}

mkdirSync(OUT, { recursive: true }); mkdirSync(TMP, { recursive: true });
for (const lang of ['en', 'zh']) {
  const src = join(TMP, `kit-${lang}.html`), out = join(OUT, `ai-rollout-kit-${lang}.pdf`);
  writeFileSync(src, html(lang));
  execFileSync(BROWSER, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=3000', `--print-to-pdf=${out}`, pathToFileURL(src).href], { stdio: 'ignore' });
  console.log('wrote', out.replace(ROOT, '').replace(/\\/g, '/'));
}
