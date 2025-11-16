"use client";
import Link from 'next/link';

export default function HeaderBar({ title = 'Management' }) {
  return (
    <div className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white text-sm">A</span>
          <div className="text-lg font-semibold">{title}</div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="px-3 py-2 rounded-lg border text-sm font-medium">Book Store</Link>
        </div>
      </div>
    </div>
  );
}

