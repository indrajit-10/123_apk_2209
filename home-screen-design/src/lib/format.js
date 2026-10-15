// 3087 → "3.1K", 53929 → "54K", 987 → "987"
export function compact(n) {
  if (n == null) return '';
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k < 10 ? k.toFixed(1).replace(/\.0$/, '') : Math.round(k)}K`;
}

export const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
