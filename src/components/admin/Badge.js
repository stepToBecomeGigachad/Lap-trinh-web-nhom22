"use client";

const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-brand-50 text-brand-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
};

const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
};

export default function Badge({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    className = ''
}) {
    return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${variant === 'success' ? 'bg-green-500' : variant === 'warning' ? 'bg-amber-500' : variant === 'danger' ? 'bg-red-500' : 'bg-current'}`} />
            )}
            {children}
        </span>
    );
}

// Status badge specific for orders
export function StatusBadge({ status }) {
    const map = {
        DELIVERED: { variant: 'success', label: 'Giao thành công' },
        SHIPPED: { variant: 'warning', label: 'Đang giao' },
        PENDING: { variant: 'danger', label: 'Chưa giao' },
        CANCELLED: { variant: 'default', label: 'Đã hủy' },
    };
    const s = map[status] || { variant: 'default', label: status };
    return <Badge variant={s.variant} dot>{s.label}</Badge>;
}
