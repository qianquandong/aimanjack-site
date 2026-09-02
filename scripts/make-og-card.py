# 1200x630 link-preview cards. Re-run after changing headline copy.
# Output filenames are new each time on purpose: /img/* is cached immutable for a
# year, so an image must never be overwritten in place.
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG, INK, GREEN, MUTED, LINE, TINT = "#f7f8f7", "#141a17", "#0b5d38", "#59615c", "#dfe4e1", "#e9f2ed"
HEL = "/System/Library/Fonts/Helvetica.ttc"
CJK = "/System/Library/Fonts/Hiragino Sans GB.ttc"

def card(out, kicker, l1, l2, cta, site="aimanjack.com", zh=False, portrait=True):
    def f(sz, bold=True):
        if zh:
            return ImageFont.truetype(CJK, sz, index=2 if bold else 0)
        return ImageFont.truetype(HEL, sz, index=1 if bold else 0)
    def fe(sz, bold=True):                       # latin face, for the phone number / domain
        return ImageFont.truetype(HEL, sz, index=1 if bold else 0)

    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)

    if portrait:
        R = 205
        cx, cy = W - 208, H // 2 - 34
        p = Image.open("img/jack-headshot.jpg").convert("RGB").resize((R * 2, R * 2), Image.LANCZOS)
        mask = Image.new("L", (R * 2, R * 2), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, R * 2, R * 2), fill=255)
        d.ellipse((cx - R - 9, cy - R - 9, cx + R + 9, cy + R + 9), fill=TINT)
        im.paste(p, (cx - R, cy - R), mask)

    x = 72
    hs = 52 if not zh else 54
    d.text((x, 104), kicker, font=fe(22), fill=GREEN)
    d.text((x, 206), l1, font=f(hs), fill=INK)
    d.text((x, 206 + hs + 22), l2, font=f(hs), fill=GREEN)

    d.line((x, H - 138, 700, H - 138), fill=LINE, width=2)
    d.text((x, H - 110), cta, font=f(29), fill=INK)
    d.text((x, H - 60), site, font=fe(23, bold=False), fill=MUTED)
    im.save(out, quality=90, optimize=True)
    print("wrote", out)

# Home — AI training for teams
card("img/og-training.jpg",
     "AI TRAINING · DALLAS–FORT WORTH",
     "Hands-on AI training",
     "for your team",
     "English or Chinese — text TRAINING to (469) 425-4142")
card("img/og-training-zh.jpg",
     "AI TRAINING · DALLAS–FORT WORTH",
     "给你团队的",
     "动手 AI 培训",
     "中英文皆可 — 发 TRAINING 到 (469) 425-4142",
     zh=True)

# Products — AI front desk
card("img/og-products.jpg",
     "DALLAS CLINICS & APPOINTMENT PRACTICES",
     "An AI front desk that",
     "answers and books 24/7",
     "$2,000 build · $200/mo — text CHECKUP to (469) 425-4142")
card("img/og-products-zh.jpg",
     "DALLAS CLINICS & APPOINTMENT PRACTICES",
     "24 小时接电话约时间的",
     "AI 前台",
     "$2,000 搭建 · 每月 $200 — 发 CHECKUP 到 (469) 425-4142",
     zh=True)
