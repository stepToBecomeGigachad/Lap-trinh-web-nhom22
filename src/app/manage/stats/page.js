"use client";
import { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  BarChart3,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/admin/Card';
import StatsCard from '../../../components/admin/StatsCard';

const vnd = (n) => (Number(n || 0)).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

// Custom tooltip
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-lg font-semibold text-brand-600">
          {vnd(payload[0].value * 1000)}
        </p>
      </div>
    );
  }
  return null;
}

// Skeleton loader
function StatsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-72 bg-gray-100 rounded"></div>
      </div>
    </div>
  );
}

export default function ManageStatsPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Thống kê doanh thu</h1>
          <p className="text-gray-500 mt-1">Báo cáo doanh thu từ đơn hàng đã giao thành công</p>
        </div>
        <StatsSkeleton />
      </div>
    );
  }

  // Calculate comparison percentages (mock for display)
  const weekVsMonth = data?.month > 0 ? ((data?.week / data?.month) * 100).toFixed(1) : 0;
  const todayVsWeek = data?.week > 0 ? ((data?.today / data?.week) * 100).toFixed(1) : 0;

  // Pie chart data
  const pieData = [
    { name: 'Hôm nay', value: data?.today || 0, color: '#465FFF' },
    { name: 'Còn lại trong tuần', value: Math.max(0, (data?.week || 0) - (data?.today || 0)), color: '#9CB9FF' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Thống kê doanh thu</h1>
        <p className="text-gray-500 mt-1">Báo cáo doanh thu từ đơn hàng đã giao thành công</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-700 border-0 text-white">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Hôm nay
                </p>
                <p className="text-3xl font-bold mt-2">{vnd((data?.today || 0) * 1000)}</p>
                <p className="text-green-100 text-sm mt-2">
                  {todayVsWeek}% so với tuần này
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <DollarSign className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 border-0 text-white">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Tuần này
                </p>
                <p className="text-3xl font-bold mt-2">{vnd((data?.week || 0) * 1000)}</p>
                <p className="text-blue-100 text-sm mt-2">
                  {weekVsMonth}% so với tháng này
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-700 border-0 text-white">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  Tháng này
                </p>
                <p className="text-3xl font-bold mt-2">{vnd((data?.month || 0) * 1000)}</p>
                <p className="text-purple-100 text-sm mt-2">
                  Tổng doanh thu tháng
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <BarChart3 className="h-8 w-8" />
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
            <CardTitle>Biểu đồ doanh thu 7 ngày gần đây</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Doanh thu từ đơn hàng đã giao thành công</p>
          </div>
          <div className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chartData || []}>
                  <defs>
                    <linearGradient id="colorRevenueStats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
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
                    stroke="#10B981"
                    strokeWidth={3}
                    fill="url(#colorRevenueStats)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card padding={false}>
          <div className="p-6 border-b border-gray-100">
            <CardTitle>Tỷ lệ doanh thu hôm nay</CardTitle>
            <p className="text-sm text-gray-500 mt-1">So với tổng doanh thu tuần</p>
          </div>
          <div className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => vnd(value * 1000)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card padding={false}>
        <div className="p-6 border-b border-gray-100">
          <CardTitle>So sánh doanh thu theo ngày</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Biểu đồ cột so sánh doanh thu hàng ngày</p>
        </div>
        <div className="p-6">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.chartData || []}>
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
                <Bar dataKey="revenue" fill="#465FFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Summary Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900">Lưu ý về thống kê</h4>
            <p className="text-sm text-blue-700 mt-1">
              Doanh thu chỉ bao gồm các đơn hàng có trạng thái &quot;Giao thành công&quot; (DELIVERED).
              Các đơn hàng đang chờ xử lý hoặc đang giao không được tính vào thống kê này.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
