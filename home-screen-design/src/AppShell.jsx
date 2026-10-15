import React, { useMemo, useState } from 'react';
import HomeScreen from './screens/HomeScreen.jsx';
import CategoriesScreen from './screens/CategoriesScreen.jsx';
import CategoryScreen from './screens/CategoryScreen.jsx';
import BottomNav from './components/BottomNav.jsx';
import TrackToast from './components/TrackToast.jsx';
import { NavContext, TAB_ROOTS } from './nav.js';

const DESIGNED_TABS = Object.keys(TAB_ROOTS);

function renderScreen(screen, today) {
  switch (screen.name) {
    case 'home':
      return <HomeScreen today={today} />;
    case 'categories':
      return <CategoriesScreen selected={screen.selected} today={today} />;
    case 'category':
      return <CategoryScreen categoryId={screen.categoryId} subId={screen.subId} />;
    default:
      return null;
  }
}

// The phone's app: one navigation stack per designed tab. Every screen in every stack stays
// mounted (hidden) so going back restores scroll position, as the native stack navigator does.
export default function AppShell({ today, nav: state, setNav }) {
  const [favourites, setFavourites] = useState(() => new Set());

  const api = useMemo(() => {
    const update = (fn) =>
      setNav((s) => {
        const stack = fn(s.stacks[s.tab]);
        return { ...s, stacks: { ...s.stacks, [s.tab]: stack } };
      });
    return {
      open: (screen) => update((stack) => [...stack, screen]),
      replace: (screen) => update((stack) => [...stack.slice(0, -1), screen]),
      back: () => update((stack) => (stack.length > 1 ? stack.slice(0, -1) : stack)),
      tab: (id, root) =>
        setNav((s) => {
          if (!DESIGNED_TABS.includes(id)) return s;
          // Re-tapping the active tab pops to its root; a given root replaces the tab's stack.
          if (root) return { tab: id, stacks: { ...s.stacks, [id]: [root] } };
          if (s.tab === id) return { ...s, stacks: { ...s.stacks, [id]: s.stacks[id].slice(0, 1) } };
          return { ...s, tab: id };
        }),
      favourites,
      toggleFavourite: (href) =>
        setFavourites((prev) => {
          const next = new Set(prev);
          if (next.has(href)) next.delete(href);
          else next.add(href);
          return next;
        }),
    };
  }, [setNav, favourites]);

  return (
    <NavContext.Provider value={api}>
      <div className="screen">
        {DESIGNED_TABS.flatMap((tabId) =>
          state.stacks[tabId].map((screen, i) => (
            <div
              key={`${tabId}-${i}-${screen.name}`}
              className="screen__layer"
              hidden={!(tabId === state.tab && i === state.stacks[tabId].length - 1)}
            >
              {renderScreen(screen, today)}
            </div>
          )),
        )}
        <TrackToast />
        <BottomNav active={state.tab} onSelect={(id) => api.tab(id)} />
      </div>
    </NavContext.Provider>
  );
}
