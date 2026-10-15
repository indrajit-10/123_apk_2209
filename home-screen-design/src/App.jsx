import React, { useEffect, useState } from 'react';
import AppShell from './AppShell.jsx';
import { TAB_ROOTS } from './nav.js';
import { SCREEN_NOTES, screenKey } from './data/screenNotes.js';
import { formatShort, parseISO } from './lib/dates.js';

// The content snapshot was taken on 2026-10-15 and covers the October 2026 calendar, so the
// preview dates stay inside it. In the app, "today" is simply the device date.
const SNAPSHOT_DAY = '2026-10-15';
const PREVIEW_DAYS = ['2026-10-15', '2026-10-20', '2026-10-28'];

const BIRTHDAY = { name: 'category', categoryId: 'birthday', subId: null };
const HAPPY_BIRTHDAY = { ...BIRTHDAY, subId: 'birthday__happy_birthday' };

// Direct links into the prototype: ?screen=categories etc.
const PRESETS = {
  home: { label: 'Home', tab: 'home', stack: [TAB_ROOTS.home] },
  categories: { label: 'Categories', tab: 'categories', stack: [TAB_ROOTS.categories] },
  category: { label: 'Category: Birthday', tab: 'categories', stack: [TAB_ROOTS.categories, BIRTHDAY] },
  subcategory: { label: 'Subcategory: Happy Birthday', tab: 'categories', stack: [TAB_ROOTS.categories, BIRTHDAY, HAPPY_BIRTHDAY] },
  events: { label: 'Events pane', tab: 'categories', stack: [{ name: 'categories', selected: 'events' }], hidden: true },
};

function navFor(presetId) {
  const p = PRESETS[presetId] ?? PRESETS.home;
  return { tab: p.tab, stacks: { ...Object.fromEntries(Object.entries(TAB_ROOTS).map(([k, v]) => [k, [v]])), [p.tab]: p.stack } };
}

function readParams() {
  const q = new URLSearchParams(window.location.search);
  const day = q.get('today');
  return {
    day: day && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : SNAPSHOT_DAY,
    screen: PRESETS[q.get('screen')] ? q.get('screen') : 'home',
  };
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
  const [initial] = useState(readParams);
  const [day, setDay] = useState(initial.day);
  const [nav, setNav] = useState(() => navFor(initial.screen));

  const top = nav.stacks[nav.tab].at(-1);
  const key = screenKey(top);
  const notes = SCREEN_NOTES[key];

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('today', day);
    url.searchParams.set('screen', key);
    window.history.replaceState(null, '', url);
  }, [day, key]);

  const jump = (id) => {
    document.querySelector(`[data-section="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="page">
      <aside className="panel">
        <div className="panel__group">
          <p className="panel__label" id="screen-label">
            Screen
          </p>
          <div className="segmented segmented--wrap" role="radiogroup" aria-labelledby="screen-label">
            {Object.entries(PRESETS)
              .filter(([, p]) => !p.hidden)
              .map(([id, p]) => (
                <button
                  type="button"
                  key={id}
                  role="radio"
                  aria-checked={id === key}
                  className={id === key ? 'is-on' : ''}
                  onClick={() => setNav(navFor(id))}
                >
                  {p.label}
                </button>
              ))}
          </div>
        </div>

        <div className="panel__intro">
          <p className="eyebrow">com.g123 · redesign proposal</p>
          <h1 className="panel__title">{notes.title}</h1>
          <p className="panel__lede">{notes.lede}</p>
        </div>

        {(key === 'home' || top.selected === 'events') && (
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
        )}

        <div className="panel__group">
          <p className="panel__label">{notes.jumpable ? 'Feed order (tap to jump)' : 'Top to bottom'}</p>
          <ol className="section-map">
            {notes.items.map((s) => (
              <li key={s.label}>
                {notes.jumpable ? (
                  <button type="button" onClick={() => jump(s.id)}>
                    <strong>{s.label}</strong>
                    <span>{s.note}</span>
                  </button>
                ) : (
                  <div className="section-map__item">
                    <strong>{s.label}</strong>
                    <span>{s.note}</span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </aside>

      <div className="device">
        <div className="device__screen">
          <StatusBar />
          <AppShell key={day} today={parseISO(day)} nav={nav} setNav={setNav} />
        </div>
      </div>
    </div>
  );
}
