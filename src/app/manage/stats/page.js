"use client";
import { useEffect, useState } from 'react';

const vnd = (n) => (Number(n||0)).toLocaleString('vi-VN', {style:'currency', currency:'VND'});

export default function ManageStatsPage() {
  const [data, setData] = useState({ today:0, week:0, month:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    setLoading(true);
    const r = await fetch('/api/admin/stats');
    const d = await r.json().catch(()=>({}));
    if (r.ok) setData({ today:d.today||0, week:d.week||0, month:d.month||0 });
    setLoading(false);
  })(); }, []);

  const box = (title, value) => (
    <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm">
      <div className="font-semibold text-gray-800 mb-2">{title}</div>
      <div className="text-2xl font-extrabold text-gray-900">{vnd(Number(value||0) * 1000)}</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Thống kê doanh thu (đơn giao thành công)</h1>
      {loading ? <p>Loading...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {box('Hôm nay', data.today)}
          {box('Tuần này', data.week)}
          {box('Tháng này', data.month)}
        </div>
      )}
    </div>
  );
}
