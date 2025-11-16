"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import StatusChip from '../_components/StatusChip';

const vnd = (n) => (Number(n||0)).toLocaleString('vi-VN', {style:'currency', currency:'VND'});

const STATUS_LABEL = (s) => s === 'DELIVERED' ? 'Giao thành công' : s === 'SHIPPED' ? 'Đang giao' : s === 'PENDING' ? 'Chưa giao' : s;
const statusChipStyle = (s) => ({
  padding:'4px 8px', borderRadius:999,
  background: s === 'DELIVERED' ? '#e6f7e9' : s === 'SHIPPED' ? '#fff7e6' : s === 'PENDING' ? '#ffecec' : '#f0f0f0',
  color: s === 'DELIVERED' ? '#15803d' : s === 'SHIPPED' ? '#b45309' : s === 'PENDING' ? '#b91c1c' : '#555',
  fontWeight:600, fontSize:12,
});

export default function ManageOrdersPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (s = status) => {
    setLoading(true);
    const r = await fetch('/api/admin/orders' + (s?`?status=${encodeURIComponent(s)}`:''));
    const d = await r.json().catch(()=>({}));
    setItems(d.items||[]);
    setLoading(false);
  };

  useEffect(() => { load(''); }, []);
  useEffect(() => { load(status); }, [status]);

  const updateStatus = async (id, s) => {
    const r = await fetch(`/api/admin/orders/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status:s })});
    if (r.ok) load();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>
      <div className="mb-3">
        <select value={status} onChange={e=>setStatus(e.target.value)} className="px-3 py-2 rounded-lg border">
          <option value="">Tất cả</option>
          <option value="PENDING">Chưa giao</option>
          <option value="SHIPPED">Đang giao</option>
          <option value="DELIVERED">Giao thành công</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="rounded-xl border bg-white overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">Order</th>
                <th className="text-left p-3">Created</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Total</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td className="p-3" colSpan={5}>Không có đơn hàng</td></tr>
              ) : items.map(o => (
                <tr key={o.id} className="border-t">
                  <td className="p-3"><Link href={`/manage/orders/${o.id}`} className="font-semibold text-blue-600">#{o.id}</Link></td>
                  <td className="p-3">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="p-3"><StatusChip status={o.status} /></td>
                  <td className="p-3 text-right font-semibold">{vnd((o.total||0) * 1000)}</td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      <button className="px-2 py-1 rounded-lg border" onClick={()=>updateStatus(o.id,'PENDING')}>Chưa giao</button>
                      <button className="px-2 py-1 rounded-lg border" onClick={()=>updateStatus(o.id,'SHIPPED')}>Đang giao</button>
                      <button className="px-2 py-1 rounded-lg border" onClick={()=>updateStatus(o.id,'DELIVERED')}>Đã giao</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
