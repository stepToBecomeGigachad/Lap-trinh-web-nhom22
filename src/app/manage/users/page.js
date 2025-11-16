"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ManageUsersPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: '', role: '' });

  const load = async (search = q) => {
    setLoading(true);
    const r = await fetch('/api/admin/users' + (search?`?search=${encodeURIComponent(search)}`:''));
    const d = await r.json().catch(()=>({}));
    setItems(d.items||[]);
    setLoading(false);
  };

  useEffect(() => { load(''); }, []);
  useEffect(() => { const t=setTimeout(()=>load(q), 300); return ()=>clearTimeout(t); }, [q]);

  const update = async (id, data) => {
    const r = await fetch(`/api/admin/users/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
    if (r.ok) load();
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setDraft({ name: u.name || '', role: u.role || 'USER' });
  };
  const cancelEdit = () => { setEditingId(null); };
  const saveEdit = async () => {
    if (!editingId) return;
    await update(editingId, { name: draft.name, role: draft.role });
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý người dùng</h1>
      <div className="mb-3">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm theo email hoặc tên" className="px-3 py-2 rounded-lg border w-80" />
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2 text-sm font-semibold bg-gray-50">
            <div className="col-span-4">Email</div>
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2 text-right">Created</div>
          </div>
          {items.map(u => (
            <a key={u.id} href={`/manage/users/${u.id}`} className="grid grid-cols-12 px-4 py-2 border-t items-center text-sm hover:bg-gray-50">
              <div className="col-span-4">{u.email}</div>
              <div className="col-span-4">{u.name || '-'}</div>
              <div className="col-span-2">{u.role}</div>
              <div className="col-span-2 text-right text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</div>
            </a>
          ))}
          {!items.length && (
            <div className="px-4 py-6 text-center text-gray-500">Không có người dùng</div>
          )}
        </div>
      )}
    </div>
  );
}
