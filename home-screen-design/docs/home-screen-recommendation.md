# Home screen recommendation for the 123Greetings app (com.g123)

Snapshot taken **Thu, Oct 15, 2026**. Sources:

- `www.123greetings.com` and `m.123greetings.com` homepages, plus the m-site event calendar and event pages, fetched that day.
- The APK unpacked in this repo: `com.g123` v1.181 (versionCode 1320), Expo SDK 54 / React Native with a Hermes bundle (`assets/index.android.bundle`).

App findings come from the analytics event names and screen names compiled into the bundle. I did not run the app, so treat that column as a reading of the code rather than a screenshot.

![Proposed first screen](screenshots/first-screen.jpg)

## Summary

1. **Put breadth at the top.** One horizontal rail with an Events tile plus all 17 general categories replaces today's 4-tile Quick Access. Every category is one swipe from launch.
2. **Drive events by date.** Show a 14-day date strip over one rail of every event in that window, sorted by date. Past events never show, and the next big holiday gets the first hero slide with a countdown.
3. **Give holidays shelf space.** Add two spotlight bands, one for the nearest major day this week and one for the next flagship holiday, each with sub-category chips and real cards.
4. **Cut repetition and ad load.** No card appears twice on Home. Use at most two native ad slots (the m-site has six) and never place one above the events section.
5. **Serve the layout from the API.** Editors reorder sections per season without an app release, and a per-section impression event shows whether events and categories are actually being seen.

## What each surface does today

| | www.123greetings.com | m.123greetings.com | App (com.g123 v1.181) |
|---|---|---|---|
| **Navigation** | Top menu: 11 categories + Events & Holidays. Second row: 6 sub-category shortcuts + Calendar | Hamburger drawer: Birthdays (7), Occasions (8), Holidays (6 + calendar), Just To Say (10) | Bottom tabs: Home, Events, Favourites, Reminders |
| **Categories on Home** | Menu plus a "Popular Now" strip: Happy Birthday, 3 events from the next two days, 10 evergreen categories | Grid of all 17 general categories, directly under the hero | 4 Quick Access tiles: Birthday, Anniversary, Holidays, Occasions |
| **Events on Home** | 5 "Upcoming Events" with blurbs: Halloween, Boss's Day, Sweetest Day, Say 'Hey' Day, Autumn | 15 events, but below the hero, the category grid, 3 card rails and 3 ad slots | None found on Home; events live in the Events tab |
| **Event order** | Editorial (Halloween first, 16 days out) | Unsorted: Oct 16, 17, 20, 14, 14, 16, 16, 17, 18, 20, 21, 21, 22, 23, 17 | n/a |
| **Card rails** | Birthday (3), Most Popular (3), Latest (3) | Most Popular (15), Latest (4), Birthday Videos (15), Just To Say (10), Highest Rated (4), Most Viewed (4) | Hero ("mantle"), Latest, Most Popular, App Exclusives, Happy Birthday |
| **Ads on Home** | 2 slots | 6 slots (top banner + 5 MREC) | GAM banner, native, interstitial, app-open and rewarded unit IDs in the bundle |
| **Search** | Field in the header | Icon only | Search screen (`SEARCH_SUBMIT`) |

App evidence (from `assets/index.android.bundle`): `QUICK_ACCESS_CLICK_{BIRTHDAY,ANNIVERSARY,HOLIDAYS,OCCASIONS}`, `CARD_CLICK_MOST_POPULAR_CARDS`, `CARD_CLICK_HAPPY_BIRTHDAY`, `MASTER_CARD_CLICK_LATEST_CARDS`, `CARD_VIEW_ALL_{LATEST_CARDS,MOST_POPULAR_CARDS,APP_EXCLUSIVES,HAPPY_BIRTHDAY}`, `MANTLE_CLICK_APP_EXCLUSIVE`, `NAV_TAB_CLICK_{HOME,EVENTS,FAVOURITES,REMINDERS}`, `CATEGORY_PAGE_VIEW_{HOLIDAYS,OCCASIONS}`, and the screens `EventsTabScreen`, `cardCategoriesScreen`, `cardSubcategoriesScreen`, `SearchScreen`, `FavouritesScreen`.

### What each one gets right

- **Desktop** treats events editorially: the biggest holiday leads, and each event has a one-line reason to send. The "Popular Now" strip mixes today's events with evergreen categories in a single row.
- **Mobile web** shows every general category above the fold and has the most complete set of rails, including Just To Say.
- **The app** has what neither site has: reminders backed by contacts, favourites, push notifications and App Exclusives.

### Problems worth fixing

