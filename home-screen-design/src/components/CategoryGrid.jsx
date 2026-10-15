import React from 'react';
import Img from './Img.jsx';
import Icon from './Icon.jsx';
import SectionHeader from './SectionHeader.jsx';
import { track, slugEvent } from '../lib/track.js';

// End-of-feed catch-all: 17 categories plus three app destinations fill a 4 × 5 grid.
const EXTRA = [
  { id: 'events', name: 'Events & Holidays', icon: 'calendar' },
  { id: 'calendar', name: 'Calendar', icon: 'grid' },
  { id: 'app_exclusives', name: 'App Exclusives', icon: 'sparkle' },
];

export default function CategoryGrid({ categories }) {
  return (
    <section className="section">
      <SectionHeader title="All categories" />
      <ul className="cat-grid">
        {categories.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className="cat-chip"
              onClick={() => track(`HOME_GRID_CATEGORY_CLICK_${slugEvent(c.id)}`, { href: c.href })}
            >
              <span className="cat-chip__art">
                <Img src={c.img} label={c.name} />
              </span>
              <span className="cat-chip__label">{c.name}</span>
            </button>
          </li>
        ))}
        {EXTRA.map((x) => (
          <li key={x.id}>
            <button
              type="button"
              className="cat-chip"
              onClick={() => track(`HOME_GRID_CATEGORY_CLICK_${slugEvent(x.id)}`)}
            >
              <span className="cat-chip__art cat-chip__art--icon">
                <Icon name={x.icon} size={26} strokeWidth={1.7} />
              </span>
              <span className="cat-chip__label">{x.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
