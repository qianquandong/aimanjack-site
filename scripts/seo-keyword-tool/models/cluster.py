"""Topic clustering: TF-IDF (pure Python) + cosine similarity + greedy agglomeration.

Input : list of dicts with at least {"keyword", "vol"} (vol used to pick the pillar).
Output: same dicts with "cluster_slug", "cluster_name", "role" (pillar|satellite),
        plus a clusters list [{slug, name, pillar, members, total_vol}].

scikit-learn is NOT required. If installed it is not used either — the corpus
is tiny (< 500 short strings) so a dict-based TF-IDF is faster to start up.
"""
from __future__ import annotations

import math
from collections import Counter, defaultdict

from common.text import slugify, tokenize


def _tfidf(docs: list[list[str]]) -> list[dict[str, float]]:
    n = len(docs)
    df: Counter[str] = Counter()
    for toks in docs:
        df.update(set(toks))
    vecs: list[dict[str, float]] = []
    for toks in docs:
        tf = Counter(toks)
        total = sum(tf.values()) or 1
        vec = {}
        for t, c in tf.items():
            idf = math.log((1 + n) / (1 + df[t])) + 1.0
            vec[t] = (c / total) * idf
        norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
        vecs.append({t: v / norm for t, v in vec.items()})
    return vecs


def _cos(a: dict[str, float], b: dict[str, float]) -> float:
    if len(a) > len(b):
        a, b = b, a
    return sum(v * b.get(t, 0.0) for t, v in a.items())


def _centroid(vecs: list[dict[str, float]]) -> dict[str, float]:
    acc: dict[str, float] = defaultdict(float)
    for v in vecs:
        for t, x in v.items():
            acc[t] += x
    n = len(vecs) or 1
    c = {t: x / n for t, x in acc.items()}
    norm = math.sqrt(sum(v * v for v in c.values())) or 1.0
    return {t: v / norm for t, v in c.items()}


def cluster(rows: list[dict], lang: str, *, threshold: float = 0.32, min_size: int = 1,
            max_clusters: int | None = None) -> tuple[list[dict], list[dict]]:
    if not rows:
        return rows, []
    docs = [tokenize(r["keyword"], lang) for r in rows]
    vecs = _tfidf(docs)

    # process important keywords first so they seed clusters
    order = sorted(range(len(rows)), key=lambda i: (-float(rows[i].get("vol") or 0), len(rows[i]["keyword"])))
    clusters: list[list[int]] = []
    for i in order:
        best, best_sim = -1, 0.0
        for ci, members in enumerate(clusters):
            sim = sum(_cos(vecs[i], vecs[j]) for j in members) / len(members)   # average linkage
            if sim > best_sim:
                best, best_sim = ci, sim
        if best >= 0 and best_sim >= threshold:
            clusters[best].append(i)
        else:
            clusters.append([i])

    # second pass: merge clusters whose centroids are close
    merged = True
    while merged:
        merged = False
        cents = [_centroid([vecs[j] for j in m]) for m in clusters]
        for a in range(len(clusters)):
            for b in range(a + 1, len(clusters)):
                if _cos(cents[a], cents[b]) >= threshold + 0.1:
                    clusters[a].extend(clusters.pop(b))
                    merged = True
                    break
            if merged:
                break

    # optional cap: fold the smallest clusters into their nearest neighbour
    if max_clusters and len(clusters) > max_clusters:
        while len(clusters) > max_clusters:
            clusters.sort(key=len)
            small = clusters.pop(0)
            cents = [_centroid([vecs[j] for j in m]) for m in clusters]
            sc = _centroid([vecs[j] for j in small])
            best = max(range(len(clusters)), key=lambda k: _cos(sc, cents[k]))
            clusters[best].extend(small)

    # attach misc singletons if requested
    if min_size > 1:
        keep, misc = [], []
        for m in clusters:
            (keep if len(m) >= min_size else misc).append(m)
        if misc:
            keep.append([i for m in misc for i in m])
        clusters = keep

    out_clusters: list[dict] = []
    used_slugs: set[str] = set()
    for members in clusters:
        pillar_i = max(members, key=lambda i: (float(rows[i].get("vol") or 0), -len(rows[i]["keyword"])))
        pillar = rows[pillar_i]["keyword"]
        slug = slugify(pillar) or "cluster"
        base, n = slug, 2
        while slug in used_slugs:
            slug, n = f"{base}-{n}", n + 1
        used_slugs.add(slug)
        total_vol = int(sum(float(rows[i].get("vol") or 0) for i in members))
        for i in members:
            rows[i]["cluster_slug"] = slug
            rows[i]["cluster_name"] = pillar
            rows[i]["role"] = "pillar" if i == pillar_i else "satellite"
        out_clusters.append({
            "slug": slug, "name": pillar, "pillar": pillar,
            "members": [rows[i]["keyword"] for i in sorted(members, key=lambda i: -float(rows[i].get("vol") or 0))],
            "total_vol": total_vol, "size": len(members),
        })
    out_clusters.sort(key=lambda c: -c["total_vol"])
    return rows, out_clusters
