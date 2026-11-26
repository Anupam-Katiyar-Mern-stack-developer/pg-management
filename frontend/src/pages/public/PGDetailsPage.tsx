// src/pages/public/PGDetailsPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
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
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  bookVisitThunk,
  clearPropertyDetails,
  fetchPGDetailsThunk,
  resetBookingState,
} from '../../store/slices/propertySlice';

interface VisitFormState {
  name: string;
  phone: string;
  visitDate: string;
}

const DEFAULT_PG_IMAGE =
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80';

const DEFAULT_RULES = [
  'No smoking inside rooms',
  '1-month notice period before vacating',
  'Visitors allowed till 9 PM',
];

export const PGDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    selectedProperty: property,
    rooms,
    detailsLoading: loading,
    detailsError: error,
    bookingLoading,
    bookingSuccess: submitted,
    bookingError,
  } = useAppSelector((state) => state.property);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [visitModalOpen, setVisitModalOpen] = useState<boolean>(false);
  const [form, setForm] = useState<VisitFormState>({
    name: '',
    phone: '',
    visitDate: '',
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchPGDetailsThunk(id));
    }
    return () => {
      dispatch(clearPropertyDetails());
    };
  }, [id, dispatch]);

  // Jab rooms load hon, pehla vacant room auto-select kar do
  useEffect(() => {
    const firstAvailable = rooms.find((r) => r.beds.some((b) => b.status === 'VACANT'));
    setSelectedRoomId(firstAvailable?.id ?? null);
  }, [rooms]);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId) ?? null,
    [rooms, selectedRoomId]
  );

  const startingRent = useMemo(() => {
    if (rooms.length > 0) {
      return Math.min(...rooms.map((r) => Number(r.monthly_rent)));
    }
    return Number(property?.starting_rent ?? 0);
  }, [rooms, property]);

  const handleBookVisit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!property) return;

    dispatch(
      bookVisitThunk({
        propertyId: property.id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        visitDate: form.visitDate,
        preferredSharing: selectedRoom?.sharing_type,
      })
    );
  };

  const handleCloseModal = () => {
    setVisitModalOpen(false);
    dispatch(resetBookingState());
    setForm({ name: '', phone: '', visitDate: '' });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="h-8 w-2/3 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-64 rounded-2xl bg-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Card padding="lg" className="space-y-4">
          <p className="text-lg font-semibold text-slate-800">
            {error || 'Property not found'}
          </p>
          <Button variant="outline" onClick={() => navigate('/search')}>
            Back to Search
          </Button>
        </Card>
      </div>
    );
  }

  const imageUrl = property.image_url || DEFAULT_PG_IMAGE;
  const facilities = property.facilities ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO
        title={`${property.name} in ${property.locality}, ${property.city}`}
        description={`${property.gender} PG in ${property.locality}, ${property.city} starting at ₹${startingRent}/month. Verified listing with live bed availability.`}
        keywords={[
          `PG in ${property.city}`,
          `${property.locality} PG`,
          `${property.gender} PG`,
        ]}
        ogImage={imageUrl}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'LodgingBusiness',
          name: property.name,
          address: `${property.locality}, ${property.city}`,
          priceRange: `₹${startingRent}`,
        }}
      />

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to listings
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80">
            <img src={imageUrl} alt={property.name} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="neutral" className="bg-white/95">
                {property.gender}
              </Badge>
              <Badge variant="info" className="bg-white/95">
                Verified PG
              </Badge>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {property.name}
              </h1>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                4.8
              </span>
            </div>
            <p className="mt-1.5 text-sm text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              {property.locality}, {property.city}
            </p>
            {property.description && (
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                {property.description}
              </p>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              Available Room Options
            </h2>
            {rooms.length === 0 ? (
              <Card padding="md" className="text-sm text-slate-500">
                Room inventory will be updated soon. Schedule a visit to check availability.
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {rooms.map((room) => {
                  const vacantBeds = room.beds.filter((b) => b.status === 'VACANT').length;
                  const isSelected = selectedRoom?.id === room.id;
                  const isFull = vacantBeds === 0;

                  return (
                    <Card
                      key={room.id}
                      padding="md"
                      onClick={() => !isFull && setSelectedRoomId(room.id)}
                      className={`transition-all ${
                        isFull
                          ? 'opacity-60 cursor-not-allowed bg-slate-50'
                          : isSelected
                            ? 'border-indigo-500 ring-2 ring-indigo-100 cursor-pointer'
                            : 'hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <BedDouble className="w-4 h-4 text-indigo-600" />
                          {room.sharing_type}
                        </span>
                        <Badge variant={isFull ? 'danger' : 'success'} size="sm" dot>
                          {isFull ? 'Full' : `${vacantBeds} left`}
                        </Badge>
                      </div>
                      <p className="text-xl font-bold text-slate-900">
                        ₹{Number(room.monthly_rent).toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-slate-500">/mo</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Room {room.room_number} • Deposit: ₹
                        {Number(room.deposit_amount).toLocaleString('en-IN')}
                      </p>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {facilities.length > 0 && (
            <Card padding="md">
              <h2 className="text-base font-bold text-slate-900 mb-3">
                Facilities Included
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {facilities.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card padding="md">
            <h2 className="text-base font-bold text-slate-900 mb-3">House Rules</h2>
            <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
              {DEFAULT_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </Card>
        </div>

        <Card padding="lg" className="lg:sticky lg:top-22 space-y-4">
          <div className="pb-4 border-b border-slate-100">
            <span className="text-xs text-slate-500">
              {selectedRoom ? `${selectedRoom.sharing_type} Sharing Rent` : 'Starts from'}
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              ₹{Number(selectedRoom?.monthly_rent ?? startingRent).toLocaleString('en-IN')}
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

      <Modal
        isOpen={visitModalOpen}
        onClose={handleCloseModal}
        title={submitted ? 'Visit Request Sent!' : `Book a Visit — ${property.name}`}
      >
        {submitted ? (
          <div className="text-center py-4 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-sm text-slate-700">
              Thanks <span className="font-semibold">{form.name}</span>! The PG owner will call
              you on <span className="font-semibold">{form.phone}</span> to confirm your visit.
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
              disabled={bookingLoading}
            />
            <Input
              label="Phone Number"
              type="tel"
              required
              placeholder="e.g., 9876543210"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              disabled={bookingLoading}
            />
            <Input
              label="Preferred Visit Date"
              type="date"
              required
              value={form.visitDate}
              onChange={(e) => setForm((prev) => ({ ...prev, visitDate: e.target.value }))}
              error={bookingError}
              disabled={bookingLoading}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={bookingLoading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={bookingLoading}>
                {bookingLoading ? 'Scheduling...' : 'Confirm Visit'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};