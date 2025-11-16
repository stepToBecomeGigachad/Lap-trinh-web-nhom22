"use client";
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const vnd = (n) => (Number(n||0)).toLocaleString('vi-VN', {style:'currency', currency:'VND'});

export default function ManageProductsPage() {
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ slug:'', name:'', price:'', salePrice:'', categorySlug:'', image:'', description:'' });
  const [editing, setEditing] = useState(null); // id being edited

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const load = async (opts={}) => {
    const p = opts.page ?? page;
    const ps = opts.pageSize ?? pageSize;
    const qq = opts.q ?? q;
    setLoading(true);
    const [cRes,pRes] = await Promise.all([
      cats.length ? Promise.resolve({ok:true, json: async()=>cats}) : fetch('/api/categories'),
      fetch(`/api/admin/products?q=${encodeURIComponent(qq)}&page=${p}&pageSize=${ps}`)
    ]);
    if (cRes.ok && cats.length===0) setCats(await cRes.json());
    if (pRes.ok) { const d = await pRes.json(); setItems(d.items||[]); setTotal(d.total||0); setPage(d.page||1); setPageSize(d.pageSize||ps); }
    setLoading(false);
  };

  useEffect(() => { load({page:1}); }, []);
  useEffect(() => { const t=setTimeout(()=>load({page:1,q}), 350); return ()=>clearTimeout(t); }, [q]);

  const createProduct = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      description: form.description.trim() || form.name.trim(),
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      categorySlug: form.categorySlug,
      image: form.image?.trim() || null,
    };
    const r = await fetch('/api/admin/products', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const d = await r.json().catch(()=>({}));
    setSaving(false);
    if (!r.ok || !d?.ok) { setError(d?.error || 'Tạo sản phẩm thất bại'); return; }
    setForm({ slug:'', name:'', price:'', salePrice:'', categorySlug:'', image:'', description:'' });
    load({page:1});
  };

  const saveRow = async (row) => {
    setSaving(true);
    const payload = { name: row.name, price: row.price, salePrice: row.salePrice ?? null, stock: row.stock ?? 0, categorySlug: row.category || undefined };
    const r = await fetch(`/api/admin/products/${row.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    setSaving(false); setEditing(null);
    if (r.ok) load({page});
  };

  const deleteRow = async (id) => {
    if (!confirm('Xóa sản phẩm?')) return;
    const r = await fetch(`/api/admin/products/${id}`, { method:'DELETE' });
    if (r.ok) load({page});
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <Link href="/" className="px-3 py-2 rounded-lg border text-sm font-medium">Book Store</Link>
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-4 bg-white rounded-xl border p-4">
        <input value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})} placeholder="slug" className="px-3 py-2 rounded-lg border" />
        <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="name" className="px-3 py-2 rounded-lg border" />
        <input value={form.price} onChange={e=>setForm({...form, price:e.target.value})} placeholder="price" type="number" step="0.01" className="px-3 py-2 rounded-lg border" />
        <input value={form.salePrice} onChange={e=>setForm({...form, salePrice:e.target.value})} placeholder="salePrice" type="number" step="0.01" className="px-3 py-2 rounded-lg border" />
        <select value={form.categorySlug} onChange={e=>setForm({...form, categorySlug:e.target.value})} className="px-3 py-2 rounded-lg border">
          <option value="">-- category --</option>
          {cats.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <input value={form.image} onChange={e=>setForm({...form, image:e.target.value})} placeholder="image url" className="px-3 py-2 rounded-lg border md:col-span-2" />
        <input value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="description" className="px-3 py-2 rounded-lg border md:col-span-3" />
        {error && <div className="text-red-600 md:col-span-3">{error}</div>}
        <button onClick={createProduct} disabled={saving} className="px-3 py-2 rounded-lg border bg-gray-900 text-white">{saving? 'Đang lưu...' : 'Thêm'}</button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm theo tên" className="px-3 py-2 rounded-lg border w-72" />
        <div className="flex items-center gap-2 text-sm">
          <span>Page {page}/{totalPages}</span>
          <button onClick={()=>page>1 && load({page:page-1})} className="px-2 py-1 rounded-lg border">Prev</button>
          <button onClick={()=>page<totalPages && load({page:page+1})} className="px-2 py-1 rounded-lg border">Next</button>
          <select value={pageSize} onChange={e=>load({page:1,pageSize:Number(e.target.value)})} className="px-2 py-1 rounded-lg border">
            {[10,20,50].map(n => <option key={n} value={n}>{n}/page</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Category</th>
              <th className="text-right p-3">Price</th>
              <th className="text-right p-3">Sale</th>
              <th className="text-right p-3">Stock</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan={6}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-3" colSpan={6}>Không có sản phẩm</td></tr>
            ) : items.map(row => {
              const isEdit = editing === row.id;
              const [name, setName] = [row._name ?? row.name, (v)=>{row._name=v;}];
              const [category, setCategory] = [row._category ?? row.category, (v)=>{row._category=v;}];
              const [price, setPrice] = [row._price ?? row.price, (v)=>{row._price=Number(v);}];
              const [sale, setSale] = [row._sale ?? (row.salePrice ?? ''), (v)=>{row._sale=v===''? '': Number(v);}];
              const [stock, setStock] = [row._stock ?? (row.stock ?? 0), (v)=>{row._stock=Number(v);}];

              return (
                <tr key={row.id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {row.image ? <Image src={row.image} alt={row.name} width={40} height={40} className="rounded" /> : <div className="w-10 h-10 rounded bg-gray-200" />}
                      <div className="flex flex-col">
                        {isEdit ? (
                          <input defaultValue={row.name} onChange={e=>setName(e.target.value)} className="px-2 py-1 rounded border" />
                        ) : (
                          <div className="font-medium">{row.name}</div>
                        )}
                        <div className="text-gray-500 text-xs">{row.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    {isEdit ? (
                      <select defaultValue={row.category||''} onChange={e=>setCategory(e.target.value)} className="px-2 py-1 rounded border">
                        <option value="">--</option>
                        {cats.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                      </select>
                    ) : (row.category || '-')}
                  </td>
                  <td className="p-3 text-right">
                    {isEdit ? (
                      <input type="number" step="0.01" defaultValue={row.price} onChange={e=>setPrice(e.target.value)} className="px-2 py-1 rounded border w-28 text-right" />
                    ) : vnd(Number(row.price)*1000)}
                  </td>
                  <td className="p-3 text-right">
                    {isEdit ? (
                      <input type="number" step="0.01" defaultValue={row.salePrice ?? ''} onChange={e=>setSale(e.target.value)} className="px-2 py-1 rounded border w-28 text-right" />
                    ) : (row.salePrice!=null ? vnd(Number(row.salePrice)*1000) : '-')}
                  </td>
                  <td className="p-3 text-right">
                    {isEdit ? (
                      <input type="number" defaultValue={row.stock ?? 0} onChange={e=>setStock(e.target.value)} className="px-2 py-1 rounded border w-20 text-right" />
                    ) : (row.stock ?? 0)}
                  </td>
                  <td className="p-3 text-right">
                    {isEdit ? (
                      <div className="flex gap-2 justify-end">
                        <button className="px-2 py-1 rounded-lg border" onClick={()=>{ row.name=name; row.category=category; row.price=price; row.salePrice=(sale===''? null: Number(sale)); row.stock=stock; saveRow(row); }}>Save</button>
                        <button className="px-2 py-1 rounded-lg border" onClick={()=>setEditing(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <button className="px-2 py-1 rounded-lg border" onClick={()=>setEditing(row.id)}>Edit</button>
                        <button className="px-2 py-1 rounded-lg border" onClick={()=>deleteRow(row.id)}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
