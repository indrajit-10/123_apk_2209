import { useCallback, useEffect, useState } from 'react';

// Loads one category's first page of cards per sub-category, the way the app calls
// get_sub_categories_cards. Successful responses are cached for the session.
const cache = new Map();

export function useCategoryCards(categoryId) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ id: null, status: 'loading', data: null });

  useEffect(() => {
    if (cache.has(categoryId)) return undefined;
    let live = true;
    setState({ id: categoryId, status: 'loading', data: null });
    fetch(`${import.meta.env.BASE_URL}data/categories/${categoryId}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((json) => {
        cache.set(categoryId, json.subcategories);
        if (live) setState({ id: categoryId, status: 'ready', data: json.subcategories });
      })
      .catch(() => live && setState({ id: categoryId, status: 'error', data: null }));
    return () => {
      live = false;
    };
  }, [categoryId, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  // Never hand back another category's state while the new one loads.
  if (cache.has(categoryId)) return { status: 'ready', data: cache.get(categoryId), retry };
  if (state.id !== categoryId) return { status: 'loading', data: null, retry };
  return { status: state.status, data: state.data, retry };
}
