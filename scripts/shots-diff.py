#!/usr/bin/env python3
"""Pixel-compare two screenshot sets made by scripts/shots.sh.   python3 scripts/shots-diff.py <dirA> <dirB>
Exits 1 if any page differs; prints the bounding box and the share of differing pixels for each one."""
import os, sys
from PIL import Image, ImageChops

a, b = sys.argv[1], sys.argv[2]
names = sorted(set(os.listdir(a)) | set(os.listdir(b)))
bad = 0
for n in names:
    pa, pb = os.path.join(a, n), os.path.join(b, n)
    if not (os.path.exists(pa) and os.path.exists(pb)):
        print('MISSING ', n); bad += 1; continue
    ia, ib = Image.open(pa).convert('RGB'), Image.open(pb).convert('RGB')
    if ia.size != ib.size:
        print('SIZE    ', n, ia.size, ib.size); bad += 1; continue
    diff = ImageChops.difference(ia, ib)
    box = diff.getbbox()
    if box:
        px = sum(1 for p in diff.convert('L').getdata() if p)
        print(f'DIFF     {n}  bbox={box}  {px * 100 / (ia.size[0] * ia.size[1]):.3f}% of pixels'); bad += 1
print(f'{len(names) - bad} identical, {bad} different, {len(names)} compared')
sys.exit(1 if bad else 0)
