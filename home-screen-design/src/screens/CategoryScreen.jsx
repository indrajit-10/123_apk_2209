import React, { useEffect, useMemo, useRef, useState } from 'react';
import Img from '../components/Img.jsx';
import Icon from '../components/Icon.jsx';
import TopBar from '../components/TopBar.jsx';
import SubcategoryChips from '../components/SubcategoryChips.jsx';
import GridCard from '../components/GridCard.jsx';
import { CardTile } from '../components/CardRail.jsx';
import NativeAd from '../components/NativeAd.jsx';
import { TAXONOMY } from '../data/taxonomy.js';
import { useCategoryCards } from '../lib/useCategoryCards.js';
import { findCategory } from '../lib/route.js';
import { plural } from '../lib/format.js';
import { track, slugEvent } from '../lib/track.js';
import { useNav } from '../nav.js';

const AD_AFTER_SHELF = new Set([4, 14]); // after the 5th and 15th shelves
const AD_AFTER_CARD = 8; // one inline ad after the 8th card of a sub-category grid

function About({ text }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <div className="about">
      <p className={open ? '' : 'about__clamp'}>{text}</p>
      <button type="button" className="link-btn" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? 'Less' : 'More'}
      </button>
    </div>
  );
}

function openCard(card, from) {
  track('CARD_DETAILS_OPEN', { href: card.href, from });
}

function favouriteProps(nav, card, from) {
  return {
    favourite: nav.favourites.has(card.href),
    onFavourite: () => {
      track(nav.favourites.has(card.href) ? 'CARD_FAVOURITE_REMOVE' : 'CARD_FAVOURITE_ADD', { href: card.href, from });
      nav.toggleFavourite(card.href);
    },
  };
}

