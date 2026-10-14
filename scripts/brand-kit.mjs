// Renders the AI Man Jack brand kit (avatars, logo lockups, platform banners) to img/brand/
// from the same mark as favicon.svg, using headless Edge/Chrome. Run: node scripts/brand-kit.mjs
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = join(ROOT, 'img', 'brand');
const TMP = join(tmpdir(), 'aimanjack-brand-kit');
mkdirSync(OUT, { recursive: true }); mkdirSync(TMP, { recursive: true });

const BROWSER = [process.env.BROWSER_BIN,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => p && existsSync(p));
if (!BROWSER) throw new Error('No Edge/Chrome found; set BROWSER_BIN');

const C = { ink: '#1D1A19', accent: '#A8552F', bg: '#F2EEE6', card: '#E6DCCB', muted: '#625C54', onDarkMuted: '#BDB3A6', onDarkAccent: '#E8A27A' };
const FONT = pathToFileURL(join(ROOT, 'fonts', 'Satoshi-Variable.woff2')).href;
const J = 'M0.88 -9.328V-11.616H7.744V-9.328Q7.744 -8.052 8.58 -7.04Q9.416 -6.028 11.44 -6.028Q13.42 -6.028 14.256 -6.996Q15.092 -7.964 15.092 -9.592V-32.56H22.22V-9.152Q22.22 -6.38 20.922 -4.18Q19.624 -1.98 17.226 -0.704Q14.828 0.572 11.528 0.572Q7.964 0.572 5.588 -0.726Q3.212 -2.024 2.046 -4.268Q0.88 -6.512 0.88 -9.328Z';

// The mark exactly as on the site (64-unit box, rounded square). `bg`/`fg` swap for light/dark use.
const mark = (size, { bg = C.ink, fg = '#fff', rx = 16 } = {}) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 64 64"><rect width="64" height="64" rx="${rx}" fill="${bg}"/><g transform="translate(15 49)"><path fill="${fg}" d="${J}"/></g><circle cx="46.5" cy="18" r="5.5" fill="${C.accent}"/></svg>`;
// Avatar: full-bleed square (platforms crop to a circle), mark scaled to sit inside the circle.
const avatar = (size, { bg = C.ink, fg = '#fff' } = {}) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 64 64"><rect width="64" height="64" fill="${bg}"/><g transform="translate(32 32) scale(1.12) translate(-32 -32)"><g transform="translate(15 49)"><path fill="${fg}" d="${J}"/></g><circle cx="46.5" cy="18" r="5.5" fill="${C.accent}"/></g></svg>`;
const wordmark = (px, color) => `<span style="font:800 ${px}px/1 Satoshi;letter-spacing:-.02em;color:${color};white-space:nowrap">AI Man Jack</span>`;

const page = (w, h, body, bg = 'transparent') => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Satoshi;src:url('${FONT}') format('woff2');font-weight:300 900}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:${w}px;height:${h}px;overflow:hidden;background:${bg}}
body{font-family:Satoshi,sans-serif;-webkit-font-smoothing:antialiased}
</style></head><body>${body}</body></html>`;

// Banner: brand colours, mark + wordmark + one line, all inside the platform's safe area (sw × sh, centred).
// align: 'center' (YouTube crops to the middle band) or 'end' (LinkedIn/X/Facebook put the profile photo over the bottom-left).
const banner = (w, h, sw, sh, { tag, sub, scale = 1, align = 'center' }) => page(w, h, `
<div style="position:absolute;inset:0;background:${C.ink}"></div>
<div style="position:absolute;right:${-h * .25}px;top:${-h * .35}px;width:${h * 1.1}px;height:${h * 1.1}px;border-radius:50%;background:${C.accent};opacity:.13"></div>
<div style="position:absolute;left:${(w - sw) / 2}px;top:${(h - sh) / 2}px;width:${sw}px;height:${sh}px;display:flex;align-items:center;justify-content:${align};gap:${40 * scale}px">
  ${mark(150 * scale, { bg: '#fff', fg: C.ink })}
  <div style="display:flex;flex-direction:column;gap:${18 * scale}px">
    ${wordmark(84 * scale, '#fff')}
    <div style="font:500 ${38 * scale}px/1.25 Satoshi;color:${C.onDarkMuted}">${tag}</div>
    ${sub ? `<div style="font:700 ${28 * scale}px/1 Satoshi;letter-spacing:.08em;text-transform:uppercase;color:${C.onDarkAccent}">${sub}</div>` : ''}
  </div>
</div>`);

const TAG = 'Hands-on AI training for business teams';
const SUB = 'Dallas–Fort Worth · Live online · English / 中文';
const assets = {
  // Avatars / logos (square). Use avatar-* where the platform crops to a circle.
  'avatar-dark-1024.png': [1024, 1024, page(1024, 1024, avatar(1024))],
  'avatar-light-1024.png': [1024, 1024, page(1024, 1024, avatar(1024, { bg: C.bg, fg: C.ink }))],
  'logo-mark-1024.png': [1024, 1024, page(1024, 1024, mark(1024))],
  'logo-mark-512.png': [512, 512, page(512, 512, mark(512))],
  // Horizontal lockups, transparent background.
  'logo-horizontal-dark.png': [1800, 400, page(1800, 400, `<div style="height:400px;display:flex;align-items:center;gap:56px;padding:0 40px">${mark(300)}${wordmark(190, C.ink)}</div>`)],
  'logo-horizontal-light.png': [1800, 400, page(1800, 400, `<div style="height:400px;display:flex;align-items:center;gap:56px;padding:0 40px">${mark(300, { bg: '#fff', fg: C.ink })}${wordmark(190, '#fff')}</div>`)],
  // Platform banners (size, then the area every device shows).
  'banner-youtube-2560x1440.png': [2560, 1440, banner(2560, 1440, 1546, 423, { tag: TAG, sub: SUB, scale: 1 })],
  'banner-linkedin-1584x396.png': [1584, 396, banner(1584, 396, 1100, 300, { tag: TAG, sub: SUB, scale: .78, align: 'end' })],
  'banner-facebook-1640x624.png': [1640, 624, banner(1640, 624, 1300, 420, { tag: TAG, sub: SUB, scale: .95, align: 'end' })],
  'banner-x-1500x500.png': [1500, 500, banner(1500, 500, 1180, 360, { tag: TAG, sub: SUB, scale: .82, align: 'end' })],
};

for (const [name, [w, h, html]] of Object.entries(assets)) {
  const src = join(TMP, name.replace(/\.png$/, '.html')), out = join(OUT, name);
  writeFileSync(src, html);
  if (existsSync(out)) rmSync(out);
  execFileSync(BROWSER, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--default-background-color=00000000', '--virtual-time-budget=3000', `--window-size=${w},${h}`, `--screenshot=${out}`, pathToFileURL(src).href], { stdio: 'ignore' });
  if (!existsSync(out)) throw new Error(`render failed: ${name}`);
  console.log('wrote', `img/brand/${name}`);
}
