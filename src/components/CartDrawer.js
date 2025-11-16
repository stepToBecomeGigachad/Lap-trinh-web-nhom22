"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '../store/cart';
import { useEffect, useState } from 'react';
import { formatPrice } from '../lib/utils';

export default function CartDrawer() {
  const { items, isOpen, setOpen, removeItem, updateQuantity, totalPrice } = useCartStore((s)=>({
    items: s.items,
    isOpen: s.isOpen,
    setOpen: s.setOpen,
    removeItem: s.removeItem,
    updateQuantity: s.updateQuantity,
    totalPrice: s.totalPrice,
  }));

  if (!isOpen) return null;

  return (
    <>
      <div onClick={()=>setOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000 }} aria-hidden="true" />
      <div style={{ position:'fixed', top:0, right:0, bottom:0, width:360, maxWidth:'90vw', background:'#fff', zIndex:1001, display:'flex', flexDirection:'column', boxShadow:'-4px 0 24px rgba(0,0,0,0.15)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:12, borderBottom:'1px solid #eee' }}>
          <div style={{ fontWeight:700 }}>Giỏ hàng ({items.length})</div>
          <button onClick={()=>setOpen(false)} style={{ border:'1px solid #ddd', borderRadius:8, padding:'6px 10px' }}>Đóng</button>
        </div>

        {items.length === 0 ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#666' }}>Giỏ hàng trống</div>
        ) : (
          <>
            <div style={{ flex:1, overflow:'auto', padding:12, display:'grid', gap:8 }}>
              {items.map((item) => (
                <div key={item.id} style={{ display:'grid', gridTemplateColumns:'64px 1fr auto', gap:8, border:'1px solid #eee', borderRadius:12, padding:8, alignItems:'center' }}>
                  <div style={{ position:'relative', width:64, height:64, borderRadius:8, overflow:'hidden', background:'#f7f7f7' }}>
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill style={{ objectFit:'cover' }} />
                    ) : null}
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{item.name}</div>
                    <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:6 }}>
                      <button onClick={()=>useCartStore.getState().updateQuantity(item.id, Math.max(1, item.quantity-1))} style={{ padding:'2px 8px', border:'1px solid #ddd', borderRadius:6 }}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={()=>useCartStore.getState().updateQuantity(item.id, item.quantity+1)} style={{ padding:'2px 8px', border:'1px solid #ddd', borderRadius:6 }}>＋</button>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:600 }}>{formatPrice(item.price)}</div>
                    <button onClick={()=>removeItem(item.id)} style={{ marginTop:6, color:'#888', border:'1px solid #ddd', borderRadius:6, padding:'2px 6px' }}>Xóa</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop:'1px solid #eee', padding:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                <span>Tổng cộng</span>
                <b>{formatPrice(totalPrice())}</b>
              </div>
              <Link href="/checkout" onClick={()=>setOpen(false)} style={{ display:'block', textAlign:'center', padding:'10px 12px', borderRadius:8, background:'#111827', color:'#fff', textDecoration:'none' }}>Thanh toán</Link>
              <Link href="/cart" onClick={()=>setOpen(false)} style={{ display:'block', textAlign:'center', padding:'10px 12px', borderRadius:8, border:'1px solid #ddd', marginTop:8, textDecoration:'none' }}>Xem giỏ hàng</Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}

