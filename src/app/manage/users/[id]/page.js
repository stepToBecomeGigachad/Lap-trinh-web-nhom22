"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ManageUserDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name:'', role:'USER' });
  const [msg, setMsg] = useState('');

  useEffect(() => { if (!id) return; (async () => {
    const r = await fetch(`/api/admin/users/${id}`);
    const d = await r.json().catch(()=>({}));
    if (r.ok && d?.ok) { setUser(d.user); setForm({ name: d.user.name || '', role: d.user.role || 'USER' }); }
  })(); }, [id]);

  const save = async () => {
    setMsg('');
    const r = await fetch(`/api/admin/users/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    if (!r.ok) { setMsg('Lưu thất bại'); return; }
    router.back();
  };

  if (!user) return <div className="max-w-4xl mx-auto p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-3 gap-6">
      <aside className="bg-white rounded-xl border p-6 flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full bg-gray-200" />
        <div className="text-lg font-semibold">{user.name || user.email}</div>
        <div className="text-sm text-gray-500">{user.email}</div>
      </aside>

      <section className="md:col-span-2 bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-emerald-800">User Detail</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-sm mb-1">Name</div>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="px-3 py-2 rounded-lg border w-full" />
          </div>
          <div>
            <div className="font-semibold text-sm mb-1">Role</div>
            <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="px-3 py-2 rounded-lg border w-full">
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </div>
        {msg && <div className="text-sm text-red-600 mt-2">{msg}</div>}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={()=>router.back()} className="px-3 py-2 rounded-lg border">Hủy</button>
          <button onClick={save} className="px-3 py-2 rounded-lg bg-emerald-700 text-white">Lưu</button>
        </div>
      </section>
    </div>
  );
}

