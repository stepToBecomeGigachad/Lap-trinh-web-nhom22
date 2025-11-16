export function formatPrice(n) {
  const num = typeof n === 'number' ? n : parseFloat(String(n).replace(/[^\d.]/g, '')) || 0;
  return `$${num.toFixed(2)}`;
}

export function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

