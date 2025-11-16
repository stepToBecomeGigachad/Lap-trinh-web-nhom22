"use client";
import Sidebar from './_components/Sidebar';
import HeaderBar from './_components/Header';

export default function ManageLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <HeaderBar />
          {children}
        </main>
      </div>
    </div>
  );
}
