import Link from "next/link";
import dynamic from "next/dynamic";
import AuthStatus from './AuthStatus';
const AdminMenuItem = dynamic(() => import('./AdminMenuItem'), { ssr: false });
import CartStatus from './CartStatus';

export default function Header({ showHero = false }) {
  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
      {/* Top bar */}
      <div className="border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform">
              📚
            </div>
            <span className="text-xl font-bold text-white tracking-tight">BookStore</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-gray-300 hover:text-white font-medium transition-colors relative group">
              Tất cả sách
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all"></span>
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white font-medium transition-colors relative group">
              Giới thiệu
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all"></span>
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white font-medium transition-colors relative group">
              Liên hệ
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all"></span>
            </Link>
            <AdminMenuItem />
          </nav>

          <div className="flex items-center gap-4">
            <AuthStatus />
            <CartStatus />
          </div>
        </div>
      </div>

      {/* Hero Section - Only show on homepage */}
      {showHero && (
        <section className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>

          <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <span className="inline-block px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold mb-6 border border-blue-500/30">
                  🎉 Sách mới mỗi tuần
                </span>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
                  Thư viện kiến thức
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Cybersecurity</span>
                </h1>
                <p className="text-lg lg:text-xl text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
                  Khám phá bộ sưu tập sách chất lượng, từ cơ bản đến nâng cao, giúp bạn trở thành chuyên gia bảo mật.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Khám phá ngay
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
                  >
                    Tìm hiểu thêm
                  </Link>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8 mt-10 justify-center lg:justify-start">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">500+</div>
                    <div className="text-sm text-gray-400">Đầu sách</div>
                  </div>
                  <div className="w-px h-10 bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">10k+</div>
                    <div className="text-sm text-gray-400">Khách hàng</div>
                  </div>
                  <div className="w-px h-10 bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">⭐ 4.9</div>
                    <div className="text-sm text-gray-400">Đánh giá</div>
                  </div>
                </div>
              </div>

              <div className="relative hidden lg:block">
                <div className="relative z-10">
                  <img
                    src="/images/intro.jpg"
                    alt="Hero cover"
                    className="w-full h-[480px] object-cover rounded-3xl shadow-2xl"
                  />
                  {/* Floating card */}
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                      📖
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Miễn phí vận chuyển</div>
                      <div className="text-sm text-gray-500">Cho đơn trên 500k</div>
                    </div>
                  </div>

                  <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔥</span>
                      <div>
                        <div className="font-semibold text-gray-900">Hot Deal</div>
                        <div className="text-sm text-red-500">Giảm đến 30%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-2xl -z-10"></div>
              </div>
            </div>
          </div>
        </section>
      )}
    </header>
  );
}
