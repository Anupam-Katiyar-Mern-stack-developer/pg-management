// src/components/shared/PGCard.tsx
import React from 'react';
import { MapPin, Star } from 'lucide-react';
import { Badge, Button, Card } from '../common';

export interface PGItem {
    id: string;
    name: string;
    locality: string;
    city: string;
    startingRent: number;
    vacantBeds: number;
    rating?: number;
    gender: 'Boys' | 'Girls' | 'Co-living';
    facilities: string[];
    imageUrl: string;
}

interface PGCardProps {
    pg: PGItem;
    onSelect?: (id: string) => void;
    actionSlot?: React.ReactNode;
}

export const PGCard: React.FC<PGCardProps> = ({ pg, onSelect, actionSlot }) => {
    return (
        <Card
            padding="none"
            hoverable={Boolean(onSelect)}
            onClick={() => onSelect?.(pg.id)}
            className="flex flex-col h-full"
        >
            {/* Image + Badges */}
            <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                    src={pg.imageUrl}
                    alt={pg.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                    <Badge variant="neutral" size="sm" className="bg-white/95">
                        {pg.gender}
                    </Badge>
                </div>
                <div className="absolute top-3 right-3">
                    <Badge
                        variant={pg.vacantBeds > 0 ? 'success' : 'danger'}
                        size="sm"
                        dot
                        className="bg-white/95"
                    >
                        {pg.vacantBeds > 0
                            ? `${pg.vacantBeds} ${pg.vacantBeds === 1 ? 'Bed' : 'Beds'} Left`
                            : 'Full'}
                    </Badge>
                </div>
            </div>

            {/* Details */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 text-base line-clamp-1">
                        {pg.name}
                    </h3>
                    {pg.rating !== undefined && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {pg.rating}
                        </span>
                    )}
                </div>

                <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                        {pg.locality}, {pg.city}
                    </span>
                </p>

                {/* Facilities */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {pg.facilities.slice(0, 3).map((facility) => (
                        <Badge key={facility} variant="neutral" size="sm">
                            {facility}
                        </Badge>
                    ))}
                    {pg.facilities.length > 3 && (
                        <span className="text-[11px] text-slate-400 self-center pl-1">
                            +{pg.facilities.length - 3} more
                        </span>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                        <span className="text-[11px] text-slate-400 block">Starts from</span>
                        <span className="text-base font-bold text-slate-900">
                            ₹{pg.startingRent.toLocaleString('en-IN')}
                            <span className="text-xs font-normal text-slate-500">/mo</span>
                        </span>
                    </div>

                    {actionSlot ?? (
                        <Button variant="outline" size="sm">
                            View Details
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};