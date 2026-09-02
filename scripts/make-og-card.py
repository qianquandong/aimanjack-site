from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG, INK, GREEN, MUTED, LINE, TINT = "#f7f8f7", "#141a17", "#0b5d38", "#59615c", "#dfe4e1", "#e9f2ed"
HEL = "/System/Library/Fonts/Helvetica.ttc"
PING = "/System/Library/Fonts/Hiragino Sans GB.ttc"

def card(out, kicker, l1, l2, cta, site="aimanjack.com", zh=False):
    def f(sz, bold=True):
        if zh:
            return ImageFont.truetype(PING, sz, index=2 if bold else 0)
        return ImageFont.truetype(HEL, sz, index=1 if bold else 0)
    def fe(sz, bold=True):                       # latin face, for the phone number / domain
        return ImageFont.truetype(HEL, sz, index=1 if bold else 0)

    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)

    R = 205
    cx, cy = W - 208, H // 2 - 34
    p = Image.open("img/jack-headshot.jpg").convert("RGB").resize((R * 2, R * 2), Image.LANCZOS)
    mask = Image.new("L", (R * 2, R * 2), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, R * 2, R * 2), fill=255)
    d.ellipse((cx - R - 9, cy - R - 9, cx + R + 9, cy + R + 9), fill=TINT)
    im.paste(p, (cx - R, cy - R), mask)

    x = 72
    hs = 52 if not zh else 54
    d.text((x, 104), kicker, font=f(22) if not zh else fe(22), fill=GREEN)
    d.text((x, 206), l1, font=f(hs), fill=INK)
    d.text((x, 206 + hs + 22), l2, font=f(hs), fill=GREEN)

    d.line((x, H - 138, 700, H - 138), fill=LINE, width=2)
    d.text((x, H - 110), cta, font=f(29), fill=INK)
    d.text((x, H - 60), site, font=fe(23, bold=False), fill=MUTED)
    im.save(out, quality=90, optimize=True)
    print("wrote", out)

card("img/og-home.jpg",
     "DALLAS · RICHARDSON · PLANO · ALLEN",
     "What's costing you",
     "customers?",
     "Free checkup — text CHECKUP to (469) 425-4142")

card("img/og-home-zh.jpg",
     "DALLAS · RICHARDSON · PLANO · ALLEN",
     "是什么在让你",
     "流失客户？",
     "免费体检 — 发短信 CHECKUP 到 (469) 425-4142",
     zh=True)
