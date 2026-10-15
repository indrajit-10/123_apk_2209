import React, { useEffect, useMemo, useRef, useState } from 'react';
import AppBar from '../components/AppBar.jsx';
import CategoryRail from '../components/CategoryRail.jsx';
import HeroCarousel from '../components/HeroCarousel.jsx';
import EventsSection from '../components/EventsSection.jsx';
import EventSpotlight from '../components/EventSpotlight.jsx';
import JustToSay from '../components/JustToSay.jsx';
import CardRail from '../components/CardRail.jsx';
import BirthdayHub from '../components/BirthdayHub.jsx';
import RemindersPrompt from '../components/RemindersPrompt.jsx';
import NativeAd from '../components/NativeAd.jsx';
import CategoryGrid from '../components/CategoryGrid.jsx';
import { HOME_LAYOUT, BIRTHDAY_FOR } from '../data/homeLayout.js';
import * as content from '../data/snapshot.js';
import { TAXONOMY } from '../data/taxonomy.js';
import { buildEventFeed, eventCards } from '../lib/feed.js';
import { track } from '../lib/track.js';
import { useNav } from '../nav.js';
import { routeForHref } from '../lib/route.js';

const REMINDER_COUNT = 0; // signed-out state; the bell and tab show a badge once reminders exist

function spotlightEvent(section, feed) {
  return section.pick === 'nearest' ? feed.nearest : feed.flagshipSpotlight;
}

function sourceCards(section, feed) {
  switch (section.type) {
    case 'eventSpotlight': {
      const event = spotlightEvent(section, feed);
      return event ? eventCards(event.id).cards : [];
    }
    case 'cardRail':
      return content[section.source];
    case 'birthday':
      return content.BIRTHDAY_VIDEOS;
    default:
      return null;
  }
}

// Walks the layout top to bottom and drops any card an earlier section already shows, so every
// card on Home is a distinct chance to be tapped. (The m-site repeats 10 of its 15 birthday videos.)
function dedupeCards(layout, feed) {
  const used = new Set();
  const out = {};
  for (const section of layout) {
    const cards = sourceCards(section, feed);
    if (!cards) continue;
    out[section.id] = cards.filter((c) => !used.has(c.href));
    out[section.id].forEach((c) => used.add(c.href));
  }
  return out;
}

function Section({ section, feed, today, cards, nav }) {
  const openCategory = (categoryId) => nav.open({ name: 'category', categoryId, subId: null });
  const openHref = (href) => {
    const route = routeForHref(href);
    if (route) nav.open(route);
  };
  switch (section.type) {
    case 'categoryRail':
      return (
        <CategoryRail
          categories={TAXONOMY}
          eventsThisWeek={feed.upcoming.filter((e) => e.inDays < 7).length}
          onOpen={openCategory}
          onOpenEvents={() => nav.tab('categories', { name: 'categories', selected: 'events' })}
        />
      );
    case 'hero':
      return <HeroCarousel events={feed.heroEvents} />;
    case 'events':
      return <EventsSection today={today} days={section.days} events={feed.inWindow} ongoing={feed.ongoing} />;
    case 'eventSpotlight':
      return <EventSpotlight event={spotlightEvent(section, feed)} cards={cards} />;
    case 'justToSay':
      return <JustToSay items={content.JUST_TO_SAY} onOpen={openHref} />;
    case 'cardRail':
      return <CardRail title={section.title} cards={cards} ranked={section.ranked} analytics={section.analytics} />;
    case 'birthday':
      return <BirthdayHub relations={BIRTHDAY_FOR} cards={cards} analytics={section.analytics} onOpen={openHref} />;
    case 'reminders':
      return <RemindersPrompt />;
    case 'nativeAd':
      return <NativeAd />;
    case 'categoryGrid':
      return (
        <CategoryGrid
          categories={TAXONOMY}
          onOpen={openCategory}
          onOpenEvents={() => nav.tab('categories', { name: 'categories', selected: 'events' })}
        />
      );
    default:
      return null;
  }
}

export default function HomeScreen({ today, layout = HOME_LAYOUT }) {
  const nav = useNav();
  const feed = useMemo(() => buildEventFeed(today), [today]);
  const cardsBySection = useMemo(() => dedupeCards(layout, feed), [layout, feed]);
  const scrollRef = useRef(null);
  const [elevated, setElevated] = useState(false);

  // One impression per section per visit: the number that shows whether events and categories
  // are actually being seen, not just placed.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !('IntersectionObserver' in window)) return undefined;
    const seen = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.dataset.section;
          if (entry.isIntersecting && !seen.has(id)) {
            seen.add(id);
            track('HOME_SECTION_IMPRESSION', { section: id, position: layout.findIndex((s) => s.id === id) });
          }
        }
      },
      { root, threshold: 0.5 },
    );
    root.querySelectorAll('[data-section]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [layout, today]);

  return (
    <div className="screen__scroll" ref={scrollRef} onScroll={(e) => setElevated(e.currentTarget.scrollTop > 4)}>
      <AppBar searchHint={feed.nearest?.name ?? 'birthday for mom'} reminderCount={REMINDER_COUNT} elevated={elevated} />
      {layout.map((section) => (
        <div key={section.id} data-section={section.id} className="feed-block">
          <Section section={section} feed={feed} today={today} cards={cardsBySection[section.id]} nav={nav} />
        </div>
      ))}
      <p className="feed-end">That’s everything for today. New cards land every week.</p>
    </div>
  );
}
