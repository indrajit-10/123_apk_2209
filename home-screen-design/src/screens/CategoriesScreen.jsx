import React, { useEffect, useMemo, useRef, useState } from 'react';
import Img from '../components/Img.jsx';
import Icon from '../components/Icon.jsx';
import { TAXONOMY } from '../data/taxonomy.js';
import { buildEventFeed } from '../lib/feed.js';
import { formatMonthDay, formatShort, monthShort, parseISO, relativeDay } from '../lib/dates.js';
import { plural } from '../lib/format.js';
import { track, slugEvent } from '../lib/track.js';
import { findCategory } from '../lib/route.js';
import { useNav } from '../nav.js';

const TOTAL_SUBS = TAXONOMY.reduce((n, c) => n + c.subcategories.length, 0);
const cardTotal = (cat) => cat.subcategories.reduce((n, s) => n + (s.count ?? 0), 0);

function CategoryPane({ category }) {
  const nav = useNav();
  const cards = cardTotal(category);
  const lead = category.subcategories.find((s) => s.lead)?.lead;
  const openAll = () => {
    track(`CATEGORY_OPEN_${slugEvent(category.id)}`, { from: 'categories_pane' });
    nav.open({ name: 'category', categoryId: category.id, subId: null });
  };

  return (
    <>
      <div className="pane-head">
        <h2 className="pane-title">{category.name}</h2>
        <p className="pane-meta">
          {plural(category.subcategories.length, 'subcategory', 'subcategories')}
          {cards > 0 && ` · ${plural(cards, 'card')}`}
        </p>
      </div>

      <button type="button" className="pane-all" onClick={openAll}>
        {lead && <Img src={lead.img} fallback={lead.thumb} label={category.name} className="pane-all__img" />}
        <span className="pane-all__shade" />
        <span className="pane-all__text">
          See all {category.name}
          <Icon name="arrow" size={16} strokeWidth={2.2} />
        </span>
      </button>

      <ul className="sub-grid">
        {category.subcategories.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className="sub-tile"
              onClick={() => {
                track(`SUBCATEGORY_CLICK_${slugEvent(s.id)}`, { from: 'categories_pane', position: i });
                nav.open({ name: 'category', categoryId: category.id, subId: s.id });
              }}
            >
              <span className="sub-tile__art">
                <Img src={s.lead?.thumb} fallback={s.lead?.img} label={s.name} />
              </span>
              <span className="sub-tile__name">{s.name}</span>
              {s.count != null && <span className="sub-tile__count">{plural(s.count, 'card')}</span>}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function EventsPane({ today }) {
  const feed = useMemo(() => buildEventFeed(today), [today]);
  const big = feed.upcoming.filter((e) => e.weight === 3).slice(0, 3);

  return (
    <>
      <div className="pane-head">
        <h2 className="pane-title">Events &amp; Holidays</h2>
        <p className="pane-meta">{plural(feed.inWindow.length, 'event')} in the next 2 weeks</p>
      </div>

      <p className="pane-label">Big holidays</p>
      <ul className="big-days">
        {big.map((e) => (
          <li key={e.id}>
            <button type="button" className="big-day" onClick={() => track(`EVENT_CARD_CLICK_${slugEvent(e.id)}`, { from: 'categories_pane' })}>
              <Img src={e.img} fallback={e.thumb} label={e.name} />
              <span className="big-day__shade" />
              <span className="big-day__text">
                <strong>{e.name}</strong>
                <small>
                  {formatShort(e.date)} · {relativeDay(e.inDays)}
                </small>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="pane-label">Next 14 days</p>
      <ul className="event-list">
        {feed.inWindow.map((e) => {
          const d = parseISO(e.date);
          return (
            <li key={e.id}>
              <button type="button" className="event-row" onClick={() => track(`EVENT_CARD_CLICK_${slugEvent(e.id)}`, { from: 'categories_pane' })}>
                <span className="mini-stamp" aria-hidden="true">
                  <span>{monthShort(d)}</span>
                  <strong>{d.getDate()}</strong>
                </span>
                <span className="event-row__name">{e.name}</span>
                <span className={`event-row__when${e.inDays <= 1 ? ' is-soon' : ''}`}>{relativeDay(e.inDays)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {feed.ongoing.length > 0 && (
        <>
          <p className="pane-label">Happening now</p>
          <ul className="chip-wrap chip-wrap--pane">
            {feed.ongoing.map((o) => (
              <li key={o.id}>
                <span className="chip chip--static">
                  {o.name}
                  <small>{o.endsIn <= 7 ? ` · ends ${formatMonthDay(o.end)}` : ''}</small>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <button type="button" className="btn btn--outline pane-cta" onClick={() => track('HOME_EVENTS_CALENDAR_CLICK', { from: 'categories_pane' })}>
        <Icon name="calendar" size={18} /> Full calendar
      </button>
    </>
  );
}

function SearchResults({ query, onClear }) {
  const nav = useNav();
  const q = query.trim().toLowerCase();
  const cats = TAXONOMY.filter((c) => c.name.toLowerCase().includes(q));
  const subs = TAXONOMY.flatMap((c) =>
    c.subcategories.filter((s) => s.name.toLowerCase().includes(q)).map((s) => ({ ...s, category: c })),
  ).slice(0, 40);

  if (cats.length === 0 && subs.length === 0) {
    return (
      <div className="empty">
        <p className="empty__title">No category called “{query.trim()}”</p>
        <p>Try a person (“mom”), a mood (“sorry”) or an occasion (“retirement”), or search the cards themselves.</p>
        <button type="button" className="btn btn--primary" onClick={() => track('SEARCH_SUBMIT', { q: query, from: 'categories' })}>
          Search cards for “{query.trim()}”
        </button>
        <button type="button" className="btn btn--quiet" onClick={onClear}>
          Clear search
        </button>
      </div>
    );
  }

  return (
    <div className="results">
      {cats.length > 0 && (
        <>
          <p className="pane-label">Categories</p>
          <ul className="result-list">
            {cats.map((c) => (
              <li key={c.id}>
                <button type="button" className="result" onClick={() => nav.open({ name: 'category', categoryId: c.id, subId: null })}>
                  <span className="result__art result__art--round">
                    <Img src={c.img} label={c.name} />
                  </span>
                  <span className="result__text">
                    <strong>{c.name}</strong>
                    <small>{plural(c.subcategories.length, 'subcategory', 'subcategories')}</small>
                  </span>
                  <Icon name="chevron" size={18} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {subs.length > 0 && (
        <>
          <p className="pane-label">Subcategories</p>
          <ul className="result-list">
            {subs.map((s) => (
              <li key={`${s.category.id}-${s.id}`}>
                <button
                  type="button"
                  className="result"
                  onClick={() => {
                    track(`SUBCATEGORY_CLICK_${slugEvent(s.id)}`, { from: 'categories_search', q: query });
                    nav.open({ name: 'category', categoryId: s.category.id, subId: s.id });
                  }}
                >
                  <span className="result__art">
                    <Img src={s.lead?.thumb} fallback={s.lead?.img} label={s.name} />
                  </span>
                  <span className="result__text">
                    <strong>{s.name}</strong>
                    <small>
                      in {s.category.name}
                      {s.count != null && ` · ${plural(s.count, 'card')}`}
                    </small>
                  </span>
                  <Icon name="chevron" size={18} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function CategoriesScreen({ selected, today }) {
  const nav = useNav();
  const [query, setQuery] = useState('');
  const paneRef = useRef(null);
  const feed = useMemo(() => buildEventFeed(today), [today]);
  const category = selected === 'events' ? null : findCategory(selected) ?? TAXONOMY[0];

  useEffect(() => {
    paneRef.current?.scrollTo({ top: 0 });
  }, [selected]);

  const select = (id) => {
    track(`CATEGORY_RAIL_SELECT_${slugEvent(id)}`);
    nav.replace({ name: 'categories', selected: id });
  };

  return (
    <div className="screen__body">
      <header className="cats-head">
        <h1 className="screen-title">Categories</h1>
        <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
          <Icon name="search" size={19} />
          <input
            id="categories-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${TOTAL_SUBS} categories, e.g. “retirement”`}
          />
          {query && (
            <button type="button" className="search__clear" aria-label="Clear search" onClick={() => setQuery('')}>
              <Icon name="close" size={16} strokeWidth={2.2} />
            </button>
          )}
        </form>
      </header>

      {query.trim() ? (
        <div className="cats__results">
          <SearchResults query={query} onClear={() => setQuery('')} />
        </div>
      ) : (
        <div className="cats">
          <nav className="cats__rail" aria-label="Categories">
            <ul>
              <li>
                <button
                  type="button"
                  className="rail-item rail-item--events"
                  aria-current={selected === 'events'}
                  onClick={() => select('events')}
                >
                  <span className="rail-item__art">
                    <Icon name="calendar" size={22} strokeWidth={1.8} />
                    <span className="badge">{feed.upcoming.filter((e) => e.inDays < 7).length}</span>
                  </span>
                  <span className="rail-item__label">Events &amp; Holidays</span>
                </button>
              </li>
              {TAXONOMY.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="rail-item"
                    aria-current={category?.id === c.id}
                    onClick={() => select(c.id)}
                  >
                    <span className="rail-item__art">
                      <Img src={c.img} label={c.name} />
                    </span>
                    <span className="rail-item__label">{c.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="cats__pane" ref={paneRef}>
            {category ? <CategoryPane category={category} /> : <EventsPane today={today} />}
          </div>
        </div>
      )}
    </div>
  );
}
