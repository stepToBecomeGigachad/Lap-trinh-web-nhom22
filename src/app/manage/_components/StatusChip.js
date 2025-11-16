"use client";

export default function StatusChip({ status }) {
  const map = {
    DELIVERED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Giao thành công' },
    SHIPPED: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Đang giao' },
    PENDING: { bg: 'bg-red-100', text: 'text-red-700', label: 'Chưa giao' },
    CANCELLED: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Đã hủy' },
  };
  const s = map[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>{s.label}</span>;
}