// "All": the most viewed cards, then a shelf for every sub-category. No card appears twice.
function CategoryBody({ category, data, onSelect }) {
  const nav = useNav();
  const { top, shelves } = useMemo(() => {
    const all = category.subcategories.flatMap((s) => data[s.id]?.cards ?? []);
    const seen = new Set(); // cross-listed cards appear under more than one sub-category
    const best = all
      .filter((c) => c.views != null)
      .sort((a, b) => b.views - a.views)
      .filter((c) => (seen.has(c.href) ? false : seen.add(c.href)))
      .slice(0, 4);
    const used = new Set(best.map((c) => c.href));
    const rows = category.subcategories.map((s) => {
      const cards = (data[s.id]?.cards ?? []).filter((c) => !used.has(c.href)).slice(0, 6);
      cards.forEach((c) => used.add(c.href));
      return { sub: s, cards };
    });
    return { top: best, shelves: rows.filter((r) => r.cards.length > 0) };
  }, [category, data]);

  return (
    <>
      {top.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Most viewed in {category.name}</h2>
          </div>
          <ul className="card-grid">
            {top.map((c) => (
              <li key={c.href}>
                <GridCard card={c} onOpen={() => openCard(c, 'category_top')} {...favouriteProps(nav, c, 'category_top')} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {shelves.map(({ sub, cards }, i) => (
        <React.Fragment key={sub.id}>
          <section className="section shelf">
            <button
              type="button"
              className="shelf__head"
              onClick={() => {
                track(`CATEGORY_SHELF_VIEW_ALL_${slugEvent(sub.id)}`, { position: i });
                onSelect(sub.id);
              }}
            >
              <span className="shelf__title">{sub.name}</span>
              <span className="shelf__all">
                {sub.count != null ? `All ${sub.count}` : 'See all'}
                <Icon name="chevron" size={16} strokeWidth={2.2} />
              </span>
            </button>
            <ul className="rail card-rail">
              {cards.map((c) => (
                <li key={c.href}>
                  <CardTile card={c} video={c.video} meta onClick={() => openCard(c, `shelf_${sub.id}`)} />
                </li>
              ))}
            </ul>
          </section>
          {AD_AFTER_SHELF.has(i) && i < shelves.length - 1 && <NativeAd />}
        </React.Fragment>
      ))}

      <OtherCategories current={category} />
    </>
  );
}

function OtherCategories({ current }) {
  const nav = useNav();
  return (
    <section className="section">
      <div className="section-head">
        <h2 className="section-title">Other categories</h2>
      </div>
      <ul className="rail rail--tight">
        {TAXONOMY.filter((c) => c.id !== current.id).map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className="cat-chip"
              onClick={() => {
                track(`CATEGORY_OPEN_${slugEvent(c.id)}`, { from: `category_${current.id}` });
                nav.replace({ name: 'category', categoryId: c.id, subId: null });
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

const FILTERS = [
  { id: 'video', label: 'Video', test: (c) => c.video },
  { id: 'gif', label: 'Animated', test: (c) => c.gif && !c.video },
];

// One sub-category: sort, format filters, a 2-column grid, progress, and the next sub-category.
function SubcategoryBody({ category, sub, list, onSelect }) {
  const nav = useNav();
  const [sort, setSort] = useState('popular');
  const [filter, setFilter] = useState(null);

  const cards = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter);
    const shown = f ? list.cards.filter(f.test) : list.cards;
    return sort === 'popular' ? [...shown].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)) : shown;
  }, [list, sort, filter]);

  const index = category.subcategories.findIndex((s) => s.id === sub.id);
  const next = category.subcategories[(index + 1) % category.subcategories.length];
  const total = sub.count ?? list.cards.length;

  return (
    <>
      <div className="toolbar">
        <div className="segmented segmented--small" role="radiogroup" aria-label="Sort">
          {[
            ['popular', 'Popular'],
            ['latest', 'Latest'],
          ].map(([id, label]) => (
            <button
              type="button"
              key={id}
              role="radio"
              aria-checked={sort === id}
              className={sort === id ? 'is-on' : ''}
              onClick={() => {
                track(`SUBCATEGORY_SORT_${id.toUpperCase()}`, { sub: sub.id });
                setSort(id);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="toolbar__filters">
          {FILTERS.map((f) => (
            <button
              type="button"
              key={f.id}
              className="chip chip--toggle"
              aria-pressed={filter === f.id}
              onClick={() => {
                track(`SUBCATEGORY_FILTER_${f.id.toUpperCase()}`, { sub: sub.id, on: filter !== f.id });
                setFilter(filter === f.id ? null : f.id);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="empty empty--inline">
          <p className="empty__title">No {FILTERS.find((x) => x.id === filter)?.label.toLowerCase()} cards in the first {list.cards.length}</p>
          <p>Load more cards or clear the filter.</p>
          <button type="button" className="btn btn--quiet" onClick={() => setFilter(null)}>
            Clear filter
          </button>
        </div>
      ) : (
        <ul className="card-grid card-grid--page">
          {cards.map((c, i) => (
            <React.Fragment key={c.href}>
              <li>
                <GridCard card={c} onOpen={() => openCard(c, `sub_${sub.id}`)} {...favouriteProps(nav, c, `sub_${sub.id}`)} />
              </li>
              {i === AD_AFTER_CARD - 1 && cards.length > AD_AFTER_CARD && (
                <li className="card-grid__wide">
                  <NativeAd />
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      )}

      <div className="progress">
        <p>
          Showing {list.cards.length} of {plural(total, 'card')}
        </p>
        <span className="progress__bar" aria-hidden="true">
          <span style={{ width: `${Math.min(100, (list.cards.length / total) * 100)}%` }} />
        </span>
        {list.pages > 1 && (
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => track('SUBCATEGORY_LOAD_MORE', { sub: sub.id, page: 2, of: list.pages })}
          >
            Load more
          </button>
        )}
      </div>

      {next && next.id !== sub.id && (
        <button
          type="button"
          className="up-next"
          onClick={() => {
            track(`SUBCATEGORY_UP_NEXT_${slugEvent(next.id)}`, { from: sub.id });
            onSelect(next.id);
          }}
        >
          <span className="up-next__art">
            <Img src={next.lead?.thumb} fallback={next.lead?.img} label={next.name} />
          </span>
          <span className="up-next__text">
            <small>Up next in {category.name}</small>
            <strong>{next.name}</strong>
            {next.count != null && <small>{plural(next.count, 'card')}</small>}
          </span>
          <Icon name="arrow" size={20} strokeWidth={2.1} />
        </button>
      )}
    </>
  );
}

function Skeleton({ sub }) {
  return (
    <div className="skeleton" aria-busy="true" aria-label="Loading cards">
      {sub ? (
        <ul className="card-grid card-grid--page">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="skeleton__card" />
          ))}
        </ul>
      ) : (
        Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="skeleton__shelf">
            <span className="skeleton__line" />
            <span className="skeleton__row">
              <i />
              <i />
              <i />
            </span>
          </div>
        ))
      )}
    </div>
  );
}

export default function CategoryScreen({ categoryId, subId }) {
  const nav = useNav();
  const category = findCategory(categoryId);
  const sub = subId ? category.subcategories.find((s) => s.id === subId) ?? null : null;
  const { status, data, retry } = useCategoryCards(categoryId);
  const scrollRef = useRef(null);
  const headRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    setScrolled(false);
    track(sub ? 'SUBCATEGORY_PAGE_VIEW' : 'CATEGORY_PAGE_VIEW', { category: categoryId, sub: subId });
  }, [categoryId, subId]);

  const select = (id) => {
    track(id ? `SUBCATEGORY_CHIP_${slugEvent(id)}` : `CATEGORY_CHIP_ALL_${slugEvent(categoryId)}`);
    nav.replace({ name: 'category', categoryId, subId: id });
  };

  const cardCount = category.subcategories.reduce((n, s) => n + (s.count ?? 0), 0);

  return (
    <div
      className="screen__scroll screen__scroll--pushed"
      ref={scrollRef}
      onScroll={(e) => setScrolled(e.currentTarget.scrollTop > (headRef.current?.offsetHeight ?? 100) - 24)}
    >
      <TopBar title={sub ? sub.name : category.name} showTitle={scrolled} elevated={scrolled} onBack={nav.back}>
        <button type="button" className="icon-btn" aria-label="Search cards" onClick={() => track('SEARCH_OPEN', { from: categoryId })}>
          <Icon name="search" />
        </button>
        <button type="button" className="icon-btn" aria-label="Share" onClick={() => track('CATEGORY_SHARE', { category: categoryId, sub: subId })}>
          <Icon name="share" size={21} />
        </button>
      </TopBar>

      <div ref={headRef}>
        {sub ? (
          <header className="page-head page-head--sub">
            <button type="button" className="crumb" onClick={() => select(null)}>
              <Icon name="back" size={14} strokeWidth={2.4} />
              {category.name}
            </button>
            <h1 className="page-title">{sub.name}</h1>
            {sub.count != null && <p className="pane-meta">{plural(sub.count, 'card')}</p>}
          </header>
        ) : (
          <header className="page-head">
            <div className="page-head__row">
              <span className="page-head__art">
                <Img src={category.img} label={category.name} />
              </span>
              <div>
                <h1 className="page-title">{category.name}</h1>
                <p className="pane-meta">
                  {plural(category.subcategories.length, 'subcategory', 'subcategories')}
                  {cardCount > 0 && ` · ${plural(cardCount, 'card')}`}
                </p>
              </div>
            </div>
            <About text={category.about} />
          </header>
        )}
      </div>

      <SubcategoryChips category={category} selectedId={sub?.id ?? null} onSelect={select} />

      {status === 'loading' && <Skeleton sub={Boolean(sub)} />}
      {status === 'error' && (
        <div className="empty">
          <p className="empty__title">Cards didn’t load</p>
          <p>Check your connection and try again.</p>
          <button type="button" className="btn btn--primary" onClick={retry}>
            Try again
          </button>
        </div>
      )}
      {status === 'ready' &&
        (sub ? (
          <SubcategoryBody
            key={sub.id}
            category={category}
            sub={sub}
            list={data[sub.id] ?? { pages: 1, cards: [] }}
            onSelect={select}
          />
        ) : (
          <CategoryBody category={category} data={data} onSelect={select} />
        ))}
    </div>
  );
}
