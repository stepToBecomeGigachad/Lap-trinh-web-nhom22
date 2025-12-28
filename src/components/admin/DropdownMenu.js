"use client";
import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';

export function DropdownMenu({ children, trigger }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)}>
                {trigger || (
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="h-5 w-5" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                    {children}
                </div>
            )}
        </div>
    );
}

export function DropdownMenuItem({
    children,
    onClick,
    icon: Icon,
    variant = 'default',
    disabled = false
}) {
    const variants = {
        default: 'text-gray-700 hover:bg-gray-50',
        danger: 'text-red-600 hover:bg-red-50',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
        >
            {Icon && <Icon className="h-4 w-4" />}
            {children}
        </button>
    );
}

export function DropdownMenuDivider() {
    return <div className="my-1 border-t border-gray-100" />;
}
