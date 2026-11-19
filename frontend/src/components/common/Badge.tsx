// src/components/common/Badge.tsx
import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'neutral',
    size = 'md',
    dot = false,
    className = '',
}) => {
    const variants: Record<BadgeVariant, string> = {
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200', // Paid, Vacant, Approved
        warning: 'bg-amber-50 text-amber-700 border-amber-200',       // Pending, In Progress
        danger: 'bg-rose-50 text-rose-700 border-rose-200',           // Overdue, Occupied, Rejected
        info: 'bg-indigo-50 text-indigo-700 border-indigo-200',       // Role tags, New Lead
        neutral: 'bg-slate-100 text-slate-700 border-slate-200',      // Facilities (AC, WiFi)
    };

    const dotColors: Record<BadgeVariant, string> = {
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-rose-500',
        info: 'bg-indigo-500',
        neutral: 'bg-slate-500',
    };

    const sizes: Record<BadgeSize, string> = {
        sm: 'px-2 py-0.5 text-[11px] gap-1',
        md: 'px-2.5 py-1 text-xs gap-1.5',
    };

    return (
        <span
            className={`inline-flex items-center font-medium rounded-full border leading-none ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
            )}
            {children}
        </span>
    );
};