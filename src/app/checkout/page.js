"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cart';
// Persist to DB via API
import { formatPrice } from '../../lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore(s => s.items);
  const clearCart = useCartStore(s => s.clearCart);
  const total = useCartStore(s => s.totalPrice());
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({ name:'', phone:'', address:'', city:'', district:'' });

  useEffect(() => { (async () => {
    try { const r = await fetch('/api/me'); const d = await r.json(); setMe(d); } catch {}
  })(); }, []);

  useEffect(() => { if (!items?.length) router.replace('/cart'); }, [items, router]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!items?.length) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        items: items.map(i => ({ slug: i.slug || i.id, quantity: i.quantity })),
        shipping: { name: form.name, phone: form.phone, address: form.address, city: form.city, district: form.district }
      };
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json().catch(()=>({}));
      if (!res.ok || !data?.ok) { setError(data?.error || 'Không thể tạo đơn hàng'); setSubmitting(false); return; }
      clearCart();
      router.replace(`/orders/${data.id}?success=1`);
    } catch (err) {
      setError('Lỗi máy chủ');
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '24px 0', maxWidth: 1100 }}>
      <h1>Thanh toán</h1>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:24 }}>
        <form onSubmit={onSubmit} style={{ display:'grid', gap:12 }}>
          <input placeholder="Họ tên người nhận" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="input" style={{ padding:12, border:'1px solid #ddd', borderRadius:8 }} required />
          <input placeholder="Số điện thoại" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="input" style={{ padding:12, border:'1px solid #ddd', borderRadius:8 }} required />
          <input placeholder="Địa chỉ" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} className="input" style={{ padding:12, border:'1px solid #ddd', borderRadius:8 }} required />
          <div style={{ display:'flex', gap:12 }}>
            <input placeholder="Thành phố" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} style={{ flex:1, padding:12, border:'1px solid #ddd', borderRadius:8 }} required />
            <input placeholder="Quận/Huyện" value={form.district} onChange={e=>setForm({...form,district:e.target.value})} style={{ flex:1, padding:12, border:'1px solid #ddd', borderRadius:8 }} required />
          </div>
          {error && <div style={{ color:'red' }}>{error}</div>}
          <button disabled={submitting} className="btn primary" style={{ maxWidth:240 }}>{submitting? 'Đang xử lý...' : 'Đặt hàng'}</button>
        </form>
        <div style={{ border:'1px solid #eee', padding:16, borderRadius:12 }}>
          <h3>Tổng tiền</h3>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
            <span>Tạm tính</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
            <span>Vận chuyển</span>
            <span>Miễn phí</span>
          </div>
          <hr />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, fontWeight:700 }}>
            <span>Tổng cộng</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
