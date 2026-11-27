// src/services/home.service.ts
import type { PGItem } from '../components/shared';
// Real API connect karne par uncomment kar lena:
// import { api } from './api';

export interface PopularCity {
    name: string;
    pgCount: number;
    startingRent: number;
    imageUrl: string;
}

export interface HomeStats {
    verifiedPgs: string;
    vacantBeds: string;
    activeCities: string;
    zeroBrokerage: string;
}

export interface HomeDataResponse {
    featuredPgs: PGItem[];
    popularCities: PopularCity[];
    stats: HomeStats;
}

const MOCK_HOME_DATA: HomeDataResponse = {
    stats: {
        verifiedPgs: '120+',
        vacantBeds: '850+',
        activeCities: '8 Cities',
        zeroBrokerage: '₹0',
    },
    popularCities: [
        {
            name: 'Noida',
            pgCount: 42,
            startingRent: 6500,
            imageUrl:
                'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80',
        },
        {
            name: 'Lucknow',
            pgCount: 28,
            startingRent: 5500,
            imageUrl:
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
        },
        {
            name: 'Bangalore',
            pgCount: 54,
            startingRent: 8000,
            imageUrl:
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
        },
        {
            name: 'Kanpur',
            pgCount: 19,
            startingRent: 4800,
            imageUrl:
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
        },
    ],
    featuredPgs: [
        {
            id: 'elevate-co-living-noida',
            name: 'Elevate Co-Living & PG',
            locality: 'Sector 62',
            city: 'Noida',
            startingRent: 8500,
            vacantBeds: 3,
            rating: 4.8,
            gender: 'Co-living',
            facilities: ['AC', 'WiFi', 'Meals', 'Power Backup'],
            imageUrl:
                'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
        },
        {
            id: 'urban-nest-boys-lucknow',
            name: 'Urban Nest Boys PG',
            locality: 'Gomti Nagar',
            city: 'Lucknow',
            startingRent: 6500,
            vacantBeds: 2,
            rating: 4.6,
            gender: 'Boys',
            facilities: ['WiFi', 'Meals', 'Laundry'],
            imageUrl:
                'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        },
        {
            id: 'serene-stays-girls-bangalore',
            name: 'Serene Stays Girls Residency',
            locality: 'HSR Layout',
            city: 'Bangalore',
            startingRent: 10500,
            vacantBeds: 1,
            rating: 4.9,
            gender: 'Girls',
            facilities: ['AC', 'WiFi', 'Gym', 'CCTV'],
            imageUrl:
                'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
        },
    ],
};

export const fetchHomeDataApi = async (): Promise<HomeDataResponse> => {
    // Real backend ready hone par ye use karna:
    // const { data } = await api.get<HomeDataResponse>('/public/home');
    // return data;

    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_HOME_DATA), 250);
    });
};