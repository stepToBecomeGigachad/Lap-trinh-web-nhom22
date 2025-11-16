"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PersonalPage() {
  const [me, setMe] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openPw, setOpenPw] = useState(false);
  const [form, setForm] = useState({ name:'', phone:'' });
  const [delPw, setDelPw] = useState('');
  const [msg, setMsg] = useState('');
  const [pw, setPw] = useState({ currentPassword:'', newPassword:'', confirm:'' });

  useEffect(() => { (async () => {
    const r = await fetch('/api/profile');
    const d = await r.json().catch(()=>({}));
    if (d?.ok) { setMe(d); setForm({ name: d.profile?.name || '', phone: d.profile?.phone || '' }); }
  })(); }, []);

  const save = async () => {
    setMsg('');
    const r = await fetch('/api/profile', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    const d = await r.json().catch(()=>({}));
    if (r.ok && d?.ok) { setMe(d); setOpenEdit(false); }
  };
  const doDelete = async () => {
    setMsg('');
    const r = await fetch('/api/account/delete', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password: delPw }) });
    const d = await r.json().catch(()=>({}));
    if (!r.ok || !d?.ok) { setMsg(d?.error || 'Xóa thất bại'); return; }
    window.location.href = '/';
  };

  if (!me) return <div className="max-w-4xl mx-auto p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-3 flex items-center justify-between mb-2">
        <button onClick={()=>history.back()} className="px-3 py-2 rounded-lg border text-sm">Quay lại</button>
        <Link href="/" className="px-3 py-2 rounded-lg border text-sm">Book Store</Link>
      </div>
      {/* Left card */}
      <aside className="bg-white rounded-xl border p-6 flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full bg-gray-200" />
        <div className="text-lg font-semibold">{me.profile?.name || me.email}</div>
        <div className="flex flex-col gap-2 w-full">
          <button onClick={()=>setOpenEdit(true)} className="px-3 py-2 rounded-lg bg-emerald-700 text-white w-full">Edit Profile</button>
          <button onClick={()=>setOpenPw(true)} className="px-3 py-2 rounded-lg border w-full">Đổi mật khẩu</button>
          <Link href="/orders" className="px-3 py-2 rounded-lg border w-full text-center">Giỏ hàng của tôi</Link>
        </div>
      </aside>

      {/* Right content */}
      <section className="md:col-span-2 bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-emerald-800">Profile Overview</h2>
          <div className="flex items-center gap-2">
            <button onClick={()=>setOpenEdit(true)} title="Chỉnh sửa" className="p-2 rounded border">✎</button>
            <button onClick={()=>setOpenDelete(true)} title="Xóa tài khoản" className="p-2 rounded border border-red-300 text-red-600">🗑</button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold text-emerald-800">Full Name</div>
            <div>{me.profile?.name || '-'}</div>
          </div>
          <div>
            <div className="font-semibold text-emerald-800">Contact number</div>
            <div>{me.profile?.phone || '-'}</div>
          </div>
          <div>
            <div className="font-semibold text-emerald-800">E-mail Address</div>
            <div>{me.email}</div>
          </div>
        </div>
      </section>

      {/* Edit modal */}
      {openEdit && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setOpenEdit(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl p-6">
            <div className="text-lg font-semibold mb-4">Basic Detail</div>
            <div className="grid md:grid-cols-2 gap-4">
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full Name" className="px-3 py-2 rounded-lg border" />
              <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Contact number" className="px-3 py-2 rounded-lg border" />
              <input value={me.email} readOnly className="px-3 py-2 rounded-lg border md:col-span-2 bg-gray-100" />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={()=>setOpenEdit(false)} className="px-3 py-2 rounded-lg border">Hủy</button>
              <button onClick={save} className="px-3 py-2 rounded-lg bg-emerald-700 text-white">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {openDelete && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setOpenDelete(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-2xl p-6">
            <div className="text-lg font-semibold mb-4 text-red-700">Xóa tài khoản</div>
            <p className="text-sm mb-3">Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.</p>
            <input type="password" value={delPw} onChange={e=>setDelPw(e.target.value)} placeholder="Nhập mật khẩu" className="px-3 py-2 rounded-lg border w-full" />
            {msg && <div className="text-sm text-red-600 mt-2">{msg}</div>}
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={()=>setOpenDelete(false)} className="px-3 py-2 rounded-lg border">Hủy bỏ</button>
              <button onClick={doDelete} className="px-3 py-2 rounded-lg bg-red-600 text-white">Xóa tài khoản</button>
            </div>
          </div>
        </div>
      )}

      {/* Change password modal */}
      {openPw && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setOpenPw(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-2xl p-6">
            <div className="text-lg font-semibold mb-4">Đổi mật khẩu</div>
            <div className="grid gap-3">
              <input type="password" value={pw.currentPassword} onChange={e=>setPw({...pw, currentPassword:e.target.value})} placeholder="Mật khẩu hiện tại" className="px-3 py-2 rounded-lg border w-full" />
              <input type="password" value={pw.newPassword} onChange={e=>setPw({...pw, newPassword:e.target.value})} placeholder="Mật khẩu mới" className="px-3 py-2 rounded-lg border w-full" />
              <input type="password" value={pw.confirm} onChange={e=>setPw({...pw, confirm:e.target.value})} placeholder="Nhập lại mật khẩu mới" className="px-3 py-2 rounded-lg border w-full" />
            </div>
            {msg && <div className="text-sm text-red-600 mt-2">{msg}</div>}
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={()=>setOpenPw(false)} className="px-3 py-2 rounded-lg border">Hủy</button>
              <button onClick={async()=>{ if(pw.newPassword!==pw.confirm){setMsg('Mật khẩu nhập lại không khớp'); return;} setMsg(''); const r=await fetch('/api/account/password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({currentPassword:pw.currentPassword,newPassword:pw.newPassword})}); const d=await r.json().catch(()=>({})); if(!r.ok||!d?.ok){setMsg(d?.error||'Đổi mật khẩu thất bại');} else { setOpenPw(false); setPw({currentPassword:'',newPassword:'',confirm:''}); } }} className="px-3 py-2 rounded-lg bg-emerald-700 text-white">Đổi mật khẩu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
