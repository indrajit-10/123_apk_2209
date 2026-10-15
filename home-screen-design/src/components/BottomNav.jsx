import React from 'react';
import Icon from './Icon.jsx';
import { track } from '../lib/track.js';

// Today's four tabs plus Categories, so the full category tree is always one tap away.
const TABS = [
  { id: 'HOME', label: 'Home', icon: 'home' },
  { id: 'EVENTS', label: 'Events', icon: 'calendar' },
  { id: 'CATEGORIES', label: 'Categories', icon: 'grid', isNew: true },
  { id: 'FAVOURITES', label: 'Favourites', icon: 'heart' },
  { id: 'REMINDERS', label: 'Reminders', icon: 'alarm' },
];

export default function BottomNav({ reminderCount }) {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => (
        <button
          type="button"
          key={t.id}
          className={`tab${t.id === 'HOME' ? ' tab--on' : ''}`}
          aria-current={t.id === 'HOME' ? 'page' : undefined}
          onClick={() => track(`NAV_TAB_CLICK_${t.id}`)}
        >
          <span className="tab__icon">
            <Icon name={t.icon} size={23} />
            {t.id === 'REMINDERS' && reminderCount > 0 && <span className="badge">{reminderCount}</span>}
          </span>
          <span className="tab__label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
