"use client";
import { useEffect, useState } from 'react';
import {
  MessageSquare,
  Star,
  Trash2,
  User,
  Package,
  Calendar,
  Filter,
} from 'lucide-react';
import { Card, CardTitle } from '../../../components/admin/Card';
import Button from '../../../components/admin/Button';
import Select from '../../../components/admin/Select';
import SearchInput from '../../../components/admin/SearchInput';
import { ConfirmModal } from '../../../components/admin/Modal';
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

const ratingOptions = [
  { value: '', label: 'Tất cả đánh giá' },
  { value: '5', label: '5 sao' },
  { value: '4', label: '4 sao' },
  { value: '3', label: '3 sao' },
  { value: '2', label: '2 sao' },
  { value: '1', label: '1 sao' },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
}

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState({ rating: '', productId: '' });
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Stats
  const stats = {
    total: reviews.length,
    star5: reviews.filter((r) => r.rating === 5).length,
    star4: reviews.filter((r) => r.rating === 4).length,
    star3: reviews.filter((r) => r.rating === 3).length,
    star2: reviews.filter((r) => r.rating === 2).length,
    star1: reviews.filter((r) => r.rating === 1).length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0,
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const deleteReview = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/reviews/${deleteConfirm}`, { method: 'DELETE' });
      if (res.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error('Error deleting review:', err);
    }
    setDeleting(false);
    setDeleteConfirm(null);
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter.rating && r.rating !== Number(filter.rating)) return false;
    if (filter.productId && !r.productId?.toLowerCase().includes(filter.productId.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá</h1>
          <p className="text-gray-500 mt-1">Xem và kiểm duyệt đánh giá sản phẩm</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <Card className="md:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-50 rounded-xl">
              <MessageSquare className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Tổng đánh giá</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <StarRating rating={Math.round(Number(stats.avgRating))} />
            <span className="text-lg font-semibold text-gray-900">{stats.avgRating}</span>
            <span className="text-sm text-gray-500">trung bình</span>
          </div>
        </Card>

        {[5, 4, 3, 2, 1].map((star) => (
          <Card
            key={star}
            className={`cursor-pointer transition-all hover:border-amber-300 ${filter.rating === String(star) ? 'border-amber-400 bg-amber-50' : ''}`}
            onClick={() => setFilter({ ...filter, rating: filter.rating === String(star) ? '' : String(star) })}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="text-lg font-bold text-gray-900">{star}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats[`star${star}`]}</p>
              <p className="text-xs text-gray-500">đánh giá</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-3 flex-1">
            <Filter className="h-5 w-5 text-gray-400" />
            <Select
              value={filter.rating}
              onChange={(e) => setFilter({ ...filter, rating: e.target.value })}
              options={ratingOptions}
              placeholder=""
              className="w-48"
            />
            <SearchInput
              value={filter.productId}
              onChange={(val) => setFilter({ ...filter, productId: val })}
              placeholder="Tìm theo sản phẩm..."
              className="w-64"
            />
          </div>
          <p className="text-sm text-gray-500">
            Hiển thị {filteredReviews.length} / {reviews.length} đánh giá
          </p>
        </div>
      </Card>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow hoverable={false}>
            <TableHead>Người dùng</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Đánh giá</TableHead>
            <TableHead>Nhận xét</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead align="right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : filteredReviews.length === 0 ? (
            <TableEmpty
              colSpan={6}
              icon={MessageSquare}
              message="Không có đánh giá"
              description={filter.rating || filter.productId ? 'Thử thay đổi bộ lọc' : 'Chưa có đánh giá nào'}
            />
          ) : (
            filteredReviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white font-semibold text-sm">
                      {review.user?.name?.charAt(0)?.toUpperCase() || review.user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{review.user?.name || 'Ẩn danh'}</p>
                      <p className="text-xs text-gray-500">{review.user?.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900 line-clamp-1">{review.product?.name || '-'}</p>
                    <p className="text-xs text-gray-500">{review.productId?.slice(-8)}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <StarRating rating={review.rating} />
                </TableCell>
                <TableCell>
                  <p className="text-gray-700 line-clamp-2 max-w-xs">
                    {review.comment || <span className="text-gray-400 italic">Không có nhận xét</span>}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar className="h-4 w-4" />
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setDeleteConfirm(review.id)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={deleteReview}
        title="Xóa đánh giá"
        description="Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
