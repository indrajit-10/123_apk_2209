import React from 'react';
import CardRail from './CardRail.jsx';
import { eventCards } from '../lib/feed.js';
import { formatShort, relativeDay } from '../lib/dates.js';
import { track, slugEvent } from '../lib/track.js';
import { EVENT_TINT } from '../data/homeLayout.js';

// A tinted band with one event's sub-categories and cards, so a holiday gets real shelf space
// on Home instead of a single link.
export default function EventSpotlight({ event, cards }) {
  if (!event || cards.length === 0) return null;
  const { subcategories } = eventCards(event.id);
  const key = slugEvent(event.id);

  return (
    <div className="spotlight" style={{ '--tint': EVENT_TINT[event.id] ?? 'var(--mist)' }}>
      <CardRail
        eyebrow={`${relativeDay(event.inDays)} · ${formatShort(event.date)}`}
        eyebrowUrgent={event.inDays <= 1}
        title={event.name}
        cards={cards}
        analytics={{ card: `EVENT_SPOTLIGHT_CARD_CLICK_${key}`, viewAll: `EVENT_SPOTLIGHT_VIEW_ALL_${key}` }}
      >
        {subcategories.length > 0 && (
          <ul className="rail rail--chips spotlight__subs">
            {subcategories.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="chip"
                  onClick={() => track(`EVENT_SUBCATEGORY_CLICK_${key}`, { sub: s.id })}
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardRail>
    </div>
  );
}
