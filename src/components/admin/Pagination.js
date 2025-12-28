"use client";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100],
    showPageSize = true,
    totalItems,
}) {
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const showPages = 5;
        let start = Math.max(1, currentPage - Math.floor(showPages / 2));
        let end = Math.min(totalPages, start + showPages - 1);

        if (end - start < showPages - 1) {
            start = Math.max(1, end - showPages + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
            {/* Left side - Items info */}
            <div className="text-sm text-gray-600">
                {totalItems > 0 ? (
                    <>
                        Hiển thị <span className="font-medium">{startItem}</span> - <span className="font-medium">{endItem}</span> trong <span className="font-medium">{totalItems}</span> kết quả
                    </>
                ) : (
                    'Không có kết quả'
                )}
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center gap-4">
                {/* Page size selector */}
                {showPageSize && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Hiển thị</span>
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                            className="rounded-lg border border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-brand-500 focus:ring-brand-500"
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Pagination buttons */}
                <nav className="flex items-center gap-1">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="px-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {getPageNumbers().map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${page === currentPage
                                    ? 'bg-brand-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="px-2"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </nav>
            </div>
        </div>
    );
}
