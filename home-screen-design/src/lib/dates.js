// Calendar-day helpers. Event dates are ISO "YYYY-MM-DD" strings in the user's local calendar.

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toISO(date) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

export function addDays(date, n) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

// Whole calendar days from `today` to `iso` (negative = past). Rounding absorbs DST shifts.
export function daysUntil(today, iso) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((parseISO(iso) - start) / 86400000);
}

export function relativeDay(n) {
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n < 7) return `In ${n} days`;
  return `${n} days to go`;
}

export const weekday = (date) => WEEKDAYS[date.getDay()];
export const monthShort = (date) => MONTHS[date.getMonth()];

// "Sat, Oct 31"
export function formatShort(iso) {
  const d = parseISO(iso);
  return `${weekday(d)}, ${monthShort(d)} ${d.getDate()}`;
}

// "Oct 20" — used for "ends Oct 20" on ongoing observances
export function formatMonthDay(iso) {
  const d = parseISO(iso);
  return `${monthShort(d)} ${d.getDate()}`;
}
