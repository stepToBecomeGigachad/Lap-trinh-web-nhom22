"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
} from 'lucide-react';
import { Card } from '../../../components/admin/Card';
import Button from '../../../components/admin/Button';
import { StatusBadge } from '../../../components/admin/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  TableSkeleton,
} from '../../../components/admin/Table';
import Select from '../../../components/admin/Select';
import { DropdownMenu, DropdownMenuItem, DropdownMenuDivider } from '../../../components/admin/DropdownMenu';

const vnd = (n) => (Number(n || 0)).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const statusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chưa giao' },
  { value: 'SHIPPED', label: 'Đang giao' },
  { value: 'DELIVERED', label: 'Giao thành công' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

export default function ManageOrdersPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shipped: 0,
    delivered: 0,
  });

  const load = async (s = status) => {
    setLoading(true);
    const r = await fetch('/api/admin/orders' + (s ? `?status=${encodeURIComponent(s)}` : ''));
    const d = await r.json().catch(() => ({}));
    const orderItems = d.items || [];
    setItems(orderItems);

    // Calculate stats from all items when showing all
    if (!s) {
      setStats({
        total: orderItems.length,
        pending: orderItems.filter((o) => o.status === 'PENDING').length,
        shipped: orderItems.filter((o) => o.status === 'SHIPPED').length,
        delivered: orderItems.filter((o) => o.status === 'DELIVERED').length,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    load('');
  }, []);

  useEffect(() => {
    load(status);
  }, [status]);

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    const r = await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdating(null);
    if (r.ok) load();
  };

  const getStatusIcon = (s) => {
    switch (s) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-red-500" />;
      case 'SHIPPED':
        return <Truck className="h-4 w-4 text-amber-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-500 mt-1">Xem và cập nhật trạng thái đơn hàng</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="cursor-pointer hover:border-brand-300 transition-colors" onClick={() => setStatus('')}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Tổng đơn</p>
            </div>
          </div>
        </Card>
        <Card className="cursor-pointer hover:border-red-300 transition-colors" onClick={() => setStatus('PENDING')}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">Chưa giao</p>
            </div>
          </div>
        </Card>
        <Card className="cursor-pointer hover:border-amber-300 transition-colors" onClick={() => setStatus('SHIPPED')}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Truck className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.shipped}</p>
              <p className="text-sm text-gray-500">Đang giao</p>
            </div>
          </div>
        </Card>
        <Card className="cursor-pointer hover:border-green-300 transition-colors" onClick={() => setStatus('DELIVERED')}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              <p className="text-sm text-gray-500">Đã giao</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-gray-400" />
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statusOptions}
              placeholder=""
              className="w-48"
            />
          </div>
          <p className="text-sm text-gray-500">
            Hiển thị {items.length} đơn hàng
          </p>
        </div>
      </Card>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow hoverable={false}>
            <TableHead>Mã đơn</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead align="right">Tổng tiền</TableHead>
            <TableHead align="right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : items.length === 0 ? (
            <TableEmpty
              colSpan={6}
              icon={ShoppingCart}
              message="Không có đơn hàng"
              description={status ? 'Thử thay đổi bộ lọc để xem thêm' : 'Chưa có đơn hàng nào'}
            />
          ) : (
            items.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link
                    href={`/manage/orders/${order.id}`}
                    className="font-semibold text-brand-600 hover:text-brand-700"
                  >
                    #{order.id.slice(-6).toUpperCase()}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-gray-900">{order.shippingName || '-'}</span>
                </TableCell>
                <TableCell>
                  <span className="text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell align="right">
                  <span className="font-semibold text-gray-900">{vnd((order.total || 0) * 1000)}</span>
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center gap-2 justify-end">
                    <Link href={`/manage/orders/${order.id}`}>
                      <Button size="xs" variant="ghost" className="text-gray-500 hover:text-brand-600">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuItem
                        icon={Clock}
                        onClick={() => updateStatus(order.id, 'PENDING')}
                        disabled={updating === order.id || order.status === 'PENDING'}
                      >
                        Đánh dấu Chưa giao
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={Truck}
                        onClick={() => updateStatus(order.id, 'SHIPPED')}
                        disabled={updating === order.id || order.status === 'SHIPPED'}
                      >
                        Đánh dấu Đang giao
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        icon={CheckCircle}
                        onClick={() => updateStatus(order.id, 'DELIVERED')}
                        disabled={updating === order.id || order.status === 'DELIVERED'}
                      >
                        Đánh dấu Đã giao
                      </DropdownMenuItem>
                      <DropdownMenuDivider />
                      <DropdownMenuItem
                        icon={XCircle}
                        variant="danger"
                        onClick={() => updateStatus(order.id, 'CANCELLED')}
                        disabled={updating === order.id || order.status === 'CANCELLED'}
                      >
                        Hủy đơn hàng
                      </DropdownMenuItem>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
