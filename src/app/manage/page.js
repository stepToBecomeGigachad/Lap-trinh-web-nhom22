"use client";
import Link from 'next/link';

export default function ManageHome() {
  const item = (href, title, desc) => (
    <Link href={href} style={{display:'block', border:'1px solid #eee', borderRadius:12, padding:16}}>
      <div style={{fontWeight:700}}>{title}</div>
      <div style={{color:'#666'}}>{desc}</div>
    </Link>
  );

  return (
    <div className="container" style={{padding:'24px 0'}}>
      <h1>Admin Management</h1>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12}}>
        {item('/manage/products', 'Products', 'Tạo và xem sản phẩm')}
        {item('/manage/orders', 'Orders', 'Xem và cập nhật trạng thái đơn hàng')}
        {item('/manage/users', 'Users', 'Xem và chỉnh sửa thông tin người dùng')}
        {item('/manage/stats', 'Stats', 'Thống kê doanh thu (đơn giao thành công)')}
      </div>
    </div>
  );
}

