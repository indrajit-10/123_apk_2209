import React, { useEffect, useState } from 'react';
import HomeScreen from './HomeScreen.jsx';
import { HOME_LAYOUT } from './data/homeLayout.js';
import { formatShort, parseISO } from './lib/dates.js';

// The content snapshot was taken on 2026-10-15 and covers the October 2026 calendar, so the
// preview dates stay inside it. In the app, "today" is simply the device date.
const SNAPSHOT_DAY = '2026-10-15';
const PREVIEW_DAYS = ['2026-10-15', '2026-10-20', '2026-10-28'];

function initialDay() {
  const q = new URLSearchParams(window.location.search).get('today');
  return q && /^\d{4}-\d{2}-\d{2}$/.test(q) ? q : SNAPSHOT_DAY;
}

function StatusBar() {
  return (
    <div className="statusbar" aria-hidden="true">
      <span>9:41</span>
      <span className="statusbar__island" />
      <span className="statusbar__icons">
        <i className="sb-signal" />
        <i className="sb-battery" />
      </span>
    </div>
  );
}

export default function App() {
  const [day, setDay] = useState(initialDay);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('today', day);
    window.history.replaceState(null, '', url);
  }, [day]);

  const jump = (id) => {
    document.querySelector(`[data-section="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="page">
      <aside className="panel">
        <div className="panel__intro">
          <p className="eyebrow">com.g123 · Home tab proposal</p>
          <h1 className="panel__title">One Home screen for every event and category</h1>
          <p className="panel__lede">
            All 17 general categories sit one swipe from launch. Events are dated, sorted and never stale. Content
            is a snapshot of m.123greetings.com.
          </p>
        </div>

        <div className="panel__group">
          <p className="panel__label" id="preview-day-label">
            Preview as of
          </p>
          <div className="segmented" role="radiogroup" aria-labelledby="preview-day-label">
            {PREVIEW_DAYS.map((iso) => (
              <button
                type="button"
                key={iso}
                role="radio"
                aria-checked={iso === day}
                className={iso === day ? 'is-on' : ''}
                onClick={() => setDay(iso)}
              >
                {formatShort(iso)}
              </button>
            ))}
          </div>
        </div>

        <div className="panel__group">
          <p className="panel__label">Feed order (tap to jump)</p>
          <ol className="section-map">
            {HOME_LAYOUT.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => jump(s.id)}>
                  <strong>{s.label}</strong>
                  <span>{s.note}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </aside>

      <div className="device">
        <div className="device__screen">
          <StatusBar />
          <HomeScreen key={day} today={parseISO(day)} />
        </div>
      </div>
    </div>
  );
}
