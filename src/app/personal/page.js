"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Toast notification component
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
      } text-white max-w-md`} style={{ animation: 'slideUp 0.3s ease-out' }}>
      <span className="text-xl">{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">✕</button>
    </div>
  );
}

export default function PersonalPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openPw, setOpenPw] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [delPw, setDelPw] = useState('');
  const [toast, setToast] = useState(null);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [savedCart, setSavedCart] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showAllOrders, setShowAllOrders] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [profileRes, ordersRes, cartRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/orders').catch(() => null),
          fetch('/api/cart').catch(() => null)
        ]);

        const profileData = await profileRes.json().catch(() => ({}));
        if (profileData?.ok) {
          setMe(profileData);
          setForm({
            name: profileData.profile?.name || '',
            phone: profileData.profile?.phone || '',
            address: profileData.profile?.address || ''
          });
        } else {
          router.replace('/login');
          return;
        }

        if (ordersRes?.ok) {
          const ordersData = await ordersRes.json().catch(() => ({}));
          const list = ordersData?.orders || ordersData?.items || [];
          if (Array.isArray(list)) setOrders(list);
        }

        if (cartRes?.ok) {
          const cartData = await cartRes.json().catch(() => ({}));
          setSavedCart(cartData?.cart || null);
        }
      } catch (err) {
        router.replace('/login');
      }
      setLoading(false);
    })();
  }, [router]);

  const save = async () => {
    setSaving(true);
    try {
      // Validate form data
      if (form.name && form.name.length > 100) {
        setToast({ message: 'Tên quá dài (tối đa 100 ký tự)', type: 'error' });
        setSaving(false);
        return;
      }

      if (form.phone && !/^(\+84|0)?[0-9]{9,10}$/.test(form.phone.replace(/\s/g, ''))) {
        setToast({ message: 'Số điện thoại không hợp lệ', type: 'error' });
        setSaving(false);
        return;
      }

      const r = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim()
        })
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d?.ok) {
        setMe(d);
        setOpenEdit(false);
        setToast({ message: 'Cập nhật thông tin thành công!', type: 'success' });
      } else {
        setToast({ message: d?.error || 'Cập nhật thất bại', type: 'error' });
      }
    } catch {
      setToast({ message: 'Lỗi kết nối', type: 'error' });
    }
    setSaving(false);
  };

  const doDelete = async () => {
    if (!delPw) {
      setToast({ message: 'Vui lòng nhập mật khẩu', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const r = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: delPw })
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d?.ok) {
        setToast({ message: d?.error || 'Xóa thất bại', type: 'error' });
        setSaving(false);
        return;
      }
      window.location.href = '/';
    } catch {
      setToast({ message: 'Lỗi kết nối', type: 'error' });
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!pw.currentPassword || !pw.newPassword) {
      setToast({ message: 'Vui lòng điền đầy đủ thông tin', type: 'error' });
      return;
    }
    if (pw.newPassword.length < 6) {
      setToast({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự', type: 'error' });
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      setToast({ message: 'Mật khẩu nhập lại không khớp', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const r = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pw.currentPassword, newPassword: pw.newPassword })
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d?.ok) {
        setToast({ message: d?.error || 'Đổi mật khẩu thất bại', type: 'error' });
      } else {
        setOpenPw(false);
        setPw({ currentPassword: '', newPassword: '', confirm: '' });
        setToast({ message: 'Đổi mật khẩu thành công!', type: 'success' });
      }
    } catch {
      setToast({ message: 'Lỗi kết nối', type: 'error' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Bạn cần đăng nhập để xem trang này</p>
          <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

  const savedCartTotal = (savedCart?.items || []).reduce((sum, item) => {
    const price = item.priceAtSave ?? item.product?.salePrice ?? item.product?.price ?? 0;
    return sum + price * (item.quantity || 0);
  }, 0);

  const orderStatusMeta = (statusRaw) => {
    const status = String(statusRaw || '').toLowerCase();
    if (status === 'delivered' || status === 'completed') {
      return { label: 'Hoàn thành', cls: 'bg-green-100 text-green-700' };
    }
    if (status === 'pending') {
      return { label: 'Đang xử lý', cls: 'bg-amber-100 text-amber-700' };
    }
    if (status === 'shipped') {
      return { label: 'Đang giao', cls: 'bg-blue-100 text-blue-700' };
    }
    if (status === 'awaiting_payment') {
      return { label: 'Chờ thanh toán', cls: 'bg-purple-100 text-purple-700' };
    }
    if (status === 'cancelled') {
      return { label: 'Đã hủy', cls: 'bg-red-100 text-red-700' };
    }
    return { label: statusRaw || 'Không xác định', cls: 'bg-gray-100 text-gray-700' };
  };

  const displayedOrders = showAllOrders ? orders : orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <nav className="flex items-center gap-2 text-sm mb-2">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Trang chủ</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Tài khoản của tôi</span>
          </nav>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tài khoản của tôi</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-3xl font-bold mb-3">
                  {(me.profile?.name || me.email)?.substring(0, 1).toUpperCase()}
                </div>
                <h2 className="font-bold text-gray-900">{me.profile?.name || 'Người dùng'}</h2>
                <p className="text-sm text-gray-500">{me.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <span>👤</span>
                  <span className="font-medium">Thông tin cá nhân</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <span>📦</span>
                  <span className="font-medium">Đơn hàng của tôi</span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'security' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <span>🔒</span>
                  <span className="font-medium">Bảo mật</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h2>
                  <button
                    onClick={() => setOpenEdit(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <span>✏️</span> Chỉnh sửa
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Họ và tên</div>
                    <div className="font-medium text-gray-900">{me.profile?.name || 'Chưa cập nhật'}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Số điện thoại</div>
                    <div className="font-medium text-gray-900">{me.profile?.phone || 'Chưa cập nhật'}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Email</div>
                    <div className="font-medium text-gray-900">{me.email}</div>
                    <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <span>✓</span> Đã xác thực
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm text-gray-500 mb-1">Địa chỉ</div>
                    <div className="font-medium text-gray-900">{me.profile?.address || 'Chưa cập nhật'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Giỏ hàng chưa thanh toán</h2>
                    <span className="text-sm text-gray-500">Lưu trong 7 ngày</span>
                  </div>

                  {savedCart?.items?.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm text-gray-500">
                          Hết hạn: {savedCart.expiresAt ? new Date(savedCart.expiresAt).toLocaleString('vi-VN') : 'Không xác định'}
                        </div>
                        <Link href="/cart" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                          Mở giỏ hàng
                        </Link>
                      </div>

                      <div className="space-y-3">
                        {savedCart.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-xl">
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {item.product?.image ? (
                                <Image src={item.product.image} alt={item.product?.name || 'Product'} fill className="object-cover" />
                              ) : null}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">{item.product?.name || 'Sản phẩm'}</div>
                              <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Đơn giá</div>
                              <div className="font-semibold text-gray-900">
                                {formatCurrency(item.priceAtSave ?? item.product?.salePrice ?? item.product?.price ?? 0)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between border-t pt-4">
                        <span className="text-gray-600">Tổng tạm tính</span>
                        <span className="text-lg font-bold text-blue-600">{formatCurrency(savedCartTotal)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="text-5xl mb-3">🛒</div>
                      <p className="text-gray-500">Chưa có giỏ hàng được lưu</p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Lịch sử giao dịch</h2>
                    <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium">
                      Mua thêm →
                    </Link>
                  </div>

                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {displayedOrders.map(order => {
                        const meta = orderStatusMeta(order.status);
                        return (
                          <Link
                            key={order.id}
                            href={`/orders/${order.id}`}
                            className="block p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">Đơn hàng #{order.id}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${meta.cls}`}>
                                {meta.label}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(order.total)}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                      {orders.length > 5 && (
                        <div className="flex justify-center">
                          <button
                            onClick={() => setShowAllOrders((v) => !v)}
                            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            {showAllOrders ? 'Thu gọn' : 'Xem tất cả'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📦</div>
                      <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào</p>
                      <Link href="/products" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-block">
                        Mua sắm ngay
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Bảo mật tài khoản</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <span>🔑</span> Mật khẩu
                        </div>
                        <div className="text-sm text-gray-500">Đổi mật khẩu định kỳ để bảo vệ tài khoản</div>
                      </div>
                      <button
                        onClick={() => setOpenPw(true)}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 transition-colors"
                      >
                        Đổi mật khẩu
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <span>📧</span> Email xác thực
                        </div>
                        <div className="text-sm text-gray-500">{me.email}</div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        ✓ Đã xác thực
                      </span>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-red-100">
                  <h3 className="text-lg font-bold text-red-600 mb-4">⚠️ Vùng nguy hiểm</h3>
                  <p className="text-gray-600 mb-4">Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.</p>
                  <button
                    onClick={() => setOpenDelete(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                  >
                    Xóa tài khoản
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {openEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpenEdit(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Chỉnh sửa thông tin</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Nhập họ và tên"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="0912345678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  value={me.email}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpenEdit(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={save}
                disabled={saving}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${saving ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {openDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpenDelete(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Xóa tài khoản</h3>
              <p className="text-gray-500 mt-2">Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nhập mật khẩu để xác nhận</label>
              <input
                type="password"
                value={delPw}
                onChange={e => setDelPw(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setOpenDelete(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={doDelete}
                disabled={saving}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors ${saving ? 'bg-gray-300 text-gray-500' : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
              >
                {saving ? 'Đang xử lý...' : 'Xóa tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {openPw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpenPw(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Đổi mật khẩu</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={pw.currentPassword}
                  onChange={e => setPw({ ...pw, currentPassword: e.target.value })}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  value={pw.newPassword}
                  onChange={e => setPw({ ...pw, newPassword: e.target.value })}
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu mới</label>
                <input
                  type="password"
                  value={pw.confirm}
                  onChange={e => setPw({ ...pw, confirm: e.target.value })}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setOpenPw(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={changePassword}
                disabled={saving}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors ${saving ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                {saving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
