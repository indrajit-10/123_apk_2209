import { createContext, useContext } from 'react';

// Screens: { name: 'home' } | { name: 'categories', selected } | { name: 'category', categoryId, subId }
// Each bottom tab keeps its own stack, like the app's tab navigator.
export const NavContext = createContext(null);

export function useNav() {
  return useContext(NavContext);
}

export const TAB_ROOTS = {
  home: { name: 'home' },
  categories: { name: 'categories', selected: 'birthday' },
};
