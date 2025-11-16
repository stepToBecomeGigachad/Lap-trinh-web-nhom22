"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from '../../components/Header';
import ProductCard from '../../components/ProductCard';
import { formatPrice } from '../../lib/utils';

export default function Products() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [cats, setCats] = useState([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  useEffect(() => { (async () => {
    const [p,c] = await Promise.all([
      fetch(`/api/products`).then(r=>r.json()),
      fetch(`/api/categories`).then(r=>r.json())
    ]);
    setItems(p.items || []);
    setCats(c || []);
  })(); }, []);

  const filtered = useMemo(() => {
    return (items || []).filter(b => {
      const matchQ = q ? b.name.toLowerCase().includes(q.toLowerCase()) : true;
      const matchC = category ? (b.category||'') === category : true;
      const price = b.salePrice ?? b.price;
      const minOK = priceMin ? price >= Number(priceMin) : true;
      const maxOK = priceMax ? price <= Number(priceMax) : true;
      return matchQ && matchC && minOK && maxOK;
    }).map(b => ({
      slug: b.slug,
      image: b.image,
      title: b.name,
      price: b.price,
      priceDisplay: formatPrice(b.salePrice ?? b.price)
    }));
  }, [items, q, category, priceMin, priceMax]);

  return (
    <div>
      <Header />

      <main>
        <section className="section-pad" style={{ padding: "32px 0" }}>
          <div className="container" style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h1 style={{ marginBottom: 16 }}>Tất cả sản phẩm</h1>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <input placeholder="Tìm theo tên" value={q} onChange={e=>setQ(e.target.value)} style={{ gridColumn:'span 2', padding:10, border:'1px solid #ddd', borderRadius:8 }} />
              <select value={category} onChange={e=>setCategory(e.target.value)} style={{ padding:10, border:'1px solid #ddd', borderRadius:8 }}>
                <option value="">Tất cả danh mục</option>
                {Array.isArray(cats) && cats.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
              <div style={{ display:'flex', gap:8 }}>
                <input placeholder="Giá từ" value={priceMin} onChange={e=>setPriceMin(e.target.value)} style={{ padding:10, border:'1px solid #ddd', borderRadius:8, width:'50%' }} />
                <input placeholder="đến" value={priceMax} onChange={e=>setPriceMax(e.target.value)} style={{ padding:10, border:'1px solid #ddd', borderRadius:8, width:'50%' }} />
              </div>
            </div>
            <div className="product-grid four" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "24px"
            }}>
              {filtered.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: 24, textAlign: 'center', color: '#666', border: '1px dashed #ddd', borderRadius: 8 }}>
                  Không có sản phẩm phù hợp bộ lọc.
                </div>
              ) : (
                filtered.map((book) => (
                  <ProductCard key={book.slug} book={book} onClick={() => {}} />
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

