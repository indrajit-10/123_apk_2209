import React from 'react';
import Img from './Img.jsx';
import Icon from './Icon.jsx';
import { track, slugEvent } from '../lib/track.js';

// Every general category in one horizontal rail at the top of Home. The first tile is Events,
// badged with how many events fall in the next 7 days, so the calendar is never more than one tap away.
export default function CategoryRail({ categories, eventsThisWeek, onOpen, onOpenEvents }) {
  return (
    <section className="cat-rail" aria-label="Categories">
      <ul className="rail rail--tight">
        <li>
          <button
            type="button"
            className="cat-chip cat-chip--events"
            onClick={() => {
              track('HOME_CATEGORY_CLICK_EVENTS', { position: 0 });
              onOpenEvents();
            }}
          >
            <span className="cat-chip__art cat-chip__art--events">
              <Icon name="calendar" size={28} strokeWidth={1.8} />
              <span className="badge badge--stamp">{eventsThisWeek}</span>
            </span>
            <span className="cat-chip__label">Events</span>
          </button>
        </li>
        {categories.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              className="cat-chip"
              onClick={() => {
                track(`HOME_CATEGORY_CLICK_${slugEvent(c.id)}`, { position: i + 1, href: c.href });
                onOpen(c.id);
              }}
            >
              <span className="cat-chip__art">
                <Img src={c.img} label={c.name} />
              </span>
              <span className="cat-chip__label">{c.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
