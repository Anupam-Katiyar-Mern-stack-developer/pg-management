// src/pages/tenant/TenantDashboardPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
    Building2,
    BedDouble,
    Calendar,
    IndianRupee,
    Receipt,
    Headphones,
    Plus,
    Phone,
    CheckCircle2,
    Clock,
    AlertCircle,
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
import { useAuth } from '../../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    clearTicketError,
    fetchTenantDashboardThunk,
    raiseTenantTicketThunk,
} from '../../store/slices/tenantSlice';
import type { CreateTicketPayload } from '../../services/tenantDashboard.service';

type DashboardTab = 'invoices' | 'support';

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

export const TenantDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const dispatch = useAppDispatch();

    const { stay, invoices, tickets, loading, ticketSubmitting, ticketError } =
        useAppSelector((state) => state.tenant);

    const [activeTab, setActiveTab] = useState<DashboardTab>('invoices');
    const [ticketModalOpen, setTicketModalOpen] = useState<boolean>(false);
    const [ticketForm, setTicketForm] = useState<CreateTicketPayload>({
        category: 'WiFi / Internet',
        title: '',
        description: '',
        priority: 'MEDIUM',
    });

    useEffect(() => {
        dispatch(fetchTenantDashboardThunk());
    }, [dispatch]);

    const pendingAmount = useMemo(
        () =>
            invoices
                .filter((inv) => inv.status !== 'PAID')
                .reduce((sum, inv) => sum + inv.amount, 0),
        [invoices]
    );

    const openTicketsCount = useMemo(
        () => tickets.filter((t) => t.status !== 'RESOLVED').length,
        [tickets]
    );

    const handleOpenModal = () => {
        dispatch(clearTicketError());
        setTicketModalOpen(true);
    };

    const handleRaiseTicket = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await dispatch(
            raiseTenantTicketThunk({
                ...ticketForm,
                title: ticketForm.title.trim(),
                description: ticketForm.description.trim(),
            })
        );

        if (raiseTenantTicketThunk.fulfilled.match(res)) {
            setTicketModalOpen(false);
            setActiveTab('support');
            setTicketForm({
                category: 'WiFi / Internet',
                title: '',
                description: '',
                priority: 'MEDIUM',
            });
        }
    };

    if (loading || !stay) {
        return (
            <div className="space-y-6">
                <div className="h-10 w-64 bg-slate-200 rounded-xl animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
                <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Welcome back, {user?.name || 'Tenant'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        {stay.pgName} • Room {stay.roomNumber} ({stay.bedLabel})
                    </p>
                </div>

                <Button variant="primary" onClick={handleOpenModal} className="inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Raise Facility Issue
                </Button>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card padding="md" className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-indigo-600" />
                        Monthly Rent
                    </span>
                    <p className="text-2xl font-bold text-slate-900">
                        ₹{stay.monthlyRent.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-slate-500">{stay.sharingType}</p>
                </Card>

                <Card padding="md" className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-rose-500" />
                        Pending Dues
                    </span>
                    <p
                        className={`text-2xl font-bold ${pendingAmount > 0 ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                    >
                        ₹{pendingAmount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-slate-500">
                        {pendingAmount > 0 ? 'Payment due' : 'All bills cleared'}
                    </p>
                </Card>

                <Card padding="md" className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        Billing Cycle Day
                    </span>
                    <p className="text-2xl font-bold text-slate-900">{stay.billingDay}th</p>
                    <p className="text-xs text-slate-500">Every month (Move-in anchored)</p>
                </Card>

                <Card padding="md" className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <Headphones className="w-3.5 h-3.5 text-amber-500" />
                        Open Support Issues
                    </span>
                    <p className="text-2xl font-bold text-slate-900">{openTicketsCount}</p>
                    <p className="text-xs text-slate-500">Sent directly to PG Admin</p>
                </Card>
            </div>

            {/* Stay & PG Admin Info Card */}
            <Card padding="md" className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/70">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-700">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                        <BedDouble className="w-4 h-4 text-indigo-600" />
                        Room {stay.roomNumber} • {stay.bedLabel}
                    </span>
                    <span>
                        Move-in: <span className="font-medium">{stay.moveInDate}</span>
                    </span>
                    <span>
                        Deposit Paid:{' '}
                        <span className="font-medium">₹{stay.depositPaid.toLocaleString('en-IN')}</span>
                    </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>
                        PG Admin: <span className="font-semibold">{stay.adminName}</span> ({stay.adminPhone})
                    </span>
                </div>
            </Card>

            {/* Tabs: Bills & Invoices | Facility Support */}
            <div className="border-b border-slate-200 flex gap-6">
                <button
                    type="button"
                    onClick={() => setActiveTab('invoices')}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'invoices'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                >
                    <Receipt className="w-4 h-4" />
                    Bills & Invoices ({invoices.length})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('support')}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'support'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                >
                    <Headphones className="w-4 h-4" />
                    Facility Support ({tickets.length})
                </button>
            </div>

            {/* Tab Content: Invoices */}
            {activeTab === 'invoices' && (
                <Card padding="none" className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                                    <th className="px-5 py-3.5">Invoice ID</th>
                                    <th className="px-5 py-3.5">Billing Month</th>
                                    <th className="px-5 py-3.5">Due Date</th>
                                    <th className="px-5 py-3.5">Amount</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50/60">
                                        <td className="px-5 py-4 font-medium text-slate-900">{inv.id}</td>
                                        <td className="px-5 py-4 text-slate-700">{inv.billingMonth}</td>
                                        <td className="px-5 py-4 text-slate-600">{inv.dueDate}</td>
                                        <td className="px-5 py-4 font-semibold text-slate-900">
                                            ₹{inv.amount.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-5 py-4">
                                            <Badge
                                                variant={
                                                    inv.status === 'PAID'
                                                        ? 'success'
                                                        : inv.status === 'OVERDUE'
                                                            ? 'danger'
                                                            : 'warning'
                                                }
                                                size="sm"
                                                dot
                                            >
                                                {inv.status}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {inv.status === 'PAID' ? (
                                                <span className="text-xs text-slate-500">
                                                    Paid via {inv.paymentMode} ({inv.paidAt})
                                                </span>
                                            ) : (
                                                <Button variant="primary" size="sm">
                                                    Pay Now
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Tab Content: Facility Support Tickets */}
            {activeTab === 'support' && (
                <div className="space-y-3">
                    {tickets.length === 0 ? (
                        <Card padding="lg" className="text-center py-12 space-y-3">
                            <p className="text-base font-semibold text-slate-800">
                                No support issues raised yet
                            </p>
                            <p className="text-sm text-slate-500">
                                Facing any issue with WiFi, AC, water, or food? Raise a ticket directly to
                                your PG Admin.
                            </p>
                            <Button variant="primary" size="sm" onClick={handleOpenModal}>
                                Raise First Issue
                            </Button>
                        </Card>
                    ) : (
                        tickets.map((ticket) => (
                            <Card key={ticket.id} padding="md" className="space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
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

                                <h3 className="font-semibold text-slate-900">{ticket.title}</h3>
                                <p className="text-sm text-slate-600">{ticket.description}</p>

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                                    <span className="inline-flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        Raised on {ticket.createdAt}
                                    </span>
                                    {ticket.resolutionNote && (
                                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Admin Note: {ticket.resolutionNote}
                                        </span>
                                    )}
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Raise Facility Issue Modal */}
            <Modal
                isOpen={ticketModalOpen}
                onClose={() => setTicketModalOpen(false)}
                title="Raise Facility Support Issue"
            >
                <form onSubmit={handleRaiseTicket} className="space-y-4">
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
                            value={ticketForm.category}
                            placeholder=""
                            onChange={(e) =>
                                setTicketForm((p) => ({ ...p, category: e.target.value }))
                            }
                            disabled={ticketSubmitting}
                        />
                        <Select
                            label="Priority"
                            options={PRIORITY_OPTIONS}
                            value={ticketForm.priority}
                            placeholder=""
                            onChange={(e) =>
                                setTicketForm((p) => ({
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
                        placeholder="e.g., WiFi not working in Room 204"
                        value={ticketForm.title}
                        onChange={(e) => setTicketForm((p) => ({ ...p, title: e.target.value }))}
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
                            value={ticketForm.description}
                            onChange={(e) =>
                                setTicketForm((p) => ({ ...p, description: e.target.value }))
                            }
                            disabled={ticketSubmitting}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setTicketModalOpen(false)}
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