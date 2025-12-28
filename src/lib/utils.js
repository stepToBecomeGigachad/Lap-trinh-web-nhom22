export function formatPrice(n) {
  const num = typeof n === 'number' ? n : parseFloat(String(n).replace(/[^\d.]/g, '')) || 0;
  // Format as VND: xxx.xxx đ
  return num.toLocaleString('vi-VN') + ' đ';
}

export function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

