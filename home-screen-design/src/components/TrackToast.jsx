import React, { useEffect, useState } from 'react';

// Shows the analytics event each tap fires, so reviewers can check naming against the APK.
export default function TrackToast() {
  const [last, setLast] = useState(null);
  useEffect(() => {
    let timer;
    const onTrack = (e) => {
      if (e.detail.name.endsWith('_IMPRESSION')) return;
      setLast(e.detail);
      clearTimeout(timer);
      timer = setTimeout(() => setLast(null), 2400);
    };
    window.addEventListener('g123-track', onTrack);
    return () => {
      window.removeEventListener('g123-track', onTrack);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`toast${last ? ' toast--on' : ''}`} role="status" aria-live="polite">
      {last && (
        <>
          <span className="toast__label">Analytics event</span>
          <code className="toast__name">{last.name}</code>
        </>
      )}
    </div>
  );
}
