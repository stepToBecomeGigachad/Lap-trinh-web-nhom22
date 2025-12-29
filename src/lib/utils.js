export function formatPrice(n) {
  const num = typeof n === 'number' ? n : parseFloat(String(n).replace(/[^\d.]/g, '')) || 0;
  // Format as VND: xxx.xxx đ
  return num.toLocaleString('vi-VN') + ' đ';
}

export function calculateShippingFee(totalQuantity) {
  const qty = Number.isFinite(totalQuantity) ? totalQuantity : 0;
  return qty < 10 ? 10000 : 50000;
}

export function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
