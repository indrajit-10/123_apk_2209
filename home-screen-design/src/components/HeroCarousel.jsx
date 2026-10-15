import React, { useEffect, useRef, useState } from 'react';
import Img from './Img.jsx';
import Icon from './Icon.jsx';
import { formatShort, relativeDay } from '../lib/dates.js';
import { track, slugEvent } from '../lib/track.js';

// Content for this slide comes from the app's existing App Exclusives feed; shown here as a brand panel.
const APP_EXCLUSIVE = {
  id: 'app_exclusive',
  eyebrow: 'Only in the app',
  title: 'App Exclusives',
  sub: 'Cards you won’t find on the website',
  cta: 'Browse exclusives',
};

function slidesFor(events) {
  return [
    ...events.map((e) => ({
      id: e.id,
      eyebrow: relativeDay(e.inDays),
      urgent: e.inDays <= 1,
      title: e.name,
      sub: formatShort(e.date),
      cta: `Send ${e.name} cards`,
      img: e.img,
      thumb: e.thumb,
    })),
    APP_EXCLUSIVE,
  ];
}

export default function HeroCarousel({ events }) {
  const slides = slidesFor(events);
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const onScroll = () => {
    const el = trackRef.current;
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  const goTo = (i) => {
    const el = trackRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  // Auto-advance every 5s until the user touches the carousel; off for reduced motion.
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => goTo((active + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [active, paused, slides.length]);

  return (
    <section className="hero" aria-roledescription="carousel" aria-label="Featured">
      <div
        className="hero__track"
        ref={trackRef}
        onScroll={onScroll}
        onPointerDown={() => setPaused(true)}
        onFocus={() => setPaused(true)}
      >
        {slides.map((s, i) => (
          <article className="hero__slide" key={s.id} aria-label={`${i + 1} of ${slides.length}`}>
            <div className={`hero__card${s.img ? '' : ' hero__card--brand'}`}>
              {s.img ? (
                <>
                  <Img className="hero__img" src={s.img} fallback={s.thumb} alt="" label={s.title} />
                  <div className="hero__shade" />
                </>
              ) : (
                <Icon name="sparkle" size={150} strokeWidth={0.9} className="hero__mark" />
              )}
              <div className="hero__copy">
                <span className={`hero__eyebrow${s.urgent ? ' hero__eyebrow--urgent' : ''}`}>{s.eyebrow}</span>
                <h2 className="hero__title">{s.title}</h2>
                <p className="hero__sub">{s.sub}</p>
                <button
                  type="button"
                  className="hero__cta"
                  onClick={() => track(`MANTLE_CLICK_${slugEvent(s.id)}`, { slot: i })}
                >
                  {s.cta}
                  <Icon name="arrow" size={16} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="hero__dots">
        {slides.map((s, i) => (
          <button
            type="button"
            key={s.id}
            className={`dot${i === active ? ' dot--on' : ''}`}
            aria-label={`Show ${s.title}`}
            aria-current={i === active}
            onClick={() => {
              setPaused(true);
              goTo(i);
            }}
          />
        ))}
      </div>
    </section>
  );
}
