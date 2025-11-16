"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '../../../store/cart';
import { formatPrice } from '../../../lib/utils';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug;
  const [p, setP] = useState(null);
  const [reviews, setReviews] = useState({ total:0, avg:0, distr:{1:0,2:0,3:0,4:0,5:0}, reviews:[] });
  const [my, setMy] = useState({ loggedIn:false });
  const [form, setForm] = useState({ rating:5, comment:'' });
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => { if (!slug) return; (async () => {
    const [res, mr, rr] = await Promise.all([
      fetch(`/api/products/${slug}`),
      fetch('/api/me').catch(()=>null),
      fetch(`/api/products/${slug}/reviews`).catch(()=>null)
    ]);
    if (res?.ok) setP(await res.json());
    if (mr) { try { const d = await mr.json(); setMy(d); } catch {} }
    if (rr?.ok) setReviews(await rr.json());
  })(); }, [slug]);

  if (!p) return null;
  const price = p.salePrice ?? p.price;

  return (
    <div className="container" style={{ padding: '24px 0', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
        <button onClick={()=>history.back()} style={{ border:'1px solid #ddd', borderRadius:8, padding:'6px 10px' }}>Quay lại</button>
        <Link href="/" style={{ border:'1px solid #ddd', borderRadius:8, padding:'6px 10px', textDecoration:'none' }}>Book Store</Link>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        {/* Left: gallery + actions */}
        <div>
          <div style={{ position:'relative', width:'100%', paddingTop:'125%', borderRadius:12, overflow:'hidden', background:'#f7f7f7' }}>
            {p.image && <Image src={p.image} alt={p.name} fill style={{ objectFit:'contain' }} />}
          </div>
          <div style={{ display:'flex', gap:8, marginTop:8, overflowX:'auto' }}>
            {(p.images||[]).slice(0,8).map((im, idx) => (
              <div key={idx} style={{ position:'relative', width:64, height:64, borderRadius:8, overflow:'hidden', background:'#f7f7f7' }}>
                <Image src={im.url} alt={im.alt||p.name} fill style={{ objectFit:'cover' }} />
              </div>
            ))}
            {(p.images||[]).length>8 && (
              <div style={{ width:64, height:64, borderRadius:8, border:'1px dashed #ddd', display:'flex', alignItems:'center', justifyContent:'center', color:'#666' }}>+{(p.images||[]).length-8}</div>
            )}
          </div>
          <div style={{ display:'flex', gap:12, marginTop:12 }}>
            <button className="btn outline" onClick={() => addItem({ id: p.slug, slug:p.slug, name: p.name, image: p.image, price, quantity: 1 })}>Thêm vào giỏ hàng</button>
            <Link href="/checkout" className="btn primary">Mua ngay</Link>
          </div>
          <div style={{ marginTop:16, border:'1px solid #eee', borderRadius:12 }}>
            <div style={{ padding:12, borderBottom:'1px solid #eee' }}><b>Chính sách ưu đãi</b></div>
            <div style={{ padding:12, display:'grid', gap:8, color:'#444' }}>
              <div>• Giao nhanh và uy tín</div>
              <div>• Đổi trả miễn phí toàn quốc</div>
              <div>• Ưu đãi khi mua số lượng lớn</div>
            </div>
          </div>
        </div>
        {/* Right: info + description + reviews */}
        <div>
          <h1 style={{ marginTop:0 }}>{p.name}</h1>
          <div style={{ color:'var(--accent)', fontWeight:700, fontSize:20 }}>{formatPrice(price)}</div>
          <p style={{ marginTop:12 }}>{p.description}</p>
          <div style={{ marginTop:16, border:'1px solid #eee', borderRadius:12 }}>
            <div style={{ padding:12, borderBottom:'1px solid #eee' }}><b>Thông tin chi tiết</b></div>
            <div style={{ padding:12, color:'#444' }}>
              Danh mục: {p.category || '-'}<br />
              Thương hiệu: {p.brand || '-'}
            </div>
          </div>

          <div style={{ marginTop:16, border:'1px solid #eee', borderRadius:12 }}>
            <div style={{ padding:12, borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <b>Đánh giá sản phẩm</b>
              <span style={{ color:'#666' }}>{reviews.total} đánh giá • Trung bình {reviews.avg.toFixed(1)}/5</span>
            </div>
            <div style={{ padding:12 }}>
              {/* Distribution */}
              {[5,4,3,2,1].map(star => (
                <div key={star} style={{ display:'grid', gridTemplateColumns:'40px 1fr 60px', gap:8, alignItems:'center', marginBottom:6 }}>
                  <span>{star} sao</span>
                  <div style={{ background:'#f3f4f6', borderRadius:999, height:8 }}>
                    <div style={{ background:'#f59e0b', width: reviews.total ? `${(reviews.distr?.[star]||0)/reviews.total*100}%` : '0%', height:8, borderRadius:999 }} />
                  </div>
                  <span style={{ textAlign:'right', color:'#666' }}>{reviews.total ? Math.round((reviews.distr?.[star]||0)/reviews.total*100) : 0}%</span>
                </div>
              ))}

              {/* Form */}
              {my?.loggedIn ? (
                <div style={{ marginTop:12, borderTop:'1px solid #eee', paddingTop:12 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <select value={form.rating} onChange={e=>setForm({...form, rating:Number(e.target.value)})} style={{ padding:8, border:'1px solid #ddd', borderRadius:8 }}>
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} sao</option>)}
                    </select>
                    <input value={form.comment} onChange={e=>setForm({...form, comment:e.target.value})} placeholder="Viết nhận xét" style={{ flex:1, padding:8, border:'1px solid #ddd', borderRadius:8 }} />
                    <button className="btn primary" onClick={async()=>{ const r=await fetch(`/api/products/${slug}/reviews`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) }); if(r.ok){ const d=await fetch(`/api/products/${slug}/reviews`); setReviews(await d.json()); setForm({ rating:5, comment:''}); } }}>Gửi</button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop:12, color:'#666' }}>Chỉ thành viên mới có thể nhận xét. Vui lòng <Link href="/login">đăng nhập</Link> hoặc <Link href="/register">đăng ký</Link>.</div>
              )}

              {/* Reviews list */}
              <div style={{ marginTop:12, display:'grid', gap:8 }}>
                {reviews.reviews?.map((r) => (
                  <div key={r.id} style={{ border:'1px solid #eee', borderRadius:8, padding:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <b>{r.user?.name || r.user?.email}</b>
                      <span style={{ color:'#666' }}>{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ color:'#f59e0b' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                    <div>{r.comment}</div>
                  </div>
                ))}
                {!reviews.reviews?.length && <div style={{ color:'#666' }}>Chưa có đánh giá</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
