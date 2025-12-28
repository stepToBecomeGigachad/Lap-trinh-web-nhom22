"use client";

export function Table({ children, className = '' }) {
    return (
        <div className={`overflow-x-auto rounded-xl border border-gray-200 bg-white ${className}`}>
            <table className="min-w-full divide-y divide-gray-200">
                {children}
            </table>
        </div>
    );
}

export function TableHeader({ children, className = '' }) {
    return (
        <thead className={`bg-gray-50 ${className}`}>
            {children}
        </thead>
    );
}

export function TableBody({ children, className = '' }) {
    return (
        <tbody className={`divide-y divide-gray-200 bg-white ${className}`}>
            {children}
        </tbody>
    );
}

export function TableRow({ children, className = '', onClick, hoverable = true }) {
    return (
        <tr
            className={`${hoverable ? 'hover:bg-gray-50 transition-colors' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </tr>
    );
}

export function TableHead({ children, className = '', align = 'left' }) {
    const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
    return (
        <th className={`px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider ${alignClass} ${className}`}>
            {children}
        </th>
    );
}

export function TableCell({ children, className = '', align = 'left' }) {
    const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
    return (
        <td className={`px-4 py-4 text-sm text-gray-700 ${alignClass} ${className}`}>
            {children}
        </td>
    );
}

export function TableEmpty({ colSpan = 1, icon: Icon, message = 'Không có dữ liệu', description }) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-4 py-12 text-center">
                {Icon && (
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-gray-100 rounded-full">
                            <Icon className="h-8 w-8 text-gray-400" />
                        </div>
                    </div>
                )}
                <p className="text-gray-900 font-medium">{message}</p>
                {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
            </td>
        </tr>
    );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
    return (
        <>
            {[...Array(rows)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                    {[...Array(cols)].map((_, j) => (
                        <td key={j} className="px-4 py-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}
