import React from 'react';
import Img from './Img.jsx';
import SectionHeader from './SectionHeader.jsx';
import { track, slugEvent } from '../lib/track.js';

// Everyday sentiments as wrapped chips: ten sub-categories in about a hundred points of height.
export default function JustToSay({ items, onOpen }) {
  return (
    <section className="section">
      <SectionHeader title="Just to say" onAction={() => track('JUST_TO_SAY_VIEW_ALL')} />
      <ul className="chip-wrap">
        {items.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className="chip chip--img"
              onClick={() => {
                track(`JUST_TO_SAY_CLICK_${slugEvent(s.id)}`, { href: s.href });
                onOpen(s.href);
              }}
            >
              <Img src={s.thumb} fallback={s.img} label={s.name} />
              <span>{s.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
