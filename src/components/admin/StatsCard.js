"use client";
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    className = '',
    iconBg = 'bg-brand-50',
    iconColor = 'text-brand-600'
}) {
    return (
        <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-theme-xs hover:shadow-md transition-shadow ${className}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            {trend === 'up' ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {trendValue}
                            </span>
                            <span className="text-sm text-gray-500">so với kỳ trước</span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={`${iconBg} ${iconColor} p-3 rounded-xl`}>
                        <Icon className="h-6 w-6" />
                    </div>
                )}
            </div>
        </div>
    );
}
