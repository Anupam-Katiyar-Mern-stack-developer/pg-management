// src/pages/public/PGDetailsPage.tsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Star,
    CheckCircle2,
    BedDouble,
    Calendar,
    ShieldCheck,
} from 'lucide-react';
import { Badge, Button, Card, Input, Modal } from '../../components/common';
import { SEO } from '../../components/shared';

interface RoomOption {
    id: string;
    sharing: 'Single' | 'Double' | 'Triple';
    rent: number;
    deposit: number;
    vacantBeds: number;
}

interface PGDetail {
    id: string;
    name: string;
    locality: string;
    city: string;
    gender: 'Boys' | 'Girls' | 'Co-living';
    rating: number;
    description: string;
    imageUrl: string;
    facilities: string[];
    rules: string[];
    rooms: RoomOption[];
}

// Temporary mock data (baad mein API se `/api/pgs/:id` aayega)
const MOCK_PG_DETAIL: PGDetail = {
    id: 'pg-1',
    name: 'Elevate Co-Living & PG',
    locality: 'Sector 62',
    city: 'Noida',
    gender: 'Co-living',
    rating: 4.8,
    description:
        'Modern fully-furnished PG within walking distance of IT parks and metro station. Includes high-speed WiFi, hygienic 3-time meals, and 24x7 power backup.',
    imageUrl:
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
    facilities: ['AC Rooms', 'High-Speed WiFi', '3-Time Meals', 'Power Backup', 'Laundry', 'CCTV Security'],
    rules: ['No smoking inside rooms', '1-month notice period', 'Visitors allowed till 9 PM'],
    rooms: [
        { id: 'r1', sharing: 'Single', rent: 13500, deposit: 13500, vacantBeds: 1 },
        { id: 'r2', sharing: 'Double', rent: 9500, deposit: 9500, vacantBeds: 2 },
        { id: 'r3', sharing: 'Triple', rent: 8500, deposit: 8500, vacantBeds: 0 },
    ],
};

interface VisitFormState {
    name: string;
    phone: string;
    visitDate: string;
}

