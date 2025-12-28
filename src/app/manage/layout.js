"use client";
import Sidebar from './_components/Sidebar';
import HeaderBar from './_components/Header';
import { ToastProvider } from '../../components/admin/Toast';

export default function ManageLayout({ children }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <HeaderBar />
            <main className="flex-1 p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
