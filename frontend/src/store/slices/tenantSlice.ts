// src/store/slices/tenantSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import {
    createTenantTicketApi,
    fetchTenantDashboardApi,
    payTenantInvoiceApi,

    type CreateTicketPayload,
    type TenantDashboardData,
    type TenantInvoice,
    type TenantStayInfo,
    type TenantTicket,
} from '../../services/tenantDashboard.service';

interface TenantState {
    stay: TenantStayInfo | null;
    invoices: TenantInvoice[];
    tickets: TenantTicket[];
    loading: boolean;
    error: string;
    ticketSubmitting: boolean;
    ticketError: string;
    payingInvoiceId: string | null;
}

const initialState: TenantState = {
    stay: null,
    invoices: [],
    tickets: [],
    loading: false,
    error: '',
    ticketSubmitting: false,
    ticketError: '',
    payingInvoiceId: null,
};

export const fetchTenantDashboardThunk = createAsyncThunk<
    TenantDashboardData,
    void,
    { rejectValue: string }
>('tenant/fetchDashboard', async (_, { rejectWithValue }) => {
    try {
        return await fetchTenantDashboardApi();
    } catch (err) {
        if (axios.isAxiosError(err)) {
            return rejectWithValue(
                err.response?.data?.message || 'Could not load your dashboard.'
            );
        }
        return rejectWithValue('Something went wrong while loading dashboard.');
    }
});

export const raiseTenantTicketThunk = createAsyncThunk<
    TenantTicket,
    CreateTicketPayload,
    { rejectValue: string }
>('tenant/raiseTicket', async (payload, { rejectWithValue }) => {
    try {
        return await createTenantTicketApi(payload);
    } catch (err) {
        if (axios.isAxiosError(err)) {
            return rejectWithValue(
                err.response?.data?.message || 'Could not submit support ticket.'
            );
        }
        return rejectWithValue('Something went wrong. Please try again.');
    }
});

export const payTenantInvoiceThunk = createAsyncThunk<
    { invoiceId: string; paymentMode: 'UPI' | 'ONLINE'; paidAt: string },
    { invoiceId: string; paymentMode: 'UPI' | 'ONLINE' },
    { rejectValue: string }
>('tenant/payInvoice', async ({ invoiceId, paymentMode }, { rejectWithValue }) => {
    try {
        return await payTenantInvoiceApi(invoiceId, paymentMode);
    } catch (err) {
        if (axios.isAxiosError(err)) {
            return rejectWithValue(err.response?.data?.message || 'Payment failed.');
        }
        return rejectWithValue('Could not process payment.');
    }
});

const tenantSlice = createSlice({
    name: 'tenant',
    initialState,
    reducers: {
        clearTicketError: (state) => {
            state.ticketError = '';
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Dashboard
            .addCase(fetchTenantDashboardThunk.pending, (state) => {
                state.loading = true;
                state.error = '';
            })
            .addCase(fetchTenantDashboardThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.stay = action.payload.stay;
                state.invoices = action.payload.invoices;
                state.tickets = action.payload.tickets;
            })
            .addCase(fetchTenantDashboardThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load dashboard.';
            })
            // Raise Support Ticket
            .addCase(raiseTenantTicketThunk.pending, (state) => {
                state.ticketSubmitting = true;
                state.ticketError = '';
            })
            .addCase(raiseTenantTicketThunk.fulfilled, (state, action) => {
                state.ticketSubmitting = false;
                state.tickets.unshift(action.payload);
            })
            .addCase(raiseTenantTicketThunk.rejected, (state, action) => {
                state.ticketSubmitting = false;
                state.ticketError = action.payload || 'Could not submit ticket.';
            })

            // Pay Invoice
            .addCase(payTenantInvoiceThunk.pending, (state, action) => {
                state.payingInvoiceId = action.meta.arg.invoiceId;
            })
            .addCase(payTenantInvoiceThunk.fulfilled, (state, action) => {
                state.payingInvoiceId = null;
                const target = state.invoices.find((i) => i.id === action.payload.invoiceId);
                if (target) {
                    target.status = 'PAID';
                    target.paymentMode = action.payload.paymentMode;
                    target.paidAt = action.payload.paidAt;
                }
            })
            .addCase(payTenantInvoiceThunk.rejected, (state) => {
                state.payingInvoiceId = null;
            });
    },
});

export const { clearTicketError } = tenantSlice.actions;
export default tenantSlice.reducer;