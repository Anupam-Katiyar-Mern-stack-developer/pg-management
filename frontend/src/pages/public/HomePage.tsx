// src/pages/public/HomePage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  MapPin,
  ShieldCheck,
  BedDouble,
  Headphones,
} from 'lucide-react';
import { Badge, Button, Card } from '../../components/common';
import { PGCard, SearchBar, SEO } from '../../components/shared';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchHomeDataThunk } from '../../store/slices/home.slice';

const WHY_STAYFLOW = [
  {
    icon: BedDouble,
    title: 'Only Vacant Rooms Shown',
    desc: 'Live bed-level availability — no wasted visits for already booked rooms.',
  },
  {
    icon: ShieldCheck,
    title: 'Zero Brokerage, Verified PGs',
    desc: 'Connect directly with the PG Admin with transparent rent and deposit.',
  },
  {
    icon: Headphones,
    title: 'In-App Facility Support',
    desc: 'Raise WiFi, AC, or maintenance issues directly to your PG Admin anytime.',
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { featuredPgs, popularCities, stats, loading } = useAppSelector(
    (state) => state.home
  );

  useEffect(() => {
    if (featuredPgs.length === 0) {
      dispatch(fetchHomeDataThunk());
    }
  }, [dispatch, featuredPgs.length]);

  const handleSearch = (query: string) => {
    const trimmed = query.trim();
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search');
  };

  return (
    <div className="space-y-16 pb-16">
      <SEO
        title="Find Verified PGs & Hostels"
        description="Search verified Boys, Girls, and Co-living PGs with live vacant bed availability and zero brokerage."
        keywords={['PG near me', 'Verified PG', 'Boys PG', 'Girls PG', 'Co-living']}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-50/70 via-white to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <Badge variant="info" className="mb-4">
            100% Verified PGs • Zero Brokerage
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
            Find your next PG with{' '}
            <span className="text-indigo-600">live vacant beds</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Browse verified Boys, Girls, and Co-living PGs. See only available rooms and
            reach out directly to the PG Admin.
          </p>

          <div className="mt-8 max-w-2xl mx-auto">
            <SearchBar
              placeholder="Search by city, locality, or PG name (e.g., Sector 62, Noida)..."
              onSearch={handleSearch}
            />
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { label: 'Verified PGs', value: stats.verifiedPgs },
                { label: 'Vacant Beds', value: stats.vacantBeds },
                { label: 'Active Cities', value: stats.activeCities },
                { label: 'Brokerage Fee', value: stats.zeroBrokerage },
              ].map((stat) => (
                <Card key={stat.label} padding="sm" className="text-center">
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Cities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Explore by City</h2>
            <p className="text-sm text-slate-500 mt-1">
              Pick a city to see verified PGs with available rooms
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/search')}>
            View All
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-44 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {popularCities.map((city) => (
              <Card
                key={city.name}
                padding="none"
                onClick={() => navigate(`/search?city=${encodeURIComponent(city.name)}`)}
                className="group overflow-hidden cursor-pointer hover:border-indigo-300 transition-all"
              >
                <div className="relative h-36 overflow-hidden bg-slate-100">
                  <img
                    src={city.imageUrl}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="font-bold text-base flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {city.name}
                    </p>
                    <p className="text-xs text-slate-200">
                      {city.pgCount} PGs • From ₹{city.startingRent.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Featured PGs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured PGs</h2>
            <p className="text-sm text-slate-500 mt-1">
              Top-rated stays with immediate bed availability
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Explore all
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <Card key={n} padding="md" className="h-80 animate-pulse bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPgs.map((pg) => (
              <PGCard
                key={pg.id}
                pg={pg}
                onSelect={(id) => navigate(`/pg/${id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Why StayFlow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {WHY_STAYFLOW.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} padding="lg" className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* PG Owner CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card
          padding="lg"
          className="bg-slate-900 text-white border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
              <Building2 className="w-4 h-4" />
              Own a PG or Hostel?
            </span>
            <h2 className="text-xl sm:text-2xl font-bold">
              List your PG and manage rooms, rent & tenants in one place
            </h2>
            <p className="text-sm text-slate-300">
              Submit your onboarding request — Super Admin verifies and activates your Admin
              dashboard.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="shrink-0"
            onClick={() => navigate('/list-your-pg')}
          >
            List Your PG
          </Button>
        </Card>
      </section>
    </div>
  );
};