"""Build src/data/snapshot.js for the home-screen prototype from m.123greetings.com pages."""
import html, json, os, re, subprocess, sys

# usage: python3 scripts/snapshot.py <cache-dir> src/data/snapshot.js
SCR = sys.argv[1]          # cache dir for fetched pages (created if missing)
OUT = sys.argv[2]          # output JS path
UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Mobile Safari/537.36"

os.makedirs(os.path.join(SCR, "ev"), exist_ok=True)

def get(path):
    f = os.path.join(SCR, "ev", (path.strip("/").replace("/", "_") or "home") + ".html")
    if not os.path.exists(f):
        subprocess.run(["curl", "-sS", "-A", UA, "-o", f, f"https://m.123greetings.com/{path.strip('/')}/"], check=True)
    return open(f, encoding="utf-8", errors="ignore").read()

def clean(t):
    return html.unescape(re.sub(r"<[^>]+>", "", t or "")).strip()

def img_pair(src):
    src = "https:" + src if src.startswith("//") else src
    m = re.match(r"https://i\.123g\.us/c/([^/]+)/(?:th|pc)/(\d+)_(?:th|pc)\.\w+$", src)
    if m:
        cat, n = m.groups()
        return {"img": f"https://i.123g.us/c/{cat}/pc/{n}_pc.jpg", "thumb": f"https://i.123g.us/c/{cat}/th/{n}_th.jpg"}
    return {"img": src, "thumb": src}

def title_case(slug):
    return " ".join(w if w in ("n", "and", "to", "of") else w.capitalize() for w in slug.split("_")).replace(" N ", " & ")

# (id, name, ISO date, weight)  weight 3 = flagship holiday, 2 = major day, 1 = daily observance
EVENTS = [
    ("dessert_day", "Dessert Day", "2026-10-14", 1),
    ("national_iloveyou_day", "National I Love You Day", "2026-10-14", 1),
    ("world_students_day", "World Students' Day", "2026-10-15", 1),
    ("world_food_day", "World Food Day", "2026-10-16", 1),
    ("liqueur_day", "Liqueur Day", "2026-10-16", 1),
    ("boss_day", "Boss's Day", "2026-10-16", 2),
    ("pasta_day", "Pasta Day", "2026-10-17", 1),
    ("sweetest_day", "Sweetest Day", "2026-10-17", 2),
    ("chocolate_cupcake_day", "Chocolate Cupcake Day", "2026-10-18", 1),
    ("national_chess_day", "National Chess Day", "2026-10-20", 1),
    ("dussehra", "Dussehra", "2026-10-20", 2),
    ("pumpkin_cheesecake_day", "Pumpkin Cheesecake Day", "2026-10-21", 1),
    ("national_heroes_day", "National Heroes Day", "2026-10-21", 1),
    ("national_nut_day", "National Nut Day", "2026-10-22", 1),
    ("mole_day", "Mole Day", "2026-10-23", 1),
    ("united_nations_day", "United Nations Day", "2026-10-24", 1),
    ("say_hey_day", "Say 'Hey' Day", "2026-10-25", 1),
    ("mother_in_law_day", "Mother in Law Day", "2026-10-25", 2),
    ("pumpkin_day", "Pumpkin Day", "2026-10-26", 1),
    ("chocolate_day", "Chocolate Day", "2026-10-28", 1),
    ("national_oatmeal_day", "National Oatmeal Day", "2026-10-29", 1),
    ("national_cat_day", "National Cat Day", "2026-10-29", 1),
    ("karva_chauth", "Karva Chauth", "2026-10-29", 2),
    ("bring_your_jackolantern_to_work_day", "Bring Your Jack-o'-lantern to Work Day", "2026-10-29", 1),
    ("candy_corn_day", "Candy Corn Day", "2026-10-30", 1),
    ("samhain", "Samhain", "2026-10-31", 1),
    ("halloween", "Halloween", "2026-10-31", 3),
    ("diwali", "Diwali", "2026-11-08", 3),
    ("veterans_day", "Veterans Day", "2026-11-11", 2),
    ("thanksgiving", "Thanksgiving", "2026-11-26", 3),
]
ONGOING = [
    ("fall", "Autumn", "2026-09-22", "2026-12-21"),
    ("navratri", "Navratri", "2026-10-11", "2026-10-20"),
    ("durga_puja", "Durga Puja", "2026-10-17", "2026-10-21"),
    ("national_dessert_month", "National Dessert Month", "2026-10-01", "2026-10-31"),
    ("national_cookie_month", "Cookie Month", "2026-10-01", "2026-10-31"),
]

def event_page(slug):
    s = get(f"events/{slug}")
    cards, seen = [], set()
    for m in re.finditer(r'<a[^>]+href="(/events/[^"]+\.html)"[^>]*>\s*<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"', s):
        href, src, alt = m.groups()
        if href in seen or "/c/" not in src:
            continue
        seen.add(href)
        cards.append({"title": clean(alt), "href": href, **img_pair(src)})
    subs = []
    for sub in re.findall(rf'href="/events/{slug}/([a-z0-9_]+)/"', s):
        if sub not in subs:
            subs.append(sub)
    lead = cards[0] if cards else None
    if not lead:
        m = re.search(r'<img[^>]+src="((?:https:)?//i\.123g\.us/c/[^"]+)"', s)
        lead = img_pair(m.group(1)) if m else {}
    return cards, [{"id": x, "name": title_case(x)} for x in subs[:6]], lead

