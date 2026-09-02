"""Subset Satoshi to the glyphs this site actually renders.

The shipped variable font is 42KB and carries the full Latin-Extended set plus
Cyrillic and Greek; the site uses a few hundred codepoints. Run after adding
copy that introduces a new symbol, then check the printed 'missing' list is
empty. Needs: pip install fonttools brotli
"""
import glob, html, os, re, sys, unicodedata

SRC = "fonts/Satoshi-Variable.woff2"
OUT = "fonts/Satoshi-latin-2.woff2"

def site_text():
    out = []
    for f in glob.glob("**/*.html", recursive=True) + glob.glob("**/*.css", recursive=True):
        if f.startswith((".deploy", "output", "design-system")):
            continue
        s = open(f, encoding="utf-8").read()
        s = re.sub(r"<(script|style)\b.*?</\1>", " ", s, flags=re.S | re.I)
        s = re.sub(r"<[^>]+>", " ", s)
        out.append(html.unescape(s))
    return "".join(out)

# Everything the pages render, plus printable ASCII so future copy edits and
# any JS-injected string are covered without a re-subset.
chars = set(site_text()) | set(chr(c) for c in range(0x20, 0x7F))
# CJK is not in this font at any size; leave it to the system stack.
chars = {c for c in chars if c.isprintable() and not unicodedata.category(c).startswith("C")
         and ord(c) < 0x2E80}
codes = sorted(ord(c) for c in chars)
print("%d codepoints" % len(codes))

open("/tmp/_satoshi_unicodes.txt", "w").write(",".join("U+%04X" % c for c in codes))
rc = os.system(
    sys.executable + " -m fontTools.subset %s --output-file=%s --flavor=woff2 "
    "--unicodes-file=/tmp/_satoshi_unicodes.txt --layout-features=* "
    "--no-hinting --desubroutinize" % (SRC, OUT))
if rc:
    sys.exit(rc)

from fontTools.ttLib import TTFont
have = set()
for t in TTFont(OUT)["cmap"].tables:
    have |= set(t.cmap)
missing = sorted(c for c in codes if c not in have)
print("%s -> %s  (%d -> %d bytes)" % (SRC, OUT, os.path.getsize(SRC), os.path.getsize(OUT)))
print("axes:", [a.axisTag for a in TTFont(OUT)["fvar"].axes] if "fvar" in TTFont(OUT) else "STATIC")
print("missing:", ["U+%04X %s" % (c, chr(c)) for c in missing] or "none")
