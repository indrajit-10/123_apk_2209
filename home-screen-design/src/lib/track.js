// Stand-in for the app's analytics call. Event names reuse the ones the current APK already logs
// (CARD_CLICK_MOST_POPULAR_CARDS, NAV_TAB_CLICK_HOME, …) and add HOME_* / EVENT_* for new sections.
export function track(name, params = {}) {
  console.debug('[track]', name, params);
  window.dispatchEvent(new CustomEvent('g123-track', { detail: { name, params } }));
}

export const slugEvent = (id) => id.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
