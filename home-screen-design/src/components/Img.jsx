import React, { useEffect, useState } from 'react';

// Card art from the 123Greetings CDN. Falls back from the large image to the thumbnail, then to a
// lettered tile, so a missing asset never leaves a hole in a rail.
export default function Img({ src, fallback, alt = '', label = '', className = '' }) {
  const sources = [src, fallback].filter(Boolean);
  const [stage, setStage] = useState(0);

  useEffect(() => setStage(0), [src]);

  if (stage >= sources.length) {
    return (
      <span className={`img img--empty ${className}`} aria-hidden="true">
        {label.slice(0, 1)}
      </span>
    );
  }
  return (
    <img
      className={`img ${className}`}
      src={sources[stage]}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable="false"
      onError={() => setStage((s) => s + 1)}
    />
  );
}
