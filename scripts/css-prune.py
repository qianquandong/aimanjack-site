#!/usr/bin/env python3
"""Remove CSS rules that cannot match anything the site renders.

  python3 scripts/css-prune.py            report only
  python3 scripts/css-prune.py --write    rewrite style.css

A selector is dead when it names a class or id that appears in NO built HTML file. "Appears" is deliberately generous:
class="…" and id="…" attributes anywhere in the file (so markup that inline scripts build as strings counts), plus
className = '…' and classList.add/remove/toggle('…') in inline scripts. Element, attribute and pseudo selectors are never
judged. Classes inside :not(…) are ignored (an unused class there does not stop the rule matching).
Run `node scripts/build.mjs` first. Verify with scripts/shots.sh before/after + scripts/shots-diff.py: the output must be
pixel-identical, because a rule that matches nothing cannot change a pixel.
"""
import glob, re, sys

SKIP = ('.deploy/', 'output/', 'design-system/', 'node_modules/', 'scripts/')
html = ''.join(open(f, encoding='utf-8', errors='ignore').read() for f in glob.glob('**/*.html', recursive=True) if not f.startswith(SKIP))

used_cls, used_id = set(), set()
for m in re.finditer(r'class(?:Name)?\s*=\s*\\?["\']([^"\'\\]*)', html):
    used_cls.update(m.group(1).split())
for m in re.finditer(r'classList\.\w+\(([^)]*)\)', html):
    used_cls.update(re.findall(r'["\']([\w-]+)["\']', m.group(1)))
for m in re.finditer(r'\bid\s*=\s*\\?["\']([^"\'\\]+)', html):
    used_id.add(m.group(1))

css = open('style.css', encoding='utf-8').read()


def split_top(s, sep=','):
    out, depth, cur = [], 0, ''
    for ch in s:
        if ch in '([': depth += 1
        elif ch in ')]': depth -= 1
        if ch == sep and depth == 0:
            out.append(cur); cur = ''
        else:
            cur += ch
    out.append(cur)
    return out


def strip_not(sel):
    while True:
        i = sel.find(':not(')
        if i < 0: return sel
        depth, j = 0, i + 4
        while j < len(sel):
            if sel[j] == '(': depth += 1
            elif sel[j] == ')':
                depth -= 1
                if depth == 0: break
            j += 1
        sel = sel[:i] + sel[j + 1:]


def alive(sel):
    s = re.sub(r'\[[^\]]*\]', '', strip_not(sel))          # attribute values may contain dots
    s = re.sub(r'"[^"]*"|\'[^\']*\'', '', s)
    if any(c not in used_cls for c in re.findall(r'\.(-?[A-Za-z_][\w-]*)', s)): return False
    if any(i not in used_id for i in re.findall(r'#(-?[A-Za-z_][\w-]*)', s)): return False
    return True


removed = []


def process(block):
    """block = text at one nesting level → pruned text."""
    out, i, n = [], 0, len(block)
    while i < n:
        j = block.find('{', i)
        if j < 0:
            out.append(block[i:]); break
        depth, k = 1, j + 1
        while k < n and depth:
            if block[k] == '{': depth += 1
            elif block[k] == '}': depth -= 1
            k += 1
        prelude, body = block[i:j], block[j + 1:k - 1]
        # comments stay attached to whatever follows them
        lead = re.match(r'(\s*(?:/\*.*?\*/\s*)*)', prelude, re.S).group(1)
        head = prelude[len(lead):]
        if head.lstrip().startswith('@'):
            name = head.strip().split()[0].split('(')[0]
            if name in ('@media', '@supports'):
                inner = process(body)
                if inner.strip(): out.append(f'{lead}{head}{{{inner}}}')
                else: removed.append(head.strip() + ' { … } (emptied)')
            else:
                out.append(f'{lead}{head}{{{body}}}')       # @font-face, @keyframes…
        else:
            sels = split_top(head)
            keep = [s for s in sels if alive(s)]
            dead = [s.strip() for s in sels if not alive(s)]
            removed.extend(dead)
            if keep: out.append(f'{lead}{",".join(keep)}{{{body}}}')
            elif lead.strip(): out.append(lead)             # keep section comments even if their first rule died
        i = k
    return ''.join(out)


pruned = re.sub(r'\n{3,}', '\n\n', process(css))
print(f'used classes: {len(used_cls)}, ids: {len(used_id)}')
print(f'selectors removed: {len(removed)}')
print(f'style.css: {len(css):,} → {len(pruned):,} bytes ({100 - len(pruned) * 100 // len(css)}% smaller)')
if '--list' in sys.argv:
    for r in removed: print('  -', r[:120])
if '--write' in sys.argv:
    open('style.css', 'w', encoding='utf-8').write(pruned)
    print('written')
