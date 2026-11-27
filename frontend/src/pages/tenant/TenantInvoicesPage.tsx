// src/pages/tenant/TenantInvoicesPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
    Receipt,
    CheckCircle2,
    Clock,
    IndianRupee,
    Printer,
    CreditCard,
    Smartphone,
} from 'lucide-react';
import {
    Badge,
    Button,
    Card,
    Modal,
    Select,
    type SelectOption,
} from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchTenantDashboardThunk,
    payTenantInvoiceThunk,
} from '../../store/slices/tenantSlice';
import type { TenantInvoice } from '../../services/tenantDashboard.service';

const STATUS_FILTER_OPTIONS: SelectOption[] = [
    { label: 'All Invoices', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Overdue', value: 'OVERDUE' },
];

export const TenantInvoicesPage: React.FC = () => {
    const { user } = useAuth();
    const dispatch = useAppDispatch();

    const { stay, invoices, loading, payingInvoiceId } = useAppSelector(
        (state) => state.tenant
    );

    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedReceipt, setSelectedReceipt] = useState<TenantInvoice | null>(null);
    const [payModalInvoice, setPayModalInvoice] = useState<TenantInvoice | null>(null);
    const [paymentMode, setPaymentMode] = useState<'UPI' | 'ONLINE'>('UPI');

    useEffect(() => {
        if (invoices.length === 0) {
            dispatch(fetchTenantDashboardThunk());
        }
    }, [dispatch, invoices.length]);

    const filteredInvoices = useMemo(() => {
        if (statusFilter === 'ALL') return invoices;
        return invoices.filter((inv) => inv.status === statusFilter);
    }, [invoices, statusFilter]);

    const { totalPaid, totalPending } = useMemo(() => {
        return invoices.reduce(
            (acc, inv) => {
                if (inv.status === 'PAID') acc.totalPaid += inv.amount;
                else acc.totalPending += inv.amount;
                return acc;
            },
            { totalPaid: 0, totalPending: 0 }
        );
    }, [invoices]);

    const handleConfirmPayment = async () => {
        if (!payModalInvoice) return;
        const res = await dispatch(
            payTenantInvoiceThunk({
                invoiceId: payModalInvoice.id,
                paymentMode,
            })
        );
        if (payTenantInvoiceThunk.fulfilled.match(res)) {
            setPayModalInvoice(null);
        }
    };

    if (loading && invoices.length === 0) {
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
                        <Receipt className="w-6 h-6 text-indigo-600" />
                        Rent Bills & Invoices
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Track your monthly rent cycle, pay pending dues, and download receipts.
                    </p>
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card padding="md" className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        Pending Dues
                    </span>
                    <p
                        className={`text-2xl font-bold ${totalPending > 0 ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                    >
                        ₹{totalPending.toLocaleString('en-IN')}
                    </p>
                </Card>

                <Card padding="md" className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Total Paid
                    </span>
                    <p className="text-2xl font-bold text-slate-900">
                        ₹{totalPaid.toLocaleString('en-IN')}
                    </p>
                </Card>

                <Card padding="md" className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5 text-indigo-600" />
                        Billing Day
                    </span>
                    <p className="text-2xl font-bold text-slate-900">
                        {stay ? `${stay.billingDay}th of every month` : '—'}
                    </p>
                </Card>
            </div>

            {/* Invoices Table */}
            <Card padding="none" className="overflow-hidden">
                {filteredInvoices.length === 0 ? (
                    <div className="text-center py-14 px-4">
                        <p className="text-base font-semibold text-slate-800">No invoices found</p>
                        <p className="text-sm text-slate-500 mt-1">
                            No rent invoices match the selected filter.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                                    <th className="px-5 py-3.5">Invoice ID</th>
                                    <th className="px-5 py-3.5">Billing Month</th>
                                    <th className="px-5 py-3.5">Due Date</th>
                                    <th className="px-5 py-3.5">Amount</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50/60">
                                        <td className="px-5 py-4 font-semibold text-slate-900">{inv.id}</td>
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
                                        <td className="px-5 py-4 text-right space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedReceipt(inv)}
                                            >
                                                Receipt
                                            </Button>
                                            {inv.status !== 'PAID' && (
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => setPayModalInvoice(inv)}
                                                >
                                                    Pay Now
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Receipt Preview Modal */}
            <Modal
                isOpen={Boolean(selectedReceipt)}
                onClose={() => setSelectedReceipt(null)}
                title={`Invoice Receipt — ${selectedReceipt?.id ?? ''}`}
            >
                {selectedReceipt && (
                    <div className="space-y-4 text-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <p className="font-bold text-slate-900 text-base">
                                    {stay?.pgName || 'StayFlow PG'}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {stay ? `${stay.locality}, ${stay.city}` : ''}
                                </p>
                            </div>
                            <Badge
                                variant={selectedReceipt.status === 'PAID' ? 'success' : 'warning'}
                                dot
                            >
                                {selectedReceipt.status}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs">
                            <div>
                                <p className="text-slate-400">Tenant Name</p>
                                <p className="font-semibold text-slate-800 mt-0.5">{user?.name}</p>
                            </div>
                            <div>
                                <p className="text-slate-400">Room & Bed</p>
                                <p className="font-semibold text-slate-800 mt-0.5">
                                    {stay ? `Room ${stay.roomNumber} • ${stay.bedLabel}` : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-400">Billing Month</p>
                                <p className="font-semibold text-slate-800 mt-0.5">
                                    {selectedReceipt.billingMonth}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-400">Due Date</p>
                                <p className="font-semibold text-slate-800 mt-0.5">
                                    {selectedReceipt.dueDate}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-3 border-y border-slate-100">
                            <span className="font-medium text-slate-700">Monthly Rent</span>
                            <span className="text-lg font-bold text-slate-900">
                                ₹{selectedReceipt.amount.toLocaleString('en-IN')}
                            </span>
                        </div>

                        {selectedReceipt.status === 'PAID' && (
                            <p className="text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
                                Paid via <span className="font-semibold">{selectedReceipt.paymentMode}</span> on{' '}
                                <span className="font-semibold">{selectedReceipt.paidAt}</span>
                            </p>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setSelectedReceipt(null)}>
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-1.5"
                            >
                                <Printer className="w-4 h-4" />
                                Print / Save PDF
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Pay Now Modal */}
            <Modal
                isOpen={Boolean(payModalInvoice)}
                onClose={() => setPayModalInvoice(null)}
                title={`Pay Rent — ${payModalInvoice?.billingMonth ?? ''}`}
            >
                {payModalInvoice && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">Amount Payable</span>
                            <span className="text-xl font-bold text-indigo-700">
                                ₹{payModalInvoice.amount.toLocaleString('en-IN')}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase">
                                Select Payment Mode
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMode('UPI')}
                                    className={`p-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${paymentMode === 'UPI'
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    <Smartphone className="w-4 h-4" />
                                    UPI (GPay / PhonePe)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMode('ONLINE')}
                                    className={`p-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${paymentMode === 'ONLINE'
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    <CreditCard className="w-4 h-4" />
                                    Card / NetBanking
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setPayModalInvoice(null)}
                                disabled={Boolean(payingInvoiceId)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleConfirmPayment}
                                disabled={Boolean(payingInvoiceId)}
                            >
                                {payingInvoiceId ? 'Processing...' : 'Confirm Payment'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};