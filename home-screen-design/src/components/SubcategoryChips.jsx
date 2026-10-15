import React, { useEffect, useRef } from 'react';

// Every sibling sub-category, pinned under the top bar. The selected chip scrolls into view so
// "where am I" is always visible, and switching sub-category never needs the back button.
export default function SubcategoryChips({ category, selectedId, onSelect }) {
  const railRef = useRef(null);

  useEffect(() => {
    const rail = railRef.current;
    const chip = rail?.querySelector('[aria-pressed="true"]');
    if (chip) rail.scrollTo({ left: chip.offsetLeft - 16, behavior: 'smooth' });
  }, [selectedId]);

  return (
    <nav className="subchips" aria-label={`${category.name} sub-categories`}>
      <ul className="rail rail--chips" ref={railRef}>
        <li>
          <button
            type="button"
            className="chip subchip"
            aria-pressed={selectedId == null}
            onClick={() => onSelect(null)}
          >
            All
          </button>
        </li>
        {category.subcategories.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className="chip subchip"
              aria-pressed={selectedId === s.id}
              onClick={() => onSelect(s.id)}
            >
              {s.name}
              {s.count != null && <span className="subchip__count">{s.count}</span>}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