1. **Events are buried or missing.** On the m-site, Events & Holidays comes after the hero, the category grid, Most Popular, Latest, Birthday Videos and 3 ad slots. On app Home it isn't present at all, so users have to know to open the Events tab.
2. **The m-site event list is wrong for the day.** On Oct 15 it showed two events from Oct 14 (Dessert Day, National I Love You Day). It isn't in date order, and it leaves out Halloween, the biggest event of the month.
3. **Birthday crowds out everything else.** 13 of the 15 Most Popular cards are birthday or birthday-thank-you cards, and 10 of the 15 Birthday Videos repeat Most Popular cards.
4. **Stale rails.** Highest Rated led with "A Cat's Guide to Christmas!" in mid-October.
5. **App Home has only 4 entry points.** Thank You (second in both sites' menus), Love, Congrats, Friendship and the rest are 2+ taps away, behind "Occasions".

## Recommended Home, top to bottom

The working prototype is in this folder (`npm run dev`). The full feed is in [screenshots/full-feed.jpg](screenshots/full-feed.jpg).

| # | Section | What it shows | Why | Analytics |
|---|---|---|---|---|
| 1 | App bar | Logo, Go Pro, reminders bell; search hint uses the nearest event ("Search cards, e.g. 'Boss's Day'") | Search stays visible and seasonal | `SEARCH_SUBMIT` (existing) |
| 2 | Category rail | Events tile (badge = events in the next 7 days) + all 17 general categories | Every category is one swipe from launch | `HOME_CATEGORY_CLICK_<ID>` |
| 3 | Hero | Slide 1: next flagship holiday within 45 days, with a countdown. Slide 2: another major day this fortnight. Slide 3: App Exclusives | The most valuable sends, ordered by date | `MANTLE_CLICK_<ID>` (existing prefix) |
| 4 | Events & holidays | 14-day date strip (dots = events per day, empty days disabled), one rail of every event in date order with postage-stamp dates and "Today / Tomorrow / In n days", then "Happening now" chips for multi-day observances | Full calendar coverage on the first screen | `EVENT_DATE_CLICK`, `EVENT_CARD_CLICK_<ID>` |
| 5 | Spotlight: this week | Nearest major day within 7 days, with its sub-categories and 10 cards | An event gets a shelf of cards, not a single link | `EVENT_SPOTLIGHT_CARD_CLICK_<ID>` |
| 6 | Just to say | 10 chips: I Love You, Thanks, Thinking of You, Good Morning… | Evergreen, high-intent, about 100pt tall | `JUST_TO_SAY_CLICK_<ID>` |
| 7 | Most popular | Ranked rail | Kept from today's app | `CARD_CLICK_MOST_POPULAR_CARDS` (existing) |
| 8 | Native ad | GAM native unit | First ad slot, after 7 sections | |
| 9 | Spotlight: big holiday | Next flagship holiday (Halloween → Diwali → Thanksgiving), up to 45 days out | Big holidays need weeks of exposure | `EVENT_SPOTLIGHT_*` |
| 10 | Birthday | "For whom" chips (Mom & Dad, Husband & Wife…) + birthday videos | Birthday is the top category, so it gets its own hub | `CARD_CLICK_HAPPY_BIRTHDAY` (existing) |
| 11 | Reminders prompt | "Never miss a birthday": add birthdays from contacts | Brings people back on dates you can't predict; the app already asks for contacts | `REMINDERS_PROMPT_*` |
| 12 | Just added | Latest cards | Kept from today's app | `MASTER_CARD_CLICK_LATEST_CARDS` (existing) |
| 13 | Native ad | GAM native unit | Second and last ad slot | |
| 14 | All categories | 4 × 5 grid: 17 categories + Events & Holidays, Calendar, App Exclusives | Catch-all for people who scroll to the end | `HOME_GRID_CATEGORY_CLICK_<ID>` |

**Bottom tabs:** Home · Events · **Categories** (new) · Favourites · Reminders. The full category tree is then one tap away from every screen.

## Rules for the date-aware feed

These belong on the home-feed API. The reference implementation is `src/lib/feed.js`, plus `dedupeCards` in `src/HomeScreen.jsx`.

- **Weights:** 3 = flagship holiday (Halloween, Diwali, Thanksgiving, Christmas…), 2 = major day (Boss's Day, Sweetest Day, Dussehra, Karva Chauth…), 1 = daily observance (Pasta Day, Mole Day…).
- **Never show past events.** Compare against the device's local date.
- **Sort** by date, then by weight.
- **Hero:** slide 1 is the first weight-3 event within 45 days. Slide 2 is the first weight ≥ 2 event within 14 days that isn't slide 1 or the week's spotlight. Slide 3 is App Exclusives.
- **Spotlights:** A is the first weight ≥ 2 event within 7 days that has cards. B is the first weight-3 event that isn't A.
- **No card twice:** walk the sections top to bottom and skip any card an earlier section already shows.
- **Ads:** at most two native slots, never above the events section.

Example payload for Oct 15:

```json
{
  "date": "2026-10-15",
  "sections": [
    { "id": "categories", "type": "categoryRail" },
    { "id": "hero", "type": "hero", "events": ["halloween", "sweetest_day"], "appExclusive": true },
    { "id": "events", "type": "events", "days": 14 },
    { "id": "spotlight-nearest", "type": "eventSpotlight", "event": "boss_day" },
    { "id": "just-to-say", "type": "justToSay" },
    { "id": "most-popular", "type": "cardRail", "source": "most_popular", "ranked": true },
    { "id": "ad-1", "type": "nativeAd" },
    { "id": "spotlight-flagship", "type": "eventSpotlight", "event": "halloween" },
    { "id": "birthday", "type": "birthday" },
    { "id": "reminders", "type": "reminders" },
    { "id": "latest", "type": "cardRail", "source": "latest" },
    { "id": "ad-2", "type": "nativeAd" },
    { "id": "all-categories", "type": "categoryGrid" }
  ]
}
```

## What to measure

- `HOME_SECTION_IMPRESSION {section, position}`, fired once per section per visit (already wired in the prototype). Tracks the share of sessions that see the events section and each spotlight, which shows whether exposure actually improved.
- Distinct categories opened from Home per week. Today's Quick Access can only produce 4.
- Event card taps and sends per event in the 7 days before each event date.
- `CARD_CLICK_MOST_POPULAR_CARDS` against today's baseline, to confirm the new sections don't cannibalise the rail that already works.

## Notes on the prototype

- Content is a snapshot of m.123greetings.com from Oct 15, 2026: the October 2026 calendar plus Diwali, Veterans Day and Thanksgiving. The "Wed, Oct 28" preview shows early-November days as empty because the snapshot has no November daily events.
- It's React for the web so it can be reviewed in a browser. Each component maps directly to React Native: horizontal rails become `FlatList horizontal`, the feed becomes a `FlatList` of sections, and `Img` becomes `expo-image` with a placeholder.
