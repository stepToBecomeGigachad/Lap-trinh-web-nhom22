"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import Breadcrumb from '../../../components/admin/Breadcrumb';

// Mobile sidebar
function MobileSidebar({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
        <div className="p-4">
          <h2 className="font-bold text-lg mb-4">Menu</h2>
          <nav className="space-y-2">
            <Link href="/manage" className="block py-2 px-3 rounded-lg hover:bg-gray-100" onClick={onClose}>Dashboard</Link>
            <Link href="/manage/products" className="block py-2 px-3 rounded-lg hover:bg-gray-100" onClick={onClose}>Sản phẩm</Link>
            <Link href="/manage/orders" className="block py-2 px-3 rounded-lg hover:bg-gray-100" onClick={onClose}>Đơn hàng</Link>
            <Link href="/manage/users" className="block py-2 px-3 rounded-lg hover:bg-gray-100" onClick={onClose}>Người dùng</Link>
            <Link href="/manage/stats" className="block py-2 px-3 rounded-lg hover:bg-gray-100" onClick={onClose}>Thống kê</Link>
            <Link href="/manage/reviews" className="block py-2 px-3 rounded-lg hover:bg-gray-100" onClick={onClose}>Đánh giá</Link>
          </nav>
        </div>
      </div>
    </div>
  );
}

// Generate breadcrumbs from pathname
function generateBreadcrumbs(pathname) {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];

  const labels = {
    'manage': 'Dashboard',
    'products': 'Sản phẩm',
    'orders': 'Đơn hàng',
    'users': 'Người dùng',
    'stats': 'Thống kê',
    'reviews': 'Đánh giá',
  };

  let currentPath = '';
  for (let i = 0; i < paths.length; i++) {
    currentPath += '/' + paths[i];
    const isLast = i === paths.length - 1;
    const label = labels[paths[i]] || paths[i];

    if (paths[i] === 'manage' && paths.length === 1) continue;
    if (paths[i] === 'manage') continue;

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    });
  }

  return breadcrumbs;
}

export default function HeaderBar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const breadcrumbs = generateBreadcrumbs(pathname);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data?.user || null))
      .catch(() => { });
  }, []);

  return (
    <>
      <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden sm:block">
              <Breadcrumb items={breadcrumbs} />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="h-5 w-5" />
            </button>

            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="hidden sm:block w-px h-6 bg-gray-200 mx-2" />

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@bookstore.com'}</p>
              </div>
              <button className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold text-sm shadow-md">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

