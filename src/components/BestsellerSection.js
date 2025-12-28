"use client";

import Image from "next/image";
import Link from "next/link";

export default function BestsellerSection() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <span className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-6">
              🏆 Sách bán chạy nhất thế giới
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              The Art of Invisibility
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Lời khuyên thực tế về cách trở nên vô hình trên mạng từ &quot;hacker bị FBI truy nã gắt gao nhất&quot; (Wired).
            </p>
            <p className="text-gray-600 mb-8">
              Mỗi bước đi của bạn trên mạng đều được theo dõi và lưu trữ, và danh tính của bạn có thể bị đánh cắp.
              Các công ty lớn và chính phủ muốn biết và khai thác những gì bạn làm, và quyền riêng tư là một điều xa xỉ mà ít người có thể hiểu được.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Mua ngay
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-900 text-gray-900 font-semibold rounded-xl hover:bg-gray-900 hover:text-white transition-all"
              >
                Xem chi tiết
              </Link>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4 mt-8 pt-8 border-t border-amber-200">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-600">4.9/5 từ hơn 2,000 đánh giá</span>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative z-10">
              <Image
                src="/images/invisibility.jpg"
                alt="The Art of Invisibility"
                width={400}
                height={500}
                className="w-full max-w-sm mx-auto rounded-3xl shadow-2xl"
              />

              {/* Badge */}
              <div className="absolute -top-4 -right-4 lg:right-8 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg animate-pulse">
                -25% OFF
              </div>

              {/* Price tag */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-6 py-4 shadow-xl">
                <div className="text-sm text-gray-500 line-through">450.000đ</div>
                <div className="text-2xl font-bold text-orange-600">337.500đ</div>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full blur-3xl opacity-60 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
