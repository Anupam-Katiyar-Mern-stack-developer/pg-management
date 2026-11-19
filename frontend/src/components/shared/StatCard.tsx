// src/components/shared/StatCard.tsx
import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { Card } from '../common';

type StatTone = 'indigo' | 'emerald' | 'amber' | 'rose';

interface StatCardProps {
    label: string;
    value: string | number;
    subtext?: string;
    icon: LucideIcon;
    tone?: StatTone;
}

const TONE_STYLES: Record<StatTone, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
};

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    subtext,
    icon: Icon,
    tone = 'indigo',
}) => {
    return (
        <Card padding="md" className="flex items-start justify-between gap-4">
            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {label}
                </p>
                <p className="mt-1.5 text-2xl font-bold text-slate-900 truncate">
                    {value}
                </p>
                {subtext && (
                    <p className="mt-1 text-xs text-slate-500">{subtext}</p>
                )}
            </div>

            <div className={`p-2.5 rounded-xl shrink-0 ${TONE_STYLES[tone]}`}>
                <Icon className="w-5 h-5" />
            </div>
        </Card>
    );
};