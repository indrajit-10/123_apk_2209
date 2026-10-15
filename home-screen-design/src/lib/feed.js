import { EVENTS, ONGOING, EVENT_CARDS } from '../data/snapshot.js';
import { daysUntil } from './dates.js';

// Picks the date-dependent content of the home feed for a given day. In the app this belongs on
// the home-feed API so editors maintain only the event calendar; the screen fills itself.
//
// weight 3 = flagship holiday (Halloween, Diwali, Thanksgiving), 2 = major day (Boss's Day),
// 1 = daily observance (Pasta Day).
export function buildEventFeed(today, { windowDays = 14 } = {}) {
  const upcoming = EVENTS.map((e) => ({ ...e, inDays: daysUntil(today, e.date) }))
    .filter((e) => e.inDays >= 0) // never show yesterday's events
    .sort((a, b) => a.inDays - b.inDays || b.weight - a.weight);

  const inWindow = upcoming.filter((e) => e.inDays < windowDays);

  const ongoing = ONGOING.map((o) => ({ ...o, endsIn: daysUntil(today, o.end) })).filter(
    (o) => daysUntil(today, o.start) <= 0 && o.endsIn >= 0,
  );

  const hasCards = (e) => Boolean(EVENT_CARDS[e.id]);

  // Nearest major day this week: gets a card rail directly under the events strip.
  const nearest = upcoming.find((e) => e.weight >= 2 && e.inDays <= 7 && hasCards(e)) ?? null;

  // Biggest holiday on the horizon: first hero slide, and a second spotlight further down.
  const flagship = upcoming.find((e) => e.weight === 3 && e.inDays <= 45) ?? null;
  const flagshipSpotlight =
    upcoming.find((e) => e.weight === 3 && e.id !== nearest?.id && hasCards(e)) ?? null;

  // Second hero slide: another major day in the next two weeks that has no spotlight of its own.
  const secondMajor =
    upcoming.find(
      (e) => e.weight >= 2 && e.inDays < windowDays && e.id !== nearest?.id && e.id !== flagship?.id,
    ) ?? null;

  const heroEvents = [flagship, secondMajor].filter(Boolean);

  return { upcoming, inWindow, ongoing, nearest, flagship, flagshipSpotlight, heroEvents };
}

export const eventCards = (id) => EVENT_CARDS[id] ?? { subcategories: [], cards: [] };
