"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  X,
  Save,
  ImageIcon,
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
import { DropdownMenu, DropdownMenuItem, DropdownMenuDivider } from '../../../components/admin/DropdownMenu';

const vnd = (n) => (Number(n || 0)).toLocaleString('vi-VN') + ' đ';

export default function ManageProductsPage() {
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    slug: '',
    name: '',
    price: '',
    salePrice: '',
    categorySlug: '',
    image: '',
    description: '',
  });

  // Edit state
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const load = async (opts = {}) => {
    const p = opts.page ?? page;
    const ps = opts.pageSize ?? pageSize;
    const qq = opts.q ?? q;
    setLoading(true);
    const [cRes, pRes] = await Promise.all([
      cats.length ? Promise.resolve({ ok: true, json: async () => cats }) : fetch('/api/categories'),
      fetch(`/api/admin/products?q=${encodeURIComponent(qq)}&page=${p}&pageSize=${ps}`),
    ]);
    if (cRes.ok && cats.length === 0) setCats(await cRes.json());
    if (pRes.ok) {
      const d = await pRes.json();
      setItems(d.items || []);
      setTotal(d.total || 0);
      setPage(d.page || 1);
      setPageSize(d.pageSize || ps);
    }
    setLoading(false);
  };

  useEffect(() => {
    load({ page: 1 });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load({ page: 1, q }), 350);
    return () => clearTimeout(t);
  }, [q]);

  const createProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      description: form.description.trim() || form.name.trim(),
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      categorySlug: form.categorySlug,
      image: form.image?.trim() || null,
    };
    const r = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const d = await r.json().catch(() => ({}));
    setSaving(false);
    if (!r.ok || !d?.ok) {
      setError(d?.error || 'Tạo sản phẩm thất bại');
      return;
    }
    setForm({ slug: '', name: '', price: '', salePrice: '', categorySlug: '', image: '', description: '' });
    setShowAddModal(false);
    load({ page: 1 });
  };

  const startEdit = (row) => {
    setEditingRow(row.id);
    setEditForm({
      name: row.name,
      price: row.price,
      salePrice: row.salePrice ?? '',
      stock: row.stock ?? 0,
      category: row.category || '',
    });
  };

  const saveRow = async () => {
    if (!editingRow) return;
    setSaving(true);
    const payload = {
      name: editForm.name,
      price: Number(editForm.price),
      salePrice: editForm.salePrice === '' ? null : Number(editForm.salePrice),
      stock: Number(editForm.stock) || 0,
      categorySlug: editForm.category || undefined,
    };
    const r = await fetch(`/api/admin/products/${editingRow}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setEditingRow(null);
    if (r.ok) load({ page });
  };

  const deleteRow = async () => {
    if (!deleteConfirm) return;
    const r = await fetch(`/api/admin/products/${deleteConfirm}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    if (r.ok) load({ page });
  };

  const categoryOptions = cats.map((c) => ({ value: c.slug, label: c.name }));

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-500 mt-1">Thêm, sửa, xóa sản phẩm trong kho hàng</p>
        </div>
        <Button icon={Plus} onClick={() => setShowAddModal(true)}>
          Thêm sản phẩm
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Tìm kiếm sản phẩm..."
            className="sm:w-80"
          />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Package className="h-4 w-4" />
            <span>{total} sản phẩm</span>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow hoverable={false}>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead align="right">Giá</TableHead>
            <TableHead align="right">Giá sale</TableHead>
            <TableHead align="right">Tồn kho</TableHead>
            <TableHead align="right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : items.length === 0 ? (
            <TableEmpty
              colSpan={6}
              icon={Package}
              message="Không có sản phẩm"
              description="Bắt đầu bằng cách thêm sản phẩm mới"
            />
          ) : (
            items.map((row) => {
              const isEditing = editingRow === row.id;

              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {row.image ? (
                        <Image
                          src={row.image}
                          alt={row.name}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        {isEditing ? (
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="px-2 py-1 rounded-lg border border-gray-300 text-sm font-medium w-full"
                          />
                        ) : (
                          <div className="font-medium text-gray-900">{row.name}</div>
                        )}
                        <div className="text-xs text-gray-500">{row.slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="px-2 py-1 rounded-lg border border-gray-300 text-sm"
                      >
                        <option value="">--</option>
                        {cats.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {row.category || '-'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="px-2 py-1 rounded-lg border border-gray-300 text-sm w-28 text-right"
                      />
                    ) : (
                      <span className="font-medium">{vnd(row.price)}</span>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.salePrice}
                        onChange={(e) => setEditForm({ ...editForm, salePrice: e.target.value })}
                        className="px-2 py-1 rounded-lg border border-gray-300 text-sm w-28 text-right"
                      />
                    ) : row.salePrice != null ? (
                      <span className="font-medium text-red-600">{vnd(row.salePrice)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.stock}
                        onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                        className="px-2 py-1 rounded-lg border border-gray-300 text-sm w-20 text-right"
                      />
                    ) : (
                      <span className={row.stock === 0 ? 'text-red-600 font-medium' : ''}>
                        {row.stock ?? 0}
                      </span>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {isEditing ? (
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" onClick={saveRow} loading={saving} icon={Save}>
                          Lưu
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditingRow(null)}>
                          Hủy
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => startEdit(row)}
                          className="text-gray-500 hover:text-blue-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => setDeleteConfirm(row.id)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {!loading && total > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={total}
          onPageChange={(p) => load({ page: p })}
          onPageSizeChange={(ps) => load({ page: 1, pageSize: ps })}
        />
      )}

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm sản phẩm mới"
        description="Điền thông tin sản phẩm để thêm vào kho hàng"
        size="lg"
      >
        <form onSubmit={createProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="ten-san-pham"
              required
            />
            <Input
              label="Tên sản phẩm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Tên sản phẩm"
              required
            />
            <Input
              label="Giá"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0"
              required
            />
            <Input
              label="Giá sale"
              type="number"
              step="0.01"
              value={form.salePrice}
              onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
              placeholder="Để trống nếu không có"
            />
            <Select
              label="Danh mục"
              value={form.categorySlug}
              onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
              options={categoryOptions}
              placeholder="Chọn danh mục"
              required
            />
            <Input
              label="URL hình ảnh"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <Input
            label="Mô tả"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Mô tả sản phẩm"
          />
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
              Hủy
            </Button>
            <Button type="submit" loading={saving} icon={Plus}>
              Thêm sản phẩm
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={deleteRow}
        title="Xóa sản phẩm"
        description="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
      />
    </div>
  );
}
