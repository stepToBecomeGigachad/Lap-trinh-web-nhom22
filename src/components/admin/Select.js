"use client";
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select({
    label,
    error,
    hint,
    options = [],
    placeholder = 'Chọn...',
    className = '',
    wrapperClassName = '',
    ...props
}, ref) {
    return (
        <div className={wrapperClassName}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    ref={ref}
                    className={`
            block w-full rounded-lg border appearance-none
            pl-4 pr-10 py-2.5 transition-colors duration-200
            ${error
                            ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 text-gray-900 focus:ring-brand-500 focus:border-brand-500'
                        }
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${className}
          `}
                    {...props}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
            </div>
            {error && (
                <p className="mt-1.5 text-sm text-red-600">{error}</p>
            )}
            {hint && !error && (
                <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
            )}
        </div>
    );
});

export default Select;