export const PGDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Abhi mock use kar rahe hain; baad mein `id` se fetch hoga
    const pg = { ...MOCK_PG_DETAIL, id: id ?? MOCK_PG_DETAIL.id };

    const [selectedRoom, setSelectedRoom] = useState<RoomOption | null>(
        pg.rooms.find((r) => r.vacantBeds > 0) ?? null
    );
    const [visitModalOpen, setVisitModalOpen] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [form, setForm] = useState<VisitFormState>({
        name: '',
        phone: '',
        visitDate: '',
    });

    const startingRent = Math.min(...pg.rooms.map((r) => r.rent));

    const handleBookVisit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Baad mein POST /api/leads call hoga
        console.log('Visit booked:', { pgId: pg.id, room: selectedRoom?.sharing, ...form });
        setSubmitted(true);
    };

    const handleCloseModal = () => {
        setVisitModalOpen(false);
        setSubmitted(false);
        setForm({ name: '', phone: '', visitDate: '' });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <SEO
                title={`${pg.name} in ${pg.locality}, ${pg.city}`}
                description={`${pg.gender} PG in ${pg.locality}, ${pg.city} starting at ₹${startingRent}/month. Verified listing with live bed availability.`}
                keywords={[`PG in ${pg.city}`, `${pg.locality} PG`, `${pg.gender} PG`]}
                ogImage={pg.imageUrl}
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'LodgingBusiness',
                    name: pg.name,
                    address: `${pg.locality}, ${pg.city}`,
                    priceRange: `₹${startingRent}`,
                }}
            />

            {/* Back Button */}
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 mb-5"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to listings
            </button>

            {/* Main 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Content (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Hero Image */}
                    <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80">
                        <img src={pg.imageUrl} alt={pg.name} className="w-full h-full object-cover" />
                        <div className="absolute top-4 left-4 flex gap-2">
                            <Badge variant="neutral" className="bg-white/95">
                                {pg.gender}
                            </Badge>
                            <Badge variant="info" className="bg-white/95">
                                Verified PG
                            </Badge>
                        </div>
                    </div>

                    {/* Title & Location */}
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{pg.name}</h1>
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                {pg.rating}
                            </span>
                        </div>
                        <p className="mt-1.5 text-sm text-slate-500 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {pg.locality}, {pg.city}
                        </p>
                        <p className="mt-4 text-sm text-slate-600 leading-relaxed">{pg.description}</p>
                    </div>

                    {/* Room Sharing Options */}
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-3">Available Room Options</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {pg.rooms.map((room) => {
                                const isSelected = selectedRoom?.id === room.id;
                                const isFull = room.vacantBeds === 0;

                                return (
                                    <Card
                                        key={room.id}
                                        padding="md"
                                        onClick={() => !isFull && setSelectedRoom(room)}
                                        className={`transition-all ${isFull
                                            ? 'opacity-60 cursor-not-allowed bg-slate-50'
                                            : isSelected
                                                ? 'border-indigo-500 ring-2 ring-indigo-100 cursor-pointer'
                                                : 'hover:border-slate-300 cursor-pointer'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                                                <BedDouble className="w-4 h-4 text-indigo-600" />
                                                {room.sharing}
                                            </span>
                                            <Badge variant={isFull ? 'danger' : 'success'} size="sm" dot>
                                                {isFull ? 'Full' : `${room.vacantBeds} left`}
                                            </Badge>
                                        </div>
                                        <p className="text-xl font-bold text-slate-900">
                                            ₹{room.rent.toLocaleString('en-IN')}
                                            <span className="text-xs font-normal text-slate-500">/mo</span>
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Deposit: ₹{room.deposit.toLocaleString('en-IN')}
                                        </p>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Facilities */}
                    <Card padding="md">
                        <h2 className="text-base font-bold text-slate-900 mb-3">Facilities Included</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {pg.facilities.map((item) => (
                                <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* House Rules */}
                    <Card padding="md">
                        <h2 className="text-base font-bold text-slate-900 mb-3">House Rules</h2>
                        <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                            {pg.rules.map((rule) => (
                                <li key={rule}>{rule}</li>
                            ))}
                        </ul>
                    </Card>
                </div>

                {/* Right Sticky Booking Card (1 col) */}
                <Card padding="lg" className="lg:sticky lg:top-22 space-y-4">
                    <div className="pb-4 border-b border-slate-100">
                        <span className="text-xs text-slate-500">
                            {selectedRoom ? `${selectedRoom.sharing} Sharing Rent` : 'Starts from'}
                        </span>
                        <p className="text-2xl font-bold text-slate-900 mt-0.5">
                            ₹{(selectedRoom?.rent ?? startingRent).toLocaleString('en-IN')}
                            <span className="text-sm font-normal text-slate-500">/month</span>
                        </p>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>Zero brokerage • Direct owner contact</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>Rent cycle starts from your move-in date</span>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        onClick={() => setVisitModalOpen(true)}
                    >
                        Schedule a Free Visit
                    </Button>
                </Card>
            </div>

            {/* Book a Visit Modal */}
            <Modal
                isOpen={visitModalOpen}
                onClose={handleCloseModal}
                title={submitted ? 'Visit Request Sent!' : `Book a Visit — ${pg.name}`}
            >
                {submitted ? (
                    <div className="text-center py-4 space-y-3">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                        <p className="text-sm text-slate-700">
                            Thanks <span className="font-semibold">{form.name}</span>! The PG owner will call you
                            on <span className="font-semibold">{form.phone}</span> to confirm your visit.
                        </p>
                        <Button variant="primary" size="sm" onClick={handleCloseModal}>
                            Done
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleBookVisit} className="space-y-4">
                        <Input
                            label="Full Name"
                            required
                            placeholder="e.g., Rahul Sharma"
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        />
                        <Input
                            label="Phone Number"
                            type="tel"
                            required
                            placeholder="e.g., 9876543210"
                            value={form.phone}
                            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                        />
                        <Input
                            label="Preferred Visit Date"
                            type="date"
                            required
                            value={form.visitDate}
                            onChange={(e) => setForm((prev) => ({ ...prev, visitDate: e.target.value }))}
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={handleCloseModal}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                Confirm Visit
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};