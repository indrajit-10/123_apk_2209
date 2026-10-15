// Server-driven home layout: the API returns this ordered list, so the editorial team can reorder
// sections by season without an app release. `note` is shown in the prototype's section map only.
export const HOME_LAYOUT = [
  {
    id: 'categories',
    type: 'categoryRail',
    label: 'Category rail',
    note: 'All 17 general categories plus Events, one swipe from launch. Replaces the 4-item Quick Access.',
  },
  {
    id: 'hero',
    type: 'hero',
    label: 'Date-aware hero',
    note: 'Next flagship holiday with a countdown, another major day this fortnight, then App Exclusives.',
  },
  {
    id: 'events',
    type: 'events',
    days: 14,
    label: 'Events & holidays',
    note: '14-day date strip and every event in date order. Past events never show.',
  },
  {
    id: 'spotlight-nearest',
    type: 'eventSpotlight',
    pick: 'nearest',
    label: 'Spotlight: this week',
    note: 'Cards for the nearest major day, with its sub-categories.',
  },
  {
    id: 'just-to-say',
    type: 'justToSay',
    label: 'Just to say',
    note: '10 everyday sentiments as chips: high-intent and evergreen.',
  },
  {
    id: 'most-popular',
    type: 'cardRail',
    source: 'MOST_POPULAR',
    title: 'Most popular',
    ranked: true,
    analytics: { card: 'CARD_CLICK_MOST_POPULAR_CARDS', viewAll: 'CARD_VIEW_ALL_MOST_POPULAR_CARDS' },
    label: 'Most popular',
    note: 'Kept from today’s app, ranked so the order means something.',
  },
  { id: 'ad-1', type: 'nativeAd', label: 'Native ad', note: 'At most one ad slot per three sections.' },
  {
    id: 'spotlight-flagship',
    type: 'eventSpotlight',
    pick: 'flagship',
    label: 'Spotlight: big holiday',
    note: 'Cards for the next flagship holiday, starting weeks before the date.',
  },
  {
    id: 'birthday',
    type: 'birthday',
    analytics: { card: 'CARD_CLICK_HAPPY_BIRTHDAY', viewAll: 'CARD_VIEW_ALL_HAPPY_BIRTHDAY' },
    label: 'Birthday',
    note: 'Birthday is the top category, so it gets "for whom" chips and a video rail.',
  },
  {
    id: 'reminders',
    type: 'reminders',
    label: 'Reminders prompt',
    note: 'Contact birthdays bring people back on dates you cannot predict.',
  },
  {
    id: 'latest',
    type: 'cardRail',
    source: 'LATEST',
    title: 'Just added',
    analytics: { card: 'MASTER_CARD_CLICK_LATEST_CARDS', viewAll: 'CARD_VIEW_ALL_LATEST_CARDS' },
    label: 'Just added',
    note: 'Latest cards, kept from today’s app.',
  },
  { id: 'ad-2', type: 'nativeAd', label: 'Native ad', note: 'Second and last ad slot.' },
  {
    id: 'all-categories',
    type: 'categoryGrid',
    label: 'All categories',
    note: 'Full grid at the end of the feed for people who scroll that far.',
  },
];

// Birthday "for whom" chips, from the m.123greetings.com Birthdays menu.
export const BIRTHDAY_FOR = [
  { id: 'happy_birthday', name: 'Happy Birthday', href: '/birthday/happy_birthday/' },
  { id: 'mom_n_dad', name: 'Mom & Dad', href: '/birthday/mom_n_dad/' },
  { id: 'husband_and_wife', name: 'Husband & Wife', href: '/birthday/husband_and_wife/' },
  { id: 'sons_and_daughters', name: 'Son & Daughter', href: '/birthday/sons_and_daughters/' },
  { id: 'bro_n_sis', name: 'Brother & Sister', href: '/birthday/bro_n_sis/' },
  { id: 'friends', name: 'Friends', href: '/birthday/friends/' },
  { id: 'extended_family', name: 'Extended Family', href: '/birthday/extended_family/' },
  { id: 'birthday_fun', name: 'Funny', href: '/birthday/birthday_fun/' },
];

// Spotlight background tints per event (design layer, not content).
export const EVENT_TINT = {
  boss_day: '#EDF3FB',
  sweetest_day: '#FDEEF2',
  dussehra: '#FFF3E3',
  mother_in_law_day: '#F3EEFB',
  karva_chauth: '#FCEEEE',
  halloween: '#FFF0E3',
  diwali: '#FFF6DF',
  veterans_day: '#EEF2F7',
  thanksgiving: '#F8EFE4',
};
