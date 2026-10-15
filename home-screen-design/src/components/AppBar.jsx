import React, { useState } from 'react';
import Icon from './Icon.jsx';
import { track } from '../lib/track.js';

const LOGO = 'https://c.123g.us/images/assets/images/123g-logo.png';

export default function AppBar({ searchHint, reminderCount, elevated }) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className={`appbar${elevated ? ' appbar--elevated' : ''}`}>
      <div className="appbar__row">
        {logoFailed ? (
          <span className="wordmark">123Greetings</span>
        ) : (
          <img className="appbar__logo" src={LOGO} alt="123Greetings" onError={() => setLogoFailed(true)} />
        )}
        <div className="appbar__actions">
          <button type="button" className="pro-pill" onClick={() => track('PAYWALL_OPEN', { from: 'home_appbar' })}>
            <Icon name="crown" size={15} strokeWidth={2.2} />
            Go Pro
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label={`Reminders, ${reminderCount} this week`}
            onClick={() => track('NAV_TAB_CLICK_REMINDERS', { from: 'home_bell' })}
          >
            <Icon name="bell" />
            {reminderCount > 0 && <span className="badge">{reminderCount}</span>}
          </button>
        </div>
      </div>
      <form
        className="search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          track('SEARCH_SUBMIT', { q: e.currentTarget.elements.q.value || searchHint });
        }}
      >
        <Icon name="search" size={19} />
        <input id="home-search" name="q" type="search" placeholder={`Search cards, e.g. “${searchHint}”`} />
      </form>
    </header>
  );
}
