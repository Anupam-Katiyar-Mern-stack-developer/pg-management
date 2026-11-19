// src/pages/public/HomePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BedDouble, Headphones, ShieldCheck, Zap } from 'lucide-react';
import { Badge, Button, Card } from '../../components/common';
import { PGCard, SearchBar, SEO, type PGItem } from '../../components/shared';

const POPULAR_CITIES: readonly string[] = [
    'Noida',
    'Bangalore',
    'Lucknow',
    'Delhi',
    'Kanpur',
];

const FEATURED_PGS: PGItem[] = [
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
];

const VALUE_PROPS = [
    {
        title: 'Admin-Verified Listings',
        desc: 'Every PG is approved before going live — no fake photos or ghost listings.',
        icon: ShieldCheck,
        tone: 'bg-indigo-100 text-indigo-600',
    },
    {
        title: 'Smart Move-in Billing',
        desc: 'Rent cycles follow your exact move-in date with automated monthly receipts.',
        icon: Zap,
        tone: 'bg-emerald-100 text-emerald-600',
    },
    {
        title: '1-Tap Issue Tracking',
        desc: 'Raise WiFi, AC, or maintenance tickets from your phone and track them live.',
        icon: Headphones,
        tone: 'bg-amber-100 text-amber-600',
    },
] as const;

export const HomePage: React.FC = () => {
    const navigate = useNavigate();

    const handleSearch = (query: string) => {
        navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
    };

    return (
        <div className="bg-slate-50">
            <SEO
                title="Find Verified PGs & Co-Living Spaces"
                description="Book verified PGs with live bed availability, transparent rent, and zero brokerage."
                keywords={['PG near me', 'Verified PG', 'Co-living India', 'Boys PG', 'Girls PG']}
            />

            {/* Hero Section */}
            <section className="bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 border-b border-slate-200/70">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-22 text-center">
                    <Badge variant="info" dot className="mb-5">
                        100% Verified PGs • Zero Brokerage
                    </Badge>

                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
                        Find your next PG stay,{' '}
                        <span className="text-indigo-600">without the brokerage hassle.</span>
                    </h1>

                    <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                        Live bed availability, transparent monthly rent, and instant visit booking.
                    </p>

                    <div className="mt-8 max-w-2xl mx-auto">
                        <SearchBar
                            buttonText="Search PGs"
                            placeholder="Search by city, locality, or PG name (e.g., Sector 62, Noida)"
                            onSearch={handleSearch}
                            className="p-2 shadow-lg shadow-slate-200/50"
                        />
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                        <span className="text-xs font-medium text-slate-500 mr-1">Popular:</span>
                        {POPULAR_CITIES.map((city) => (
                            <button
                                key={city}
                                type="button"
                                onClick={() => navigate(`/search?city=${encodeURIComponent(city)}`)}
                                className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trending PGs */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="flex items-end justify-between mb-7">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Trending PGs</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Top-rated stays with real-time vacant beds
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                        onClick={() => navigate('/search')}
                    >
                        View All
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURED_PGS.map((pg) => (
                        <PGCard
                            key={pg.id}
                            pg={pg}
                            onSelect={(id) => navigate(`/pg/${id}`)}
                        />
                    ))}
                </div>
            </section>

            {/* Value Props */}
            <section className="bg-white border-y border-slate-200/70 py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {VALUE_PROPS.map(({ title, desc, icon: Icon, tone }) => (
                        <Card key={title} padding="lg" className="bg-slate-50/70 border-slate-200/60">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${tone}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-900">{title}</h3>
                            <p className="mt-1.5 text-sm text-slate-600">{desc}</p>
                        </Card>
                    ))}
                </div>
            </section>

            {/* PG Owner CTA */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="rounded-2xl bg-indigo-600 px-6 py-10 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
                    <div className="max-w-xl text-center md:text-left">
                        <div className="inline-flex items-center gap-2 text-xs font-medium bg-white/15 px-3 py-1 rounded-full mb-3">
                            <BedDouble className="w-3.5 h-3.5" />
                            For PG &amp; Hostel Owners
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold">
                            Manage beds, automated rent &amp; tenants in one place.
                        </h2>
                        <p className="mt-2 text-sm text-indigo-100">
                            List your PG on StayFlow, get direct leads, and automate monthly billing cycles.
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        size="lg"
                        className="bg-white text-indigo-700 hover:bg-indigo-50 shrink-0"
                        onClick={() => navigate('/register')}
                    >
                        List Your PG Free
                    </Button>
                </div>
            </section>
        </div>
    );
};