// src/services/property.service.ts
import { api } from './api';
import type { PGItem } from '../components/shared';

interface BackendProperty {
    id: string;
    slug: string;
    name: string;
    locality: string;
    city: string;
    gender: 'Boys' | 'Girls' | 'Co-living';
    starting_rent: number;
    description?: string;
    facilities?: string[];
    image_url?: string;
}

export interface BackendRoom {
    id: string;
    room_number: string;
    floor: number;
    sharing_type: 'Single' | 'Double' | 'Triple' | 'Four';
    total_beds: number;
    monthly_rent: number;
    deposit_amount: number;
    beds: { id: string; bed_label: string; status: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' }[];
}

export interface SearchFilters {
    q?: string;
    city?: string;
    gender?: string;
    maxRent?: string;
}

const DEFAULT_PG_IMAGE =
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';

export const fetchPublicProperties = async (
    filters: SearchFilters
): Promise<PGItem[]> => {
    const params: Record<string, string> = {};
    if (filters.q) params.q = filters.q;
    if (filters.city) params.city = filters.city;
    if (filters.gender) params.gender = filters.gender;
    if (filters.maxRent) params.maxRent = filters.maxRent;

    const { data } = await api.get<{ properties: BackendProperty[] }>('/properties', {
        params,
    });

    return data.properties.map((p) => ({
        id: p.slug || p.id,
        name: p.name,
        locality: p.locality,
        city: p.city,
        startingRent: Number(p.starting_rent),
        vacantBeds: 1, // Live room-level count Details page par aayega
        rating: 4.7,
        gender: p.gender,
        facilities: p.facilities ?? [],
        imageUrl: p.image_url || DEFAULT_PG_IMAGE,
    }));
};

export const fetchPropertyDetails = async (idOrSlug: string) => {
    const { data } = await api.get<{ property: BackendProperty }>(
        `/properties/${idOrSlug}`
    );
    return data.property;
};

export const fetchPropertyRooms = async (propertyId: string): Promise<BackendRoom[]> => {
    const { data } = await api.get<{ rooms: BackendRoom[] }>(
        `/rooms/property/${propertyId}`
    );
    return data.rooms;
};

export const bookVisitLead = async (payload: {
    propertyId: string;
    name: string;
    phone: string;
    visitDate: string;
    preferredSharing?: string;
}) => {
    const { data } = await api.post('/leads', payload);
    return data;
};