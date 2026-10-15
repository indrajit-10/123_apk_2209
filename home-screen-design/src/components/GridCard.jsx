import React from 'react';
import Img from './Img.jsx';
import Icon from './Icon.jsx';
import { compact } from '../lib/format.js';

export function CardMeta({ card }) {
  if (card.rating == null && card.views == null) return null;
  return (
    <span className="card-meta">
      {card.rating != null && (
        <span className="card-meta__rating">
          <Icon name="star" size={12} strokeWidth={0} filled />
          {card.rating.toFixed(1)}
        </span>
      )}
      {card.views != null && <span>{compact(card.views)} views</span>}
    </span>
  );
}

// Card in a 2-column grid: art with format tags, a favourite toggle, title, rating and views.
export default function GridCard({ card, favourite, onOpen, onFavourite }) {
  return (
    <div className="grid-card">
      <button type="button" className="grid-card__open" onClick={onOpen}>
        <span className="grid-card__art">
          <Img src={card.img} fallback={card.thumb} label={card.title} />
          {card.video ? (
            <span className="tag">
              <Icon name="play" size={10} /> Video
            </span>
          ) : (
            card.gif && <span className="tag">Animated</span>
          )}
        </span>
        <span className="grid-card__title">{card.title}</span>
        <CardMeta card={card} />
      </button>
      <button
        type="button"
        className={`fav${favourite ? ' fav--on' : ''}`}
        aria-pressed={favourite}
        aria-label={favourite ? `Remove ${card.title} from favourites` : `Add ${card.title} to favourites`}
        onClick={onFavourite}
      >
        <Icon name="heart" size={18} strokeWidth={2} filled={favourite} />
      </button>
    </div>
  );
}
