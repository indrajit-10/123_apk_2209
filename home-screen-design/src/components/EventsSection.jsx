import React, { useMemo, useRef, useState } from 'react';
import Img from './Img.jsx';
import Icon from './Icon.jsx';
import SectionHeader from './SectionHeader.jsx';
import { addDays, formatMonthDay, monthShort, parseISO, relativeDay, toISO, weekday } from '../lib/dates.js';
import { track, slugEvent } from '../lib/track.js';

// A 14-day date strip over a single rail of every event in that window, in date order.
// Tapping a date scrolls the rail to it; scrolling the rail moves the highlighted date.
export default function EventsSection({ today, days, events, ongoing }) {
  const railRef = useRef(null);
  const todayISO = toISO(today);
  const [selected, setSelected] = useState(todayISO);

  const dates = useMemo(() => Array.from({ length: days }, (_, i) => toISO(addDays(today, i))), [today, days]);
  const countByDate = useMemo(() => {
    const m = {};
    for (const e of events) m[e.date] = (m[e.date] ?? 0) + 1;
    return m;
  }, [events]);

  const jumpTo = (iso) => {
    const rail = railRef.current;
    const card = rail?.querySelector(`[data-date="${iso}"]`);
    setSelected(iso);
    if (card) rail.scrollTo({ left: card.offsetLeft - 16, behavior: 'smooth' });
    track('EVENT_DATE_CLICK', { date: iso, events: countByDate[iso] ?? 0 });
  };

  const onRailScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    const first = [...rail.querySelectorAll('[data-date]')].find((el) => el.offsetLeft + el.offsetWidth / 2 > rail.scrollLeft);
    if (first && first.dataset.date !== selected) setSelected(first.dataset.date);
  };

  return (
    <section className="section events" aria-labelledby="events-title">
      <SectionHeader
        id="events-title"
        title="Events & holidays"
        action="Calendar"
        onAction={() => track('HOME_EVENTS_CALENDAR_CLICK')}
      />

      <ol className="date-strip" aria-label="Next 14 days">
        {dates.map((iso) => {
          const d = parseISO(iso);
          const count = countByDate[iso] ?? 0;
          return (
            <li key={iso}>
              <button
                type="button"
                className={`date-cell${iso === selected ? ' is-selected' : ''}${iso === todayISO ? ' is-today' : ''}`}
                disabled={count === 0}
                aria-pressed={iso === selected}
                aria-label={`${weekday(d)} ${monthShort(d)} ${d.getDate()}, ${count} event${count === 1 ? '' : 's'}`}
                onClick={() => jumpTo(iso)}
              >
                <span className="date-cell__dow">{iso === todayISO ? 'Today' : weekday(d)}</span>
                <span className="date-cell__num">{d.getDate()}</span>
                <span className="date-cell__dots" aria-hidden="true">
                  {Array.from({ length: Math.min(count, 3) }, (_, i) => (
                    <i key={i} />
                  ))}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <ul className="rail event-rail" ref={railRef} onScroll={onRailScroll}>
        {events.map((e) => {
          const d = parseISO(e.date);
          return (
            <li key={e.id} data-date={e.date}>
              <button
                type="button"
                className="event-card"
                onClick={() => track(`EVENT_CARD_CLICK_${slugEvent(e.id)}`, { date: e.date, href: e.href })}
              >
                <span className="event-card__art">
                  <Img src={e.img} fallback={e.thumb} label={e.name} />
                </span>
                <span className="stamp" aria-hidden="true">
                  <span className="stamp__paper">
                    <span className="stamp__m">{monthShort(d)}</span>
                    <span className="stamp__d">{d.getDate()}</span>
                  </span>
                </span>
                <span className="event-card__name">{e.name}</span>
                <span className={`event-card__when${e.inDays <= 1 ? ' is-soon' : ''}`}>{relativeDay(e.inDays)}</span>
              </button>
            </li>
          );
        })}
        <li>
          <button type="button" className="event-card event-card--more" onClick={() => track('HOME_EVENTS_CALENDAR_CLICK')}>
            <Icon name="calendar" size={30} strokeWidth={1.6} />
            <span>Full calendar</span>
          </button>
        </li>
      </ul>

      {ongoing.length > 0 && (
        <div className="ongoing">
          <p className="ongoing__label">Happening now</p>
          <ul className="rail rail--chips">
            {ongoing.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  className="chip chip--img"
                  onClick={() => track(`EVENT_CARD_CLICK_${slugEvent(o.id)}`, { ongoing: true, href: o.href })}
                >
                  <Img src={o.thumb} fallback={o.img} label={o.name} />
                  <span>
                    {o.name}
                    <small>{o.endsIn <= 7 ? ` · ends ${formatMonthDay(o.end)}` : ''}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
