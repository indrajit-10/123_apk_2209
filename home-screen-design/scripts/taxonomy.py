"""Build the category data for the Categories / Category / Sub-category screens.

usage: python3 scripts/taxonomy.py <cache-dir> <project-dir>

Writes
  src/data/taxonomy.js                 every category and sub-category, with card counts and lead art
                                       (stands in for the app's get_categories call)
  public/data/categories/<id>.json     first page of cards for each sub-category in one category
                                       (stands in for get_sub_categories_cards; loaded on demand)
"""
import html, json, os, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

CACHE, ROOT = sys.argv[1], sys.argv[2]
UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Mobile Safari/537.36"
os.makedirs(CACHE, exist_ok=True)

# Order, display names and art match the m-site homepage category grid.
TOP = [
    ("birthday", "Birthday", "birthday"), ("thank_you", "Thank You", "thankyou"),
    ("anniversary", "Anniversary", "anniversary"), ("general", "Everyday", "everyday"),
    ("love", "Love", "love"), ("encouragement_and_inspiration", "Inspirational", "inspiratinal"),
    ("congratulations", "Congrats", "congrats"), ("friendship", "Friendship", "friendship"),
    ("family", "Family", "family"), ("cute_cards", "Cute", "cute"), ("pets", "Pets", "pets"),
    ("business", "At Work", "at_work"), ("flowers", "Flowers", "flowers"), ("wedding", "Wedding", "wedding"),
    ("stay_in_touch", "Stay in Touch", "stay_in_touch"), ("invitations", "Invitation", "invitation"),
    ("world_languages", "World Languages", "world_language"),
]


def get(path):
    path = "/" + path.strip("/") + "/"
    f = os.path.join(CACHE, path.strip("/").replace("/", "__") + ".html")
    if not os.path.exists(f):
        subprocess.run(["curl", "-sS", "-A", UA, "-o", f, "https://m.123greetings.com" + path], check=False)
    return open(f, encoding="utf-8", errors="ignore").read() if os.path.exists(f) else ""


def clean(t):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", t or ""))).strip()


def img_pair(src):
    src = "https:" + src if src.startswith("//") else src
    m = re.match(r"https://i\.123g\.us/c/([^/]+)/(?:th|pc)/(\d+)_(?:th|pc)\.(\w+)$", src)
    if m:
        cat, n, ext = m.groups()
        return {"img": f"https://i.123g.us/c/{cat}/pc/{n}_pc.jpg", "thumb": src, "gif": ext == "gif"}
    return {"img": src, "thumb": src, "gif": src.endswith(".gif")}


def follow(href):
    """The m-site sends some sub-category links through a meta-refresh to a child page."""
    page = get(href)
    m = re.search(r'HTTP-EQUIV="Refresh"\s+CONTENT="0;\s*url=([^"]+)"', page, re.I)
    return get(m.group(1)) if m else page


def rest_tabs(page):
    i = page.find('class="restCategoriesTabs')
    if i < 0:
        return []
    seg = page[i:page.find("</section>", i)]
    out = []
    for h, t in re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', seg, re.S):
        name = clean(t)
        m = re.match(r"(.*?)\s*\((\d+) Cards?\)$", name)
        out.append({"href": h, "name": m.group(1) if m else name, "count": int(m.group(2)) if m else None})
    return out


def cards(page):
    out = []
    for m in re.finditer(r'<div class="card">\s*<a href="([^"]+)"[^>]*><img src="([^"]+)"[^>]*alt="([^"]*)".*?<p>(.*?)</p>(.*?)</div>\s*</div>', page, re.S):
        href, src, alt, blurb, bottom = m.groups()
        views = re.search(r'View Icon[^>]*>\s*([\d,]+)', bottom)
        rating = re.search(r'Star Icon[^>]*>\s*([\d.]+)/5', bottom)
        out.append({
            "title": clean(alt), "blurb": clean(blurb), "href": href, **img_pair(src),
            "views": int(views.group(1).replace(",", "")) if views else None,
            "rating": float(rating.group(1)) if rating else None,
            "video": "ytimg" in src or "youtube" in src,
        })
    return out


