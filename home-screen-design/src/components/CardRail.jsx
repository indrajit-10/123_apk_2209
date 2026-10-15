import React from 'react';
import Img from './Img.jsx';
import Icon from './Icon.jsx';
import SectionHeader from './SectionHeader.jsx';
import { CardMeta } from './GridCard.jsx';
import { track } from '../lib/track.js';

export function CardTile({ card, rank, video, meta, onClick }) {
  return (
    <button type="button" className="card-tile" onClick={onClick}>
      <span className="card-tile__art">
        <Img src={card.img} fallback={card.thumb} label={card.title} />
        {rank && <span className="rank">{rank}</span>}
        {video && (
          <span className="play" aria-label="Video card">
            <Icon name="play" size={14} />
          </span>
        )}
      </span>
      <span className="card-tile__title">{card.title}</span>
      {meta && <CardMeta card={card} />}
    </button>
  );
}

// Horizontal rail of cards. `analytics` keeps the event names the current APK already logs.
export default function CardRail({
  title,
  eyebrow,
  eyebrowUrgent,
  cards,
  ranked,
  video,
  analytics = {},
  onViewAll,
  children,
  className = '',
}) {
  return (
    <section className={`section ${className}`}>
      <SectionHeader
        eyebrow={eyebrow}
        eyebrowUrgent={eyebrowUrgent}
        title={title}
        onAction={() => {
          track(analytics.viewAll ?? 'CARD_VIEW_ALL', { section: title });
          onViewAll?.();
        }}
      />
      {children}
      <ul className="rail card-rail">
        {cards.map((c, i) => (
          <li key={c.href}>
            <CardTile
              card={c}
              rank={ranked ? i + 1 : null}
              video={video}
              onClick={() => track(analytics.card ?? 'CARD_CLICK', { section: title, position: i, href: c.href })}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
