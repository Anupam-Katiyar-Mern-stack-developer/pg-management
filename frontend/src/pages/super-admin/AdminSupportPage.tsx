// src/pages/super-admin/AdminSupportPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Headphones, CheckCircle2, Search } from 'lucide-react';
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
    fetchSuperAdminDataThunk,
    resolveAdminTicket,
} from '../../store/slices/superAdminSlice';
import type { AdminSupportTicket } from '../../services/superAdmin.service';

const STATUS_OPTIONS: SelectOption[] = [
    { label: 'All Tickets', value: 'ALL' },
    { label: 'Open Only', value: 'OPEN' },
    { label: 'Resolved', value: 'RESOLVED' },
];

export const AdminSupportPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { supportTickets } = useAppSelector((state) => state.superAdmin);

    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [search, setSearch] = useState<string>('');
    const [replyTicket, setReplyTicket] = useState<AdminSupportTicket | null>(null);
    const [replyNote, setReplyNote] = useState<string>('');

    useEffect(() => {
        if (supportTickets.length === 0) dispatch(fetchSuperAdminDataThunk());
    }, [dispatch, supportTickets.length]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return supportTickets.filter((t) => {
            const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
            const matchesQuery =
                !q ||
                t.subject.toLowerCase().includes(q) ||
                t.adminName.toLowerCase().includes(q) ||
                t.pgName.toLowerCase().includes(q) ||
                t.id.toLowerCase().includes(q);
            return matchesStatus && matchesQuery;
        });
    }, [supportTickets, statusFilter, search]);

    const handleResolveSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!replyTicket || !replyNote.trim()) return;
        dispatch(
            resolveAdminTicket({ ticketId: replyTicket.id, replyNote: replyNote.trim() })
        );
        setReplyTicket(null);
        setReplyNote('');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Headphones className="w-6 h-6 text-indigo-600" />
                    PG Admin Support Inbox
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                    Resolve login, tenant onboarding, and billing issues raised by PG Admins.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                    <Input
                        placeholder="Search by ticket ID, PG Admin, or subject..."
                        leftIcon={<Search className="w-4 h-4" />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Select
                        options={STATUS_OPTIONS}
                        value={statusFilter}
                        placeholder=""
                        onChange={(e) => setStatusFilter(e.target.value)}
                    />
                </div>
            </div>

            {/* Tickets List */}
            {filtered.length === 0 ? (
                <Card padding="lg" className="text-center py-12">
                    <p className="text-base font-semibold text-slate-800">No support tickets found</p>
                    <p className="text-sm text-slate-500 mt-1">
                        All caught up or try changing the filter.
                    </p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filtered.map((ticket) => (
                        <Card key={ticket.id} padding="md" className="space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-400">{ticket.id}</span>
                                    <Badge variant="neutral" size="sm">
                                        {ticket.category.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-xs text-slate-500">
                                        by <span className="font-semibold text-slate-700">{ticket.adminName}</span> (
                                        {ticket.pgName})
                                    </span>
                                </div>
                                <Badge
                                    variant={ticket.status === 'RESOLVED' ? 'success' : 'warning'}
                                    size="sm"
                                    dot
                                >
                                    {ticket.status}
                                </Badge>
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-900">{ticket.subject}</h3>
                                <p className="text-sm text-slate-600 mt-0.5">{ticket.message}</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                                <span className="text-xs text-slate-400">Raised on {ticket.createdAt}</span>
                                {ticket.status === 'OPEN' ? (
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => {
                                            setReplyTicket(ticket);
                                            setReplyNote('');
                                        }}
                                    >
                                        Resolve & Reply
                                    </Button>
                                ) : (
                                    <span className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                        Reply: {ticket.replyNote}
                                    </span>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Resolve Modal */}
            <Modal
                isOpen={Boolean(replyTicket)}
                onClose={() => setReplyTicket(null)}
                title={`Resolve Ticket — ${replyTicket?.id ?? ''}`}
            >
                <form onSubmit={handleResolveSubmit} className="space-y-4">
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                        {replyTicket?.message}
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Resolution Note for {replyTicket?.adminName}
                        </label>
                        <textarea
                            rows={3}
                            required
                            placeholder="Write how the issue was resolved..."
                            value={replyNote}
                            onChange={(e) => setReplyNote(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setReplyTicket(null)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            Mark Resolved
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};