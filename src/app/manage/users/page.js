"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Shield,
  User,
  Mail,
  Calendar,
  Eye,
} from 'lucide-react';
import { Card } from '../../../components/admin/Card';
import Button from '../../../components/admin/Button';
import Badge from '../../../components/admin/Badge';
import SearchInput from '../../../components/admin/SearchInput';
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

export default function ManageUsersPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    users: 0,
  });

  const load = async (search = q) => {
    setLoading(true);
    const r = await fetch('/api/admin/users' + (search ? `?search=${encodeURIComponent(search)}` : ''));
    const d = await r.json().catch(() => ({}));
    const userItems = d.items || [];
    setItems(userItems);

    if (!search) {
      setStats({
        total: userItems.length,
        admins: userItems.filter((u) => u.role === 'ADMIN').length,
        users: userItems.filter((u) => u.role === 'USER').length,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    load('');
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') {
      return <Badge variant="primary">Admin</Badge>;
    }
    return <Badge variant="default">User</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-500 mt-1">Xem và quản lý tài khoản người dùng</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Tổng người dùng</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
              <p className="text-sm text-gray-500">Quản trị viên</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
              <p className="text-sm text-gray-500">Người dùng thường</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Tìm theo email hoặc tên..."
            className="sm:w-80"
          />
          <p className="text-sm text-gray-500">
            Hiển thị {items.length} người dùng
          </p>
        </div>
      </Card>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow hoverable={false}>
            <TableHead>Người dùng</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead align="right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : items.length === 0 ? (
            <TableEmpty
              colSpan={5}
              icon={Users}
              message="Không có người dùng"
              description={q ? 'Thử từ khóa khác' : 'Chưa có người dùng nào'}
            />
          ) : (
            items.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold text-sm">
                      {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name || '-'}</p>
                      <p className="text-xs text-gray-500">ID: {user.id.slice(-8)}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getRoleBadge(user.role)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </TableCell>
                <TableCell align="right">
                  <Link href={`/manage/users/${user.id}`}>
                    <Button size="xs" variant="ghost" className="text-gray-500 hover:text-brand-600">
                      <Eye className="h-4 w-4" />
                      <span className="ml-1">Chi tiết</span>
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
