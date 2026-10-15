import React from 'react';

// Placeholder for the GAM native ad unit the app already integrates (NATIVE_AD_ID_ANDROID).
export default function NativeAd() {
  return (
    <aside className="section ad" aria-label="Advertisement">
      <span className="ad__label">Sponsored</span>
      <div className="ad__slot">Native ad · 320 × 100</div>
    </aside>
  );
}