def world_language_cards(page):
    """World Languages still uses the old page layout: one list of cards tagged by language in the URL."""
    by_lang = {}
    for m in re.finditer(r'<li id="card-\d+">(.*?)</li>', page, re.S):
        li = m.group(1)
        href = re.search(r'href="(/world_languages/([a-z]+)/[^"]+\.html)"', li)
        src = re.search(r'<img src="([^"]+)"', li)
        if not (href and src):
            continue
        title = re.search(r"<h2><a[^>]*>(.*?)</a>", li, re.S)
        blurb = re.search(r"<h5><a[^>]*>(.*?)</a>", li, re.S)
        stats = re.search(r"([\d,]+) Views \| Rated ([\d.]+)", li)
        by_lang.setdefault(href.group(2), []).append({
            "title": clean(title.group(1) if title else ""), "blurb": clean(blurb.group(1) if blurb else ""),
            "href": href.group(1), **img_pair(src.group(1)),
            "views": int(stats.group(1).replace(",", "")) if stats else None,
            "rating": round(float(stats.group(2)), 1) if stats else None, "video": False,
        })
    return by_lang


def pages(page):
    i = page.find('class="pagination"')
    return len(re.findall(r'class="page-link"[^>]*>\d+<', page[i:i + 4000])) if i >= 0 else 1


def intro(page):
    m = re.search(r'class="topIntroSec.*?<h1[^>]*>(.*?)</h1>(.*?)<a[^>]+readBtn', page, re.S)
    if not m:
        return ""
    # The visible teaser and the "Read More" remainder are separate paragraphs; join them.
    paras = [clean(p) for p in re.findall(r"<p[^>]*>(.*?)</p>", m.group(2), re.S)]
    return re.sub(r"\s+([,.])", r"\1", " ".join(p for p in paras if p))


def sub_id(href):
    return href.strip("/").replace("/", "__")


index, per_category = [], {}
with ThreadPoolExecutor(8) as pool:
    for tid, name, art in TOP:
        page = get(tid)
        if tid == "world_languages":
            groups = world_language_cards(page)
            subs = [{"href": f"/world_languages/{lang}/", "name": lang.capitalize(), "count": None} for lang in groups]
            lists = [{"pages": 1, "cards": groups[lang]} for lang in groups]
        else:
            subs = rest_tabs(page)
            leaf_pages = list(pool.map(lambda s: follow(s["href"]), subs))
            lists = [{"pages": pages(p), "cards": cards(p)} for p in leaf_pages]
        sub_index = []
        for s, l in zip(subs, lists):
            lead = l["cards"][0] if l["cards"] else None
            sub_index.append({"id": sub_id(s["href"]), "name": s["name"], "href": s["href"], "count": s["count"],
                              "lead": {"img": lead["img"], "thumb": lead["thumb"]} if lead else None})
        index.append({"id": tid, "name": name, "href": f"/{tid}/",
                      "img": f"https://c.123g.us/images/assets/images/{art}.webp",
                      "about": intro(page), "subcategories": sub_index})
        per_category[tid] = {sub_id(s["href"]): l for s, l in zip(subs, lists)}
        print(f"{name:16} {len(sub_index):3} subcategories, {sum(s['count'] or 0 for s in sub_index):5} cards listed")

os.makedirs(os.path.join(ROOT, "public/data/categories"), exist_ok=True)
for tid, subs in per_category.items():
    with open(os.path.join(ROOT, f"public/data/categories/{tid}.json"), "w") as f:
        json.dump({"categoryId": tid, "subcategories": subs}, f, ensure_ascii=False, separators=(",", ":"))

with open(os.path.join(ROOT, "src/data/taxonomy.js"), "w") as f:
    f.write("// Category tree snapshot of m.123greetings.com taken 2026-10-15, generated by\n")
    f.write("// scripts/taxonomy.py. Stands in for the app's get_categories call. Do not hand-edit.\n\n")
    f.write(f"export const TAXONOMY = {json.dumps(index, indent=2, ensure_ascii=False)};\n")
print("subcategories total:", sum(len(c["subcategories"]) for c in index))