# Lead images already chosen on the m-site homepage events rail beat a page's first card.
home = get("")
sec = lambda cls: home[home.find(f'class="{cls}'):home.find("<section", home.find(f'class="{cls}') + 10)]
home_event_img = {m.group(1): img_pair(m.group(2)) for m in re.finditer(r'href="/events/([a-z0-9_]+)/"[^>]*>\s*<img[^>]+src="([^"]+)"', sec("eventsHolidaySec"))}

events, event_cards = [], {}
for eid, name, date, weight in EVENTS:
    cards, subs, lead = event_page(eid)
    imgs = home_event_img.get(eid) or {k: lead.get(k) for k in ("img", "thumb") if lead.get(k)}
    events.append({"id": eid, "name": name, "date": date, "weight": weight, "href": f"/events/{eid}/", "cardCount": len(cards), **imgs})
    if weight >= 2 and cards:
        event_cards[eid] = {"subcategories": subs, "cards": cards[:10]}
ongoing = []
for oid, name, start, end in ONGOING:
    cards, _, lead = event_page(oid)
    imgs = home_event_img.get(oid) or {k: lead.get(k) for k in ("img", "thumb") if lead.get(k)}
    ongoing.append({"id": oid, "name": name, "start": start, "end": end, "href": f"/events/{oid}/", **imgs})

def rail(cls, full_titles=None):
    out = []
    for m in re.finditer(r'<a[^>]+href="([^"]+)"[^>]*>\s*<img[^>]+src="([^"]+)"[^>]*>.*?<h3[^>]*>(.*?)</h3>\s*(?:<p[^>]*>(.*?)</p>)?', sec(cls), re.S):
        href, src, t, d = m.groups()
        title = clean(t)
        if full_titles and title.endswith("...") and href in full_titles:
            title = full_titles[href]
        out.append({"title": title, "blurb": clean(d), "href": href, **img_pair(src)})
    return out

videos = rail("birthdayVideoSec")
full = {c["href"]: c["title"] for c in videos}
popular = rail("mostPopularEcard", full)
latest = rail("commonViewEcardSec bg-light-gray", full)
for c in latest:
    if c["title"].endswith("..."):
        c["title"] = {"get_them_into_the_halloween_spirit_1": "Get Them Into The Halloween Spirit",
                      "send_them_a_fun_filled_halloween_wish": "Send Them A Fun Filled Halloween Wish"}.get(c["href"].rsplit("/", 1)[-1][:-5], c["title"])
for c in popular:
    if c["title"].endswith("...") and "halloween" in c["href"]:
        c["title"] = "Send Them A Fun Filled Halloween Wish"
    if c["title"] == "Send Thanks For Sweet...":
        c["title"] = "Send Thanks For Sweet Birthday Wishes"
    if c["title"] == "A Thank You Hug For Loved...":
        c["title"] = "A Thank You Hug For Loved Ones"
    if c["title"] == "Aging Like Fine Wine Funny...":
        c["title"] = "Aging Like Fine Wine Funny Birthday Wish"

cats = [{"id": m.group(1).strip("/").replace("/", "_"), "name": clean(m.group(3)), "href": m.group(1), "img": m.group(2)}
        for m in re.finditer(r'<a href="([^"]+)"><img src="([^"]+)"[^>]*></a>\s*<h2><a[^>]*>(.*?)</a>', sec("gerenalEvents"))]
just = [{"id": m.group(1).strip("/").replace("/", "_"), "name": clean(m.group(3)), "href": m.group(1), **img_pair(m.group(2))}
        for m in re.finditer(r'<a[^>]+href="([^"]+)"[^>]*>\s*<img[^>]+src="([^"]+)"[^>]*>.*?<h3[^>]*>(?:<a[^>]*>)?(.*?)</', sec("justToSaySec"), re.S)]

data = {
    "CATEGORIES": cats, "EVENTS": events, "ONGOING": ongoing, "EVENT_CARDS": event_cards,
    "MOST_POPULAR": popular, "LATEST": latest, "BIRTHDAY_VIDEOS": videos, "JUST_TO_SAY": just,
}
with open(OUT, "w") as f:
    f.write("// Content snapshot of m.123greetings.com taken 2026-10-15 (categories, October 2026 calendar,\n")
    f.write("// card rails). Stands in for the app's home-feed API so the prototype renders real content.\n")
    f.write("// Regenerate rather than hand-edit.\n\n")
    for k, v in data.items():
        f.write(f"export const {k} = {json.dumps(v, indent=2, ensure_ascii=False)};\n\n")
print({k: len(v) for k, v in data.items()})
print("event cards:", {k: len(v["cards"]) for k, v in event_cards.items()})
