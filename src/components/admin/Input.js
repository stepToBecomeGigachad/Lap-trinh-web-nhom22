"use client";
import { forwardRef } from 'react';

const Input = forwardRef(function Input({
    label,
    error,
    hint,
    icon: Icon,
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
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                )}
                <input
                    ref={ref}
                    className={`
            block w-full rounded-lg border transition-colors duration-200
            ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5
            ${error
                            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-brand-500 focus:border-brand-500'
                        }
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${className}
          `}
                    {...props}
                />
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

export default Input;
