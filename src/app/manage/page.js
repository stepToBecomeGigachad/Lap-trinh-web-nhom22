"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/admin/Card';
import StatsCard from '../../components/admin/StatsCard';
import { StatusBadge } from '../../components/admin/Badge';

const vnd = (n) => (Number(n || 0)).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

// Custom tooltip for chart
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-lg font-semibold text-brand-600">
          {vnd(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

// Skeleton loader
function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManageHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats?mode=dashboard')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Tổng quan về hoạt động kinh doanh</p>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Tổng quan về hoạt động kinh doanh</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Doanh thu tháng này"
          value={vnd(data?.month || 0)}
          icon={DollarSign}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Tổng đơn hàng"
          value={data?.totalOrders || 0}
          icon={ShoppingCart}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Sản phẩm"
          value={data?.totalProducts || 0}
          icon={Package}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatsCard
          title="Người dùng"
          value={data?.totalUsers || 0}
          icon={Users}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />
      </div>

      {/* Revenue stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-brand-500 to-brand-700 border-0 text-white">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-100 text-sm font-medium">Hôm nay</p>
                <p className="text-2xl font-bold mt-1">{vnd(data?.today || 0)}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Tuần này</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{vnd(data?.week || 0)}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Đơn chờ xử lý</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{data?.pendingOrders || 0}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="p-6 border-b border-gray-100">
            <CardTitle>Doanh thu 7 ngày gần đây</CardTitle>
          </div>
          <div className="p-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chartData || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#465FFF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#465FFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#667085', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#667085', fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#465FFF"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Top Products */}
        <Card padding={false}>
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <CardTitle>Sản phẩm bán chạy</CardTitle>
            <Link href="/manage/products" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="p-4">
            {data?.topProducts?.length > 0 ? (
              <div className="space-y-3">
                {data.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${index === 0 ? 'bg-amber-100 text-amber-700' :
                        index === 1 ? 'bg-gray-200 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-600'
                      }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{vnd(product.price)}</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {product.quantity} bán
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Chưa có dữ liệu bán hàng
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card padding={false}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <CardTitle>Đơn hàng gần đây</CardTitle>
          <Link href="/manage/orders" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mã đơn</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.recentOrders?.length > 0 ? (
                data.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/manage/orders/${order.id}`} className="font-semibold text-brand-600 hover:text-brand-700">
                        #{order.id.slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.shippingName}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {vnd(order.total)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Link href="/manage/products" className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Sản phẩm</p>
              <p className="text-xs text-gray-500">Quản lý kho hàng</p>
            </div>
          </div>
        </Link>
        <Link href="/manage/orders" className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Đơn hàng</p>
              <p className="text-xs text-gray-500">Xử lý đơn hàng</p>
            </div>
          </div>
        </Link>
        <Link href="/manage/users" className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Người dùng</p>
              <p className="text-xs text-gray-500">Quản lý tài khoản</p>
            </div>
          </div>
        </Link>
        <Link href="/manage/stats" className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Thống kê</p>
              <p className="text-xs text-gray-500">Báo cáo chi tiết</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
