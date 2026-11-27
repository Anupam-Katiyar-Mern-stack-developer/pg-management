// src/pages/tenant/TenantTicketsPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
    Headphones,
    Plus,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    Wrench,
} from 'lucide-react';
import {
    Badge,
    Button,
    Card,
    Input,
    Modal,
    Select,
    type SelectOption,
} from '../../components/common';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    clearTicketError,
    fetchTenantDashboardThunk,
    raiseTenantTicketThunk,
} from '../../store/slices/tenantSlice';
import type { CreateTicketPayload } from '../../services/tenantDashboard.service';

const STATUS_FILTER_OPTIONS: SelectOption[] = [
    { label: 'All Tickets', value: 'ALL' },
    { label: 'Open', value: 'OPEN' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Resolved', value: 'RESOLVED' },
];

const CATEGORY_OPTIONS: SelectOption[] = [
    { label: 'WiFi / Internet', value: 'WiFi / Internet' },
    { label: 'AC / Electrical', value: 'AC / Electrical' },
    { label: 'Plumbing / Water', value: 'Plumbing / Water' },
    { label: 'Food / Meals', value: 'Food / Meals' },
    { label: 'Housekeeping / Cleaning', value: 'Housekeeping / Cleaning' },
    { label: 'Other', value: 'Other' },
];

const PRIORITY_OPTIONS: SelectOption[] = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High (Urgent)', value: 'HIGH' },
];

export const TenantTicketsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { stay, tickets, loading, ticketSubmitting, ticketError } = useAppSelector(
        (state) => state.tenant
    );

    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const [form, setForm] = useState<CreateTicketPayload>({
        category: 'WiFi / Internet',
        title: '',
        description: '',
        priority: 'MEDIUM',
    });

    useEffect(() => {
        if (tickets.length === 0) {
            dispatch(fetchTenantDashboardThunk());
        }
    }, [dispatch, tickets.length]);

    const counts = useMemo(() => {
        return tickets.reduce(
            (acc, t) => {
                if (t.status === 'OPEN') acc.open += 1;
                else if (t.status === 'IN_PROGRESS') acc.inProgress += 1;
                else if (t.status === 'RESOLVED') acc.resolved += 1;
                return acc;
            },
            { open: 0, inProgress: 0, resolved: 0 }
        );
    }, [tickets]);

    const filteredTickets = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return tickets.filter((t) => {
            const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
            const matchesQuery =
                !q ||
                t.title.toLowerCase().includes(q) ||
                t.category.toLowerCase().includes(q) ||
                t.id.toLowerCase().includes(q);
            return matchesStatus && matchesQuery;
        });
    }, [tickets, statusFilter, searchQuery]);

    const handleOpenModal = () => {
        dispatch(clearTicketError());
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await dispatch(
            raiseTenantTicketThunk({
                ...form,
                title: form.title.trim(),
                description: form.description.trim(),
            })
        );

        if (raiseTenantTicketThunk.fulfilled.match(res)) {
            setModalOpen(false);
            setStatusFilter('ALL');
            setForm({
                category: 'WiFi / Internet',
                title: '',
                description: '',
                priority: 'MEDIUM',
            });
        }
    };

    if (loading && tickets.length === 0) {
        return (
            <div className="space-y-6">
                <div className="h-9 w-56 bg-slate-200 rounded-xl animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
                <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Headphones className="w-6 h-6 text-indigo-600" />
                        Facility Support & Tickets
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Raise room or facility issues directly to{' '}
                        <span className="font-medium text-slate-700">
                            {stay?.adminName || 'your PG Admin'}
                        </span>
                        .
                    </p>
                </div>

                <Button
                    variant="primary"
                    onClick={handleOpenModal}
                    className="inline-flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Raise New Issue
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card padding="md" className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        Open Tickets
                    </span>
                    <p className="text-2xl font-bold text-slate-900">{counts.open}</p>
                </Card>

                <Card padding="md" className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                        In Progress
                    </span>
                    <p className="text-2xl font-bold text-slate-900">{counts.inProgress}</p>
                </Card>

                <Card padding="md" className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Resolved
                    </span>
                    <p className="text-2xl font-bold text-emerald-600">{counts.resolved}</p>
                </Card>
            </div>

            {/* Search & Status Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <Input
                        placeholder="Search by ticket ID, title, or category..."
                        leftIcon={<Search className="w-4 h-4" />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Select
                        options={STATUS_FILTER_OPTIONS}
                        value={statusFilter}
                        placeholder=""
                        onChange={(e) => setStatusFilter(e.target.value)}
                    />
                </div>
            </div>

            {/* Tickets List */}
            {filteredTickets.length === 0 ? (
                <Card padding="lg" className="text-center py-14 space-y-3">
                    <p className="text-base font-semibold text-slate-800">No tickets found</p>
                    <p className="text-sm text-slate-500">
                        {tickets.length === 0
                            ? 'Facing any facility issue? Raise your first ticket to notify your PG Admin.'
                            : 'Try changing the status filter or search keyword.'}
                    </p>
                    {tickets.length === 0 && (
                        <Button variant="primary" size="sm" onClick={handleOpenModal}>
                            Raise First Issue
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredTickets.map((ticket) => (
                        <Card key={ticket.id} padding="md" className="space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-400">
                                        {ticket.id}
                                    </span>
                                    <Badge variant="neutral" size="sm">
                                        {ticket.category}
                                    </Badge>
                                    <Badge
                                        variant={
                                            ticket.priority === 'HIGH'
                                                ? 'danger'
                                                : ticket.priority === 'MEDIUM'
                                                    ? 'warning'
                                                    : 'info'
                                        }
                                        size="sm"
                                    >
                                        {ticket.priority}
                                    </Badge>
                                </div>

                                <Badge
                                    variant={
                                        ticket.status === 'RESOLVED'
                                            ? 'success'
                                            : ticket.status === 'IN_PROGRESS'
                                                ? 'info'
                                                : 'warning'
                                    }
                                    size="sm"
                                    dot
                                >
                                    {ticket.status.replace('_', ' ')}
                                </Badge>
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-900">{ticket.title}</h3>
                                <p className="text-sm text-slate-600 mt-0.5">{ticket.description}</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    Raised on {ticket.createdAt}
                                </span>

                                {ticket.resolutionNote && (
                                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg">
                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                        Admin Note: {ticket.resolutionNote}
                                    </span>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Raise New Issue Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Raise Facility Support Issue"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {ticketError && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{ticketError}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                            label="Category"
                            options={CATEGORY_OPTIONS}
                            value={form.category}
                            placeholder=""
                            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                            disabled={ticketSubmitting}
                        />
                        <Select
                            label="Priority"
                            options={PRIORITY_OPTIONS}
                            value={form.priority}
                            placeholder=""
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    priority: e.target.value as CreateTicketPayload['priority'],
                                }))
                            }
                            disabled={ticketSubmitting}
                        />
                    </div>

                    <Input
                        label="Issue Title"
                        required
                        placeholder="e.g., AC cooling not working in Room 204"
                        value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        disabled={ticketSubmitting}
                    />

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            required
                            placeholder="Explain the issue briefly so your PG Admin can fix it quickly..."
                            value={form.description}
                            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                            disabled={ticketSubmitting}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setModalOpen(false)}
                            disabled={ticketSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={ticketSubmitting}>
                            {ticketSubmitting ? 'Submitting...' : 'Submit to PG Admin'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};