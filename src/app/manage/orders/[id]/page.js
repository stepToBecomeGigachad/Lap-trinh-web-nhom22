"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { calculateShippingFee } from '../../../../lib/utils';

const vnd = (n) => (Number(n||0)).toLocaleString('vi-VN', { style:'currency', currency:'VND' });

export default function ManageOrderDetail() {
  const params = useParams();
  const id = params?.id;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { if (!id) return; (async () => {
    try {
      const r = await fetch(`/api/admin/orders/${id}`);
      const d = await r.json();
      if (!r.ok || !d?.ok) { setError(d?.error || 'Không tìm thấy đơn'); return; }
      setData(d.order);
    } catch {
      setError('Lỗi máy chủ');
    }
  })(); }, [id]);

  if (error) return <div className="max-w-6xl mx-auto p-6"><p className="text-red-600">{error}</p></div>;
  if (!data) return <div className="max-w-6xl mx-auto p-6"><p>Loading...</p></div>;

  const buyer = data.user?.email ? `${data.user?.name || ''} <${data.user.email}>` : data.shippingName || 'Khách vãng lai';
  const items = (data.items||[]).map(it => ({
    name: it.product?.name || it.productId,
    slug: it.product?.slug || it.productId,
    image: it.product?.images?.[0]?.url || '',
    quantity: it.quantity,
    priceVND: it.priceAtOrder || 0,
  }));
  const totalVND = data.total || 0;
  const subtotalVND = items.reduce((sum, item) => sum + item.priceVND * item.quantity, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = totalQuantity ? calculateShippingFee(totalQuantity) : 0;
  const discountAmount = Math.max(0, subtotalVND + shippingFee - totalVND);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Đơn hàng #{data.id}</h1>
        <Link href="/" className="px-3 py-2 rounded-lg border text-sm font-medium">Book Store</Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-gray-200 p-4 bg-white">
          <div><b>Người đặt:</b> {buyer}</div>
          <div><b>Liên hệ:</b> {data.phone}</div>
          <div><b>Địa chỉ:</b> {data.address}, {data.district}, {data.city}</div>
          <div><b>Ngày tạo:</b> {new Date(data.createdAt).toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-gray-200 p-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="font-medium">Tổng cộng (VND)</span>
            <b className="text-lg">{vnd(totalVND)}</b>
          </div>
        </div>
      </div>

      <h3 className="font-semibold mb-2">Sản phẩm</h3>
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
        <div className="grid grid-cols-12 px-4 py-2 text-sm font-semibold bg-gray-50">
          <div className="col-span-6">Sản phẩm</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-2 text-right">Đơn giá (VND)</div>
          <div className="col-span-2 text-right">Thành tiền</div>
        </div>
        {items.map((i, idx) => (
          <div key={idx} className="grid grid-cols-12 px-4 py-2 border-t text-sm">
            <div className="col-span-6 flex items-center gap-3 min-w-0">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                {i.image ? (
                  <Image src={i.image} alt={i.name} fill className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">{i.name}</div>
                <div className="text-xs text-gray-500 truncate">{i.slug}</div>
              </div>
            </div>
            <div className="col-span-2 text-center">{i.quantity}</div>
            <div className="col-span-2 text-right">{vnd(i.priceVND)}</div>
            <div className="col-span-2 text-right">{vnd(i.priceVND * i.quantity)}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between text-gray-600">
          <span>Tạm tính</span>
          <span>{vnd(subtotalVND)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-green-600 mt-2">
            <span>Giảm giá</span>
            <span>-{vnd(discountAmount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-gray-600 mt-2">
          <span>Phí vận chuyển</span>
          <span>{vnd(shippingFee)}</span>
        </div>
        <div className="flex items-center justify-between font-semibold text-gray-900 mt-3 pt-3 border-t">
          <span>Tổng cộng</span>
          <span>{vnd(totalVND)}</span>
        </div>
      </div>
    </div>
  );
}
