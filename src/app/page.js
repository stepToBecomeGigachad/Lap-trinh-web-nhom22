"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import BestsellerSection from "../components/BestsellerSection";
import BenefitsSection from "../components/BenefitsSection";
import { formatPrice } from "../lib/utils";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products?limit=8').then(r => r.json()),
          fetch('/api/categories').then(r => r.json())
        ]);
        setProducts((prodRes.items || []).slice(0, 8).map(b => ({
          slug: b.slug,
          image: b.image,
          title: b.name,
          price: b.price,
          salePrice: b.salePrice,
          stock: b.stock,
          priceDisplay: formatPrice(b.salePrice ?? b.price)
        })));
        setCategories(catRes || []);
      } catch (e) {
        console.error('Error loading homepage data:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showHero={true} />

      <main>
        {/* Discover Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                ✨ Khám phá
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Tìm cuốn sách hoàn hảo cho bạn
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Từ những hướng dẫn cơ bản đến kiến thức chuyên sâu, khám phá bộ sưu tập sách đa dạng của chúng tôi.
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse shadow-sm">
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                {products.map((book) => (
                  <ProductCard key={book.slug} book={book} onClick={() => { }} />
                ))}
              </div>
            )}

            <div className="text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Xem tất cả sách
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
                📚 Danh mục
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Khám phá theo danh mục
              </h2>
              <p className="text-gray-600 text-lg">
                Tìm sách theo lĩnh vực bạn quan tâm
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
              {categories.length > 0 ? categories.map((cat, index) => {
                const icons = ['🔐', '🌐', '🛡️', '💻', '🔍', '📊'];
                const colors = [
                  'from-blue-500 to-blue-600',
                  'from-green-500 to-green-600',
                  'from-purple-500 to-purple-600',
                  'from-orange-500 to-orange-600',
                  'from-pink-500 to-pink-600',
                  'from-cyan-500 to-cyan-600'
                ];
                return (
                  <Link
                    key={cat.slug}
                    href={`/products?category=${cat.slug}`}
                    className="group relative bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                  >
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${colors[index % 6]} flex items-center justify-center text-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      {icons[index % 6]}
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                  </Link>
                );
              }) : (
                ['Cryptography', 'Web Security', 'Network', 'Reverse Engineering', 'Forensics', 'Malware'].map((name, index) => {
                  const icons = ['🔐', '🌐', '🛡️', '💻', '🔍', '📊'];
                  const colors = [
                    'from-blue-500 to-blue-600',
                    'from-green-500 to-green-600',
                    'from-purple-500 to-purple-600',
                    'from-orange-500 to-orange-600',
                    'from-pink-500 to-pink-600',
                    'from-cyan-500 to-cyan-600'
                  ];
                  return (
                    <Link
                      key={name}
                      href={`/products?category=${name.toLowerCase().replace(' ', '-')}`}
                      className="group relative bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                    >
                      <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${colors[index]} flex items-center justify-center text-2xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                        {icons[index]}
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {name}
                      </h3>
                    </Link>
                  );
                })
              )}
            </div>

            <div className="text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-xl hover:bg-gray-900 hover:text-white transition-all"
              >
                Xem tất cả danh mục
              </Link>
            </div>
          </div>
        </section>

        <BestsellerSection />
        <BenefitsSection />

        {/* Newsletter Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-blue-800">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Đăng ký nhận thông tin
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Nhận thông báo về sách mới và ưu đãi đặc biệt trực tiếp vào email của bạn.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Email của bạn..."
                className="flex-1 px-6 py-4 rounded-xl border-0 focus:ring-2 focus:ring-white/50 text-gray-900"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
