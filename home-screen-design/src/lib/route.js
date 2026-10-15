import { TAXONOMY } from '../data/taxonomy.js';

export const subIdForHref = (href) => href.replace(/^\/|\/$/g, '').replace(/\//g, '__');

export const findCategory = (id) => TAXONOMY.find((c) => c.id === id) ?? null;

// Maps a 123Greetings URL path ("/birthday/mom_n_dad/") to the screen that shows it.
export function routeForHref(href) {
  const id = subIdForHref(href);
  const category = findCategory(id.split('__')[0]);
  if (!category) return null;
  const sub = category.subcategories.find((s) => s.id === id);
  return { name: 'category', categoryId: category.id, subId: sub ? sub.id : null };
}
