"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';
import { formatPrice } from '../../lib/utils';

export default function Products() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [cats, setCats] = useState([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [p, c] = await Promise.all([
        fetch(`/api/products?pageSize=100`).then(r => r.json()),
        fetch(`/api/categories`).then(r => r.json())
      ]);
      setItems(p.items || []);
      setCats(c || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let result = (items || []).filter(b => {
      const matchQ = q ? b.name.toLowerCase().includes(q.toLowerCase()) : true;
      const matchC = category ? (b.category || '') === category : true;
      const price = b.salePrice ?? b.price;
      const minOK = priceMin ? price >= Number(priceMin) : true;
      const maxOK = priceMax ? price <= Number(priceMax) : true;
      return matchQ && matchC && minOK && maxOK;
    });

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result.map(b => ({
      slug: b.slug,
      image: b.image,
      title: b.name,
      price: b.price,
      salePrice: b.salePrice,
      stock: b.stock,
      priceDisplay: formatPrice(b.salePrice ?? b.price)
    }));
  }, [items, q, category, priceMin, priceMax, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm text-blue-200 mb-4">
              <Link href="/" className="hover:text-white">Trang chủ</Link>
              <span>/</span>
              <span className="text-white">Sản phẩm</span>
            </nav>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Khám phá sách</h1>
            <p className="text-blue-100 text-lg">Tìm kiếm trong {items.length} đầu sách chất lượng</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                <div className="relative">
                  <input
                    placeholder="Nhập tên sách..."
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                >
                  <option value="">Tất cả</option>
                  {Array.isArray(cats) && cats.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng giá</label>
                <div className="flex gap-2">
                  <input
                    placeholder="Từ"
                    value={priceMin}
                    onChange={e => setPriceMin(e.target.value)}
                    className="w-1/2 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <input
                    placeholder="Đến"
                    value={priceMax}
                    onChange={e => setPriceMax(e.target.value)}
                    className="w-1/2 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá thấp → cao</option>
                  <option value="price-desc">Giá cao → thấp</option>
                  <option value="name">Theo tên A-Z</option>
                </select>
              </div>
            </div>

            {/* Active filters & results count */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Hiển thị <span className="font-semibold text-gray-900">{filtered.length}</span> sản phẩm
              </div>
              {(q || category || priceMin || priceMax) && (
                <button
                  onClick={() => { setQ(''); setCategory(''); setPriceMin(''); setPriceMax(''); }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-500 mb-6">Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
              <button
                onClick={() => { setQ(''); setCategory(''); setPriceMin(''); setPriceMax(''); }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((book) => (
                <ProductCard key={book.slug} book={book} onClick={() => { }} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

