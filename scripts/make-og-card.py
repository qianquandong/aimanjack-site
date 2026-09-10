# 1200x630 link-preview cards. Re-run after changing headline copy.
# Output filenames are new each time on purpose: /img/* is cached immutable for a
# year, so an image must never be overwritten in place.
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG, INK, ACCENT, MUTED, LINE, TINT = "#ffffff", "#141414", "#1e4fd8", "#5c6066", "#e3e3df", "#edf1fd"
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
    d.text((x, 104), kicker, font=fe(22), fill=ACCENT)
    d.text((x, 206), l1, font=f(hs), fill=INK)
    d.text((x, 206 + hs + 22), l2, font=f(hs), fill=ACCENT)

    d.line((x, H - 138, 700, H - 138), fill=LINE, width=2)
    d.text((x, H - 110), cta, font=f(29), fill=INK)
    d.text((x, H - 60), site, font=fe(23, bold=False), fill=MUTED)
    im.save(out, quality=90, optimize=True)
    print("wrote", out)

# AI receptionist (home + every product page), 2026-09-09 redesign.
card("img/og-receptionist.jpg",
     "AI RECEPTIONIST · DALLAS–FORT WORTH",
     "Your phone can",
     "answer itself.",
     "Call the AI demo: (469) 517-2968 — no signup")
card("img/og-receptionist-zh.jpg",
     "AI RECEPTIONIST · DALLAS–FORT WORTH",
     "你的电话，",
     "能自己接。",
     "拨打 AI 演示线 (469) 517-2968，不用注册",
     zh=True)

# Training cards (img/og-training*.jpg) were generated with the previous palette and are
# left in place: the file names are cached immutable, so a recolor would need new names.
