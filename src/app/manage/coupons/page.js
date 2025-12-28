"use client";
import { useEffect, useState } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Tag,
    X,
    Save,
    Percent,
    DollarSign,
    Calendar,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '../../../components/admin/Card';
import Button from '../../../components/admin/Button';
import Input from '../../../components/admin/Input';
import Select from '../../../components/admin/Select';
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
import Pagination from '../../../components/admin/Pagination';
import SearchInput from '../../../components/admin/SearchInput';
import Modal, { ConfirmModal } from '../../../components/admin/Modal';

const vnd = (n) => (Number(n || 0)).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

export default function ManageCouponsPage() {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const defaultForm = {
        code: '',
        description: '',
        discountType: 'percent',
        discountValue: '',
        minOrderValue: '',
        maxDiscount: '',
        usageLimit: '',
        isActive: true,
        startDate: '',
        endDate: '',
    };
    const [form, setForm] = useState(defaultForm);
    const [editId, setEditId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/coupons?page=${page}&limit=${pageSize}&q=${encodeURIComponent(q)}`);
            const data = await res.json();
            if (data.ok) {
                setItems(data.items);
                setTotal(data.total);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [page, q]);

    const openCreate = () => {
        setForm(defaultForm);
        setEditId(null);
        setError('');
        setModalOpen(true);
    };

    const openEdit = (row) => {
        setForm({
            code: row.code,
            description: row.description || '',
            discountType: row.discountType,
            discountValue: row.discountValue,
            minOrderValue: row.minOrderValue || '',
            maxDiscount: row.maxDiscount || '',
            usageLimit: row.usageLimit || '',
            isActive: row.isActive,
            startDate: row.startDate ? new Date(row.startDate).toISOString().split('T')[0] : '',
            endDate: row.endDate ? new Date(row.endDate).toISOString().split('T')[0] : '',
        });
        setEditId(row.id);
        setError('');
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.code || !form.discountValue) {
            setError('Vui lòng nhập mã và giá trị giảm');
            return;
        }
        setSaving(true);
        setError('');

        try {
            const url = editId ? `/api/admin/coupons/${editId}` : '/api/admin/coupons';
            const method = editId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                setError(data.error || 'Có lỗi xảy ra');
            } else {
                setModalOpen(false);
                setForm(defaultForm);
                setEditId(null);
                fetchData();
            }
        } catch {
            setError('Lỗi kết nối');
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await fetch(`/api/admin/coupons/${deleteId}`, { method: 'DELETE' });
            setDeleteId(null);
            fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    const toggleActive = async (row) => {
        try {
            await fetch(`/api/admin/coupons/${row.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !row.isActive }),
            });
            fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý mã giảm giá</h1>
                    <p className="text-slate-500 mt-1">Thêm, sửa, xóa mã khuyến mãi</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm mã giảm giá
                </Button>
            </div>

            {/* Main Card */}
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-blue-600" />
                        {total} mã giảm giá
                    </CardTitle>
                    <SearchInput
                        value={q}
                        onChange={setQ}
                        placeholder="Tìm kiếm mã..."
                        className="w-full sm:w-64"
                    />
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã</TableHead>
                                <TableHead>Mô tả</TableHead>
                                <TableHead>Loại</TableHead>
                                <TableHead>Giá trị</TableHead>
                                <TableHead>Đã dùng</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Hết hạn</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableSkeleton cols={8} rows={5} />
                            ) : items.length === 0 ? (
                                <TableEmpty cols={8} message="Chưa có mã giảm giá nào" />
                            ) : (
                                items.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                {row.code}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-slate-600 text-sm">{row.description || '—'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${row.discountType === 'percent'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}>
                                                {row.discountType === 'percent' ? <Percent className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                                                {row.discountType === 'percent' ? 'Phần trăm' : 'Cố định'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold">
                                                {row.discountType === 'percent'
                                                    ? `${row.discountValue}%`
                                                    : vnd(row.discountValue)}
                                            </span>
                                            {row.discountType === 'percent' && row.maxDiscount && (
                                                <div className="text-xs text-slate-500">Tối đa: {vnd(row.maxDiscount)}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-slate-600">
                                                {row.usedCount}{row.usageLimit ? `/${row.usageLimit}` : ''}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => toggleActive(row)}
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${row.isActive
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {row.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                                {row.isActive ? 'Hoạt động' : 'Tắt'}
                                            </button>
                                        </TableCell>
                                        <TableCell>
                                            {row.endDate ? (
                                                <span className={`text-sm ${new Date(row.endDate) < new Date() ? 'text-red-500' : 'text-slate-600'}`}>
                                                    {new Date(row.endDate).toLocaleDateString('vi-VN')}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-sm">Không giới hạn</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(row)}
                                                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(row.id)}
                                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {total > pageSize && (
                        <div className="p-4 border-t border-slate-100">
                            <Pagination
                                page={page}
                                pageSize={pageSize}
                                total={total}
                                onChange={setPage}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Mã giảm giá *"
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            placeholder="VD: SALE50"
                            className="uppercase"
                        />
                        <Select
                            label="Loại giảm giá"
                            value={form.discountType}
                            onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                        >
                            <option value="percent">Phần trăm (%)</option>
                            <option value="fixed">Số tiền cố định (VND)</option>
                        </Select>
                    </div>

                    <Input
                        label="Mô tả"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="VD: Giảm 50% cho đơn hàng đầu tiên"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={form.discountType === 'percent' ? 'Phần trăm giảm (%) *' : 'Số tiền giảm (VND) *'}
                            type="number"
                            value={form.discountValue}
                            onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                            placeholder={form.discountType === 'percent' ? 'VD: 10' : 'VD: 50000'}
                        />
                        {form.discountType === 'percent' && (
                            <Input
                                label="Giảm tối đa (VND)"
                                type="number"
                                value={form.maxDiscount}
                                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                                placeholder="VD: 100000"
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Đơn hàng tối thiểu (VND)"
                            type="number"
                            value={form.minOrderValue}
                            onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                            placeholder="VD: 200000"
                        />
                        <Input
                            label="Giới hạn lượt dùng"
                            type="number"
                            value={form.usageLimit}
                            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                            placeholder="Để trống = không giới hạn"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Ngày bắt đầu"
                            type="date"
                            value={form.startDate}
                            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        />
                        <Input
                            label="Ngày kết thúc"
                            type="date"
                            value={form.endDate}
                            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={form.isActive}
                            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label htmlFor="isActive" className="text-sm text-slate-700">Kích hoạt mã giảm giá</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                            <X className="w-4 h-4 mr-2" />
                            Hủy
                        </Button>
                        <Button type="submit" disabled={saving}>
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Đang lưu...' : 'Lưu'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirm Modal */}
            <ConfirmModal
                open={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Xóa mã giảm giá?"
                message="Bạn có chắc muốn xóa mã giảm giá này? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                confirmVariant="danger"
            />
        </div>
    );
}
