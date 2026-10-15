import { HOME_LAYOUT } from './homeLayout.js';

// Side-panel copy for each prototype screen. Items are listed top to bottom as they appear.
export const SCREEN_NOTES = {
  home: {
    title: 'One Home screen for every event and category',
    lede: 'All 17 general categories sit one swipe from launch. Events are dated, sorted and never stale.',
    items: HOME_LAYOUT.map((s) => ({ id: s.id, label: s.label, note: s.note })),
    jumpable: true,
  },
  categories: {
    title: 'Every subcategory, two taps from anywhere',
    lede: 'A new Categories tab. Pick a category on the left; all of its subcategories show on the right with real card counts.',
    items: [
      { label: 'Search the whole tree', note: 'Filters 17 categories and 214 subcategories by name, so “retirement” finds At Work › Retirement.' },
      { label: 'Events & Holidays first', note: 'Top of the rail, badged with this week’s count. Its pane lists big holidays and the next 14 days.' },
      { label: 'Category rail', note: 'All 17 categories in one column; the selected one joins the pane like a tab.' },
      { label: 'See all', note: 'Opens the category page with a shelf for every subcategory.' },
      { label: 'Subcategory grid', note: 'Three across, each with its newest card as art and its card count.' },
    ],
  },
  category: {
    title: 'Every subcategory gets a shelf',
    lede: 'The m-site Birthday page shows cards for 3 of 25 subcategories and lists the other 22 as text at the bottom. Here each one gets a row.',
    items: [
      { label: 'Header', note: 'Name, subcategory and card counts, and the intro text behind “More”.' },
      { label: 'Sticky subcategory chips', note: 'All 25 with counts, pinned under the top bar while you scroll.' },
      { label: 'Most viewed', note: 'The four cards with the most views across the category.' },
      { label: 'A shelf per subcategory', note: 'Up to 6 cards with rating and views, and “All 85” to open it. No card repeats on the page.' },
      { label: 'Ads between shelves', note: 'One native ad after the 5th shelf and one after the 15th.' },
      { label: 'Other categories', note: 'A sideways jump at the end instead of a dead end.' },
    ],
  },
  subcategory: {
    title: 'Find the right card fast',
    lede: 'One subcategory as a 2-column grid. Sibling chips stay on top, so switching never needs the back button.',
    items: [
      { label: 'Breadcrumb', note: '“‹ Birthday” goes back to the category overview.' },
      { label: 'Sibling chips', note: 'The current subcategory is highlighted and scrolled into view.' },
      { label: 'Sort and filter', note: 'Popular (by views) or Latest, plus Video and Animated filters. These match the site’s Latest / Popular / Videos / GIF tabs.' },
      { label: '2-column grid', note: 'Art at a size you can judge, with rating, views and a favourite heart. One ad after the 8th card.' },
      { label: 'Progress', note: '“Showing 12 of 85” and Load more, instead of numbered pages.' },
      { label: 'Up next', note: 'The next subcategory, so the list never ends in a dead end.' },
    ],
  },
};

export const screenKey = (screen) =>
  screen.name === 'category' ? (screen.subId ? 'subcategory' : 'category') : screen.name;
