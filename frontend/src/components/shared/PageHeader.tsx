// src/components/shared/PageHeader.tsx
import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    action,
}) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
};