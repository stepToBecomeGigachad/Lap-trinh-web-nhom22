"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavItem = ({ href, label, icon }) => {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link href={href} className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
      <span className={`size-4 ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>{icon}</span>
      {label}
    </Link>
  );
};

const Circle = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><circle cx="12" cy="12" r="8"/></svg>);

export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 flex-col gap-2 p-4 border-r bg-white min-h-screen sticky top-0">
      <div className="flex items-center gap-2 text-xl font-extrabold mb-2">
        <span className="text-gray-900">Admin</span>
      </div>
      <NavItem href="/manage" label="Dashboard" icon={<Circle/>} />
      <NavItem href="/manage/products" label="Products" icon={<Circle/>} />
      <NavItem href="/manage/orders" label="Orders" icon={<Circle/>} />
      <NavItem href="/manage/users" label="Users" icon={<Circle/>} />
      <NavItem href="/manage/stats" label="Stats" icon={<Circle/>} />
    </aside>
  );
}

