"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '../../../store/cart';
import { formatPrice } from '../../../lib/utils';

// Toast notification component
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-gray-800'
      } text-white`} style={{ animation: 'slideUp 0.3s ease-out' }}>
      <span className="text-xl">{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">✕</button>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState({ total: 0, avg: 0, distr: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, reviews: [] });
  const [my, setMy] = useState({ loggedIn: false });
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const [filter, setFilter] = useState({ sort: 'newest', rating: null, hasImage: false, purchased: false });
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!slug) return; (async () => {
      setLoading(true);
      const [res, mr, rr] = await Promise.all([
        fetch(`/api/products/${slug}`),
        fetch('/api/me').catch(() => null),
        fetch(`/api/products/${slug}/reviews`).catch(() => null)
      ]);
      if (res?.ok) setP(await res.json());
      if (mr) { try { const d = await mr.json(); setMy(d); } catch { } }
      if (rr?.ok) setReviews(await rr.json());
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">📚</div>
        <h1 className="text-2xl font-bold text-gray-800">Không tìm thấy sản phẩm</h1>
        <Link href="/products" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          Xem sản phẩm khác
        </Link>
      </div>
    );
  }

  const price = p.salePrice ?? p.price;
  const inStock = (p.stock ?? 0) > 0;
  const lowStock = (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5;

  const handleAddToCart = () => {
    if (!inStock) {
      setToast({ message: 'Sản phẩm đã hết hàng', type: 'error' });
      return;
    }
    if (quantity > p.stock) {
      setToast({ message: `Chỉ còn ${p.stock} sản phẩm trong kho`, type: 'error' });
      return;
    }
    addItem({ id: p.slug, slug: p.slug, name: p.name, image: p.image, price, quantity, stock: p.stock });
    setToast({ message: 'Đã thêm vào giỏ hàng!', type: 'success' });
  };

  const handleBuyNow = () => {
    if (!inStock) {
      setToast({ message: 'Sản phẩm đã hết hàng', type: 'error' });
      return;
    }
    addItem({ id: p.slug, slug: p.slug, name: p.name, image: p.image, price, quantity, stock: p.stock });
    router.push('/checkout');
  };

  const allImages = p.images?.length ? p.images : (p.image ? [{ url: p.image, alt: p.name }] : []);

  // Filter reviews
  const filteredReviews = (reviews.reviews || [])
    .filter(r => {
      if (filter.rating && r.rating !== filter.rating) return false;
      if (filter.hasImage && !r.images?.length) return false;
      if (filter.purchased && !r.purchaseVerified) return false;
      return true;
    })
    .sort((a, b) => {
      if (filter.sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (filter.sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Trang chủ</Link>
            <span className="text-gray-400">/</span>
            <Link href="/products" className="text-gray-500 hover:text-gray-700">Sản phẩm</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{p.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Product Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left: Image Gallery */}
            <div className="p-8 bg-gray-50">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white shadow-sm mb-4">
                {allImages[selectedImage] && (
                  <Image
                    src={allImages[selectedImage].url}
                    alt={allImages[selectedImage].alt || p.name}
                    fill
                    className="object-contain p-4"
                    priority
                  />
                )}
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.slice(0, 8).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImage === idx ? 'border-blue-600 shadow-md' : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <Image src={img.url} alt={img.alt || p.name} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="p-8 flex flex-col">
              {/* Category & Brand */}
              <div className="flex items-center gap-2 mb-3">
                {p.category && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                    {p.category}
                  </span>
                )}
                {p.brand && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                    {p.brand}
                  </span>
                )}
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">{p.name}</h1>

              {/* Rating summary */}
              {reviews.total > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400 text-lg">{'★'.repeat(Math.round(reviews.avg))}</span>
                    <span className="text-gray-300 text-lg">{'★'.repeat(5 - Math.round(reviews.avg))}</span>
                  </div>
                  <span className="text-gray-600 text-sm">({reviews.total} đánh giá)</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(price)}</span>
                {p.salePrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">{formatPrice(p.price)}</span>
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded">
                      -{Math.round((1 - p.salePrice / p.price) * 100)}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                {inStock ? (
                  <>
                    <span className={`w-2.5 h-2.5 rounded-full ${lowStock ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                    <span className={`font-medium ${lowStock ? 'text-amber-600' : 'text-green-600'}`}>
                      {lowStock ? `Chỉ còn ${p.stock} sản phẩm` : `Còn hàng (${p.stock})`}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="font-medium text-red-600">Hết hàng</span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-8">{p.description}</p>

              {/* Quantity & Actions */}
              <div className="mt-auto space-y-4">
                {/* Quantity selector */}
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium">Số lượng:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                      disabled={!inStock}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={p.stock || 1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.min(p.stock || 1, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-16 h-10 text-center border-x border-gray-300 focus:outline-none"
                      disabled={!inStock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(p.stock || 1, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                      disabled={!inStock || quantity >= (p.stock || 0)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all ${inStock
                        ? 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                      }`}
                  >
                    🛒 Thêm vào giỏ
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!inStock}
                    className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all ${inStock
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Đánh giá từ khách hàng</h2>

          {/* Overall Rating */}
          <div className="flex flex-col md:flex-row gap-8 p-6 bg-gray-50 rounded-xl mb-8">
            <div className="text-center md:pr-8 md:border-r border-gray-200">
              <div className="text-5xl font-bold text-gray-900">{reviews.avg.toFixed(1)}</div>
              <div className="text-amber-400 text-2xl my-2">
                {'★'.repeat(Math.round(reviews.avg))}{'☆'.repeat(5 - Math.round(reviews.avg))}
              </div>
              <div className="text-gray-500">{reviews.total} đánh giá</div>
            </div>

            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map(star => (
                <button
                  key={star}
                  onClick={() => setFilter({ ...filter, rating: filter.rating === star ? null : star })}
                  className="w-full flex items-center gap-3 group"
                >
                  <span className="text-sm text-gray-600 w-12">{star} sao</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all"
                      style={{ width: reviews.total ? `${(reviews.distr?.[star] || 0) / reviews.total * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-10 text-right">{reviews.distr?.[star] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Review Form */}
          {my?.loggedIn ? (
            <div className="p-6 bg-blue-50 rounded-xl mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Viết đánh giá của bạn</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={form.rating}
                  onChange={e => setForm({ ...form, rating: Number(e.target.value) })}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} sao</option>)}
                </select>
                <input
                  value={form.comment}
                  onChange={e => setForm({ ...form, comment: e.target.value })}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={async () => {
                    const r = await fetch(`/api/products/${slug}/reviews`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(form)
                    });
                    if (r.ok) {
                      const d = await fetch(`/api/products/${slug}/reviews`);
                      setReviews(await d.json());
                      setForm({ rating: 5, comment: '' });
                      setToast({ message: 'Đã gửi đánh giá!', type: 'success' });
                    } else {
                      setToast({ message: 'Không thể gửi đánh giá', type: 'error' });
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Gửi
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-8 text-amber-800">
              <span className="mr-2">💡</span>
              Đăng nhập để viết đánh giá.{' '}
              <Link href="/login" className="font-semibold underline hover:no-underline">Đăng nhập</Link>
              {' '}hoặc{' '}
              <Link href="/register" className="font-semibold underline hover:no-underline">Đăng ký</Link>
            </div>
          )}

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['Mới nhất', 'Có hình ảnh', 'Đã mua hàng'].map((label, idx) => {
              const keys = ['newest', 'hasImage', 'purchased'];
              const active = idx === 0 ? filter.sort === 'newest' && !filter.rating : filter[keys[idx]];
              return (
                <button
                  key={label}
                  onClick={() => {
                    if (idx === 0) setFilter({ ...filter, sort: 'newest', rating: null, hasImage: false, purchased: false });
                    else if (idx === 1) setFilter({ ...filter, hasImage: !filter.hasImage });
                    else setFilter({ ...filter, purchased: !filter.purchased });
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Reviews list */}
          <div className="space-y-6">
            {filteredReviews.map((r) => (
              <div key={r.id} className="pb-6 border-b border-gray-100 last:border-0">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
                    {(r.user?.name || r.user?.email || 'U').substring(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{r.user?.name || r.user?.email}</span>
                      <span className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-amber-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      {r.purchaseVerified && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">✓ Đã mua</span>
                      )}
                    </div>
                    <p className="text-gray-600">{r.comment}</p>
                  </div>
                </div>
              </div>
            ))}

            {filteredReviews.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">📝</div>
                <p>Chưa có đánh giá nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
