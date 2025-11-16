"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '../../store/cart';
import { formatPrice } from '../../lib/utils';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const totalPrice = useCartStore((s) => s.totalPrice());

  if (!items.length) {
    return (
      <div className="container" style={{padding:'40px 0', textAlign:'center'}}>
        <h1>Giỏ hàng trống</h1>
        <p style={{color:'var(--muted)'}}>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        <Link href="/products" className="btn primary" style={{marginTop:12}}>Mua sắm ngay</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{padding:'24px 0'}}>
      <h1>Giỏ hàng</h1>
      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:24, alignItems:'start'}}>
        <div style={{display:'grid', gap:12}}>
          {items.map(item => (
            <div key={item.id} style={{display:'flex', gap:12, border:'1px solid var(--border)', borderRadius:12, padding:12}}>
              <div style={{position:'relative', width:96, height:96, borderRadius:8, overflow:'hidden', background:'#f7f7f7'}}>
                <Image src={item.image} alt={item.name} fill style={{objectFit:'cover'}} />
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600}}>{item.name}</div>
                <div style={{color:'var(--accent)', fontWeight:600}}>{formatPrice(item.price)}</div>
              </div>
              <div style={{display:'flex', flexDirection:'column', alignItems:'end', gap:8}}>
                <button onClick={() => removeItem(item.id)} className="btn outline" style={{padding:'6px 10px'}}>Xóa</button>
                <div style={{display:'flex', gap:8, alignItems:'center'}}>
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity-1))} className="btn outline" style={{padding:'6px 10px'}}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity+1)} className="btn outline" style={{padding:'6px 10px'}}>＋</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{border:'1px solid var(--border)', borderRadius:12, padding:16, position:'sticky', top:20}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
            <span>Tạm tính</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
            <span>Phí vận chuyển</span>
            <span>Miễn phí</span>
          </div>
          <hr/>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:8, fontWeight:700}}>
            <span>Tổng cộng</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <Link href="/checkout" className="btn primary" style={{marginTop:12, display:'block', textAlign:'center'}}>Thanh toán</Link>
        </div>
      </div>
    </div>
  );
}
