"use client";
import { Search, X } from 'lucide-react';
import { useRef } from 'react';

export default function SearchInput({
    value,
    onChange,
    placeholder = 'Tìm kiếm...',
    className = '',
}) {
    const inputRef = useRef(null);

    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="block w-full rounded-lg border border-gray-300 pl-10 pr-10 py-2.5 text-sm placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors"
            />
            {value && (
                <button
                    onClick={() => {
                        onChange('');
                        inputRef.current?.focus();
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
