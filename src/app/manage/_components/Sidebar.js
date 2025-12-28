"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Store,
  Tag,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/manage', icon: LayoutDashboard, exact: true },
  { name: 'Sản phẩm', href: '/manage/products', icon: Package },
  { name: 'Đơn hàng', href: '/manage/orders', icon: ShoppingCart },
  { name: 'Mã giảm giá', href: '/manage/coupons', icon: Tag },
  { name: 'Người dùng', href: '/manage/users', icon: Users },
  { name: 'Thống kê', href: '/manage/stats', icon: BarChart3 },
  { name: 'Đánh giá', href: '/manage/reviews', icon: MessageSquare },
];

const NavItem = ({ item, isCollapsed }) => {
  const pathname = usePathname();
  const isActive = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <Link
      href={item.href}
      className={`
        group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
        ${isActive
          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
        ${isCollapsed ? 'justify-center' : ''}
      `}
      title={isCollapsed ? item.name : undefined}
    >
      <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
      {!isCollapsed && <span>{item.name}</span>}
    </Link>
  );
};

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`
        hidden md:flex flex-col bg-white border-r border-gray-200 min-h-screen sticky top-0 transition-all duration-300
        ${isCollapsed ? 'w-[72px]' : 'w-64'}
      `}
    >
      {/* Logo - Click to go to Homepage */}
      <Link
        href="/"
        className={`flex items-center h-16 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${isCollapsed ? 'justify-center' : 'gap-3'}`}
        title="Về trang chủ"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-lg shadow-md">
          B
        </div>
        {!isCollapsed && (
          <div>
            <h1 className="font-bold text-gray-900">BookStore</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        )}
      </Link>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 ${isCollapsed ? 'text-center' : 'px-3'}`}>
          {isCollapsed ? '•••' : 'Menu chính'}
        </div>
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} isCollapsed={isCollapsed} />
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Về cửa hàng' : undefined}
        >
          <Store className="h-5 w-5 text-gray-500" />
          {!isCollapsed && <span>Về cửa hàng</span>}
        </Link>

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 text-gray-500" />
              <span>Thu gọn</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

