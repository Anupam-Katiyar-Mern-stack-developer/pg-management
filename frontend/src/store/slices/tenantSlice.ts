// src/store/slices/tenantSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import {
    createTenantTicketApi,
    fetchTenantDashboardApi,
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
}

const initialState: TenantState = {
    stay: null,
    invoices: [],
    tickets: [],
    loading: false,
    error: '',
    ticketSubmitting: false,
    ticketError: '',
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
            });
    },
});

export const { clearTicketError } = tenantSlice.actions;
export default tenantSlice.reducer;