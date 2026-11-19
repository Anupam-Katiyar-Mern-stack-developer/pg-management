// src/pages/public/SearchPage.tsx
import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button, Card, Select, type SelectOption } from '../../components/common';
import { PGCard, SearchBar, SEO, type PGItem } from '../../components/shared';

const ALL_PGS: PGItem[] = [
    {
        id: 'pg-1',
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
        id: 'pg-2',
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
        id: 'pg-3',
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
    {
        id: 'pg-4',
        name: 'Scholar Hub Boys Hostel',
        locality: 'Kakadeo',
        city: 'Kanpur',
        startingRent: 5500,
        vacantBeds: 4,
        rating: 4.5,
        gender: 'Boys',
        facilities: ['WiFi', 'Meals', 'RO Water'],
        imageUrl:
            'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    },
];

const CITY_OPTIONS: SelectOption[] = [
    { label: 'All Cities', value: '' },
    { label: 'Noida', value: 'Noida' },
    { label: 'Lucknow', value: 'Lucknow' },
    { label: 'Bangalore', value: 'Bangalore' },
    { label: 'Kanpur', value: 'Kanpur' },
];

const GENDER_OPTIONS: SelectOption[] = [
    { label: 'Any Gender', value: '' },
    { label: 'Boys', value: 'Boys' },
    { label: 'Girls', value: 'Girls' },
    { label: 'Co-living', value: 'Co-living' },
];

const BUDGET_OPTIONS: SelectOption[] = [
    { label: 'Any Budget', value: '' },
    { label: 'Under ₹7,000', value: '7000' },
    { label: 'Under ₹9,000', value: '9000' },
    { label: 'Under ₹12,000', value: '12000' },
];

export const SearchPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [query, setQuery] = useState<string>(searchParams.get('q') ?? '');
    const [city, setCity] = useState<string>(searchParams.get('city') ?? '');
    const [gender, setGender] = useState<string>('');
    const [maxBudget, setMaxBudget] = useState<string>('');

    const filteredPGs = useMemo(() => {
        return ALL_PGS.filter((pg) => {
            const q = query.toLowerCase();
            const matchesQuery =
                !q ||
                pg.name.toLowerCase().includes(q) ||
                pg.locality.toLowerCase().includes(q) ||
                pg.city.toLowerCase().includes(q);

            const matchesCity = !city || pg.city.toLowerCase() === city.toLowerCase();
            const matchesGender = !gender || pg.gender === gender;
            const matchesBudget = !maxBudget || pg.startingRent <= Number(maxBudget);

            return matchesQuery && matchesCity && matchesGender && matchesBudget;
        });
    }, [query, city, gender, maxBudget]);

    const handleSearch = (newQuery: string) => {
        setQuery(newQuery);
        const nextParams = new URLSearchParams(searchParams);
        if (newQuery) nextParams.set('q', newQuery);
        else nextParams.delete('q');
        setSearchParams(nextParams);
    };

    const handleReset = () => {
        setQuery('');
        setCity('');
        setGender('');
        setMaxBudget('');
        setSearchParams({});
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SEO
                title={city ? `Verified PGs in ${city}` : 'Explore Verified PGs'}
                description="Filter verified PGs by city, gender, and monthly budget with live bed availability."
                keywords={['PG search', 'Boys PG', 'Girls PG', city || 'India PG']}
            />

            {/* Top Search Bar */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {city ? `PGs in ${city}` : 'Explore Verified PGs'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {filteredPGs.length} {filteredPGs.length === 1 ? 'property' : 'properties'} available
                    </p>
                </div>

                <SearchBar
                    initialValue={query}
                    placeholder="Search locality or PG name..."
                    onSearch={handleSearch}
                    className="w-full sm:w-96"
                />
            </div>

            {/* Main Grid: Filters + Results */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                {/* Left Filters Sidebar */}
                <Card padding="md" className="lg:sticky lg:top-22 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                            Filters
                        </span>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset
                        </button>
                    </div>

                    <Select
                        label="City"
                        options={CITY_OPTIONS}
                        value={city}
                        placeholder=""
                        onChange={(e) => setCity(e.target.value)}
                    />

                    <Select
                        label="Gender"
                        options={GENDER_OPTIONS}
                        value={gender}
                        placeholder=""
                        onChange={(e) => setGender(e.target.value)}
                    />

                    <Select
                        label="Max Monthly Rent"
                        options={BUDGET_OPTIONS}
                        value={maxBudget}
                        placeholder=""
                        onChange={(e) => setMaxBudget(e.target.value)}
                    />
                </Card>

                {/* Right PG Results Grid */}
                <div className="lg:col-span-3">
                    {filteredPGs.length === 0 ? (
                        <Card padding="lg" className="text-center py-14">
                            <p className="text-base font-semibold text-slate-800">No matching PGs found</p>
                            <p className="text-sm text-slate-500 mt-1">
                                Try clearing filters or searching a different locality.
                            </p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={handleReset}>
                                Clear All Filters
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            {filteredPGs.map((pg) => (
                                <PGCard
                                    key={pg.id}
                                    pg={pg}
                                    onSelect={(id) => navigate(`/pg/${id}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};