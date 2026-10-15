import React from 'react';
import Icon from './Icon.jsx';
import { track } from '../lib/track.js';

// Today's four tabs plus Categories, so the full category tree is always one tap away.
// Events, Favourites and Reminders keep their current screens and are not part of this prototype.
const TABS = [
  { id: 'home', event: 'HOME', label: 'Home', icon: 'home' },
  { id: 'events', event: 'EVENTS', label: 'Events', icon: 'calendar' },
  { id: 'categories', event: 'CATEGORIES', label: 'Categories', icon: 'grid' },
  { id: 'favourites', event: 'FAVOURITES', label: 'Favourites', icon: 'heart' },
  { id: 'reminders', event: 'REMINDERS', label: 'Reminders', icon: 'alarm' },
];

export default function BottomNav({ active, onSelect, reminderCount = 0 }) {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => (
        <button
          type="button"
          key={t.id}
          className={`tab${t.id === active ? ' tab--on' : ''}`}
          aria-current={t.id === active ? 'page' : undefined}
          onClick={() => {
            track(`NAV_TAB_CLICK_${t.event}`);
            onSelect(t.id);
          }}
        >
          <span className="tab__icon">
            <Icon name={t.icon} size={23} />
            {t.id === 'reminders' && reminderCount > 0 && <span className="badge">{reminderCount}</span>}
          </span>
          <span className="tab__label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
