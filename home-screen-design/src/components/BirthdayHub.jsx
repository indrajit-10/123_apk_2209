import React from 'react';
import CardRail from './CardRail.jsx';
import { track, slugEvent } from '../lib/track.js';

// Birthday is the biggest category on every surface, so it gets "for whom" chips on top of its rail.
export default function BirthdayHub({ relations, cards, analytics }) {
  return (
    <CardRail title="Birthday" eyebrow="Birthday videos" cards={cards} video analytics={analytics}>
      <ul className="rail rail--chips">
        {relations.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              className="chip"
              onClick={() => track(`BIRTHDAY_FOR_CLICK_${slugEvent(r.id)}`, { href: r.href })}
            >
              {r.name}
            </button>
          </li>
        ))}
      </ul>
    </CardRail>
  );
}
