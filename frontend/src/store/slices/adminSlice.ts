// src/store/slices/adminSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
    fetchAdminDashboardApi,
    type AdminDashboardData,
    type AdminPGItem,
    type AdminTenantItem,
    type AdminToSuperTicket,
} from '../../services/admin.service';

interface AdminState {
    properties: AdminPGItem[];
    tenants: AdminTenantItem[];
    supportTickets: AdminToSuperTicket[];
    loading: boolean;
}

const initialState: AdminState = {
    properties: [],
    tenants: [],
    supportTickets: [],
    loading: false,
};

export const fetchAdminDashboardThunk = createAsyncThunk<AdminDashboardData>(
    'admin/fetchDashboard',
    async () => {
        return await fetchAdminDashboardApi();
    }
);

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        // PG CRUD
        addAdminProperty: (state, action: PayloadAction<Omit<AdminPGItem, 'id' | 'isApproved'>>) => {
            state.properties.unshift({
                ...action.payload,
                id: `pg-${Date.now()}`,
                isApproved: false,
            });
        },
        deleteAdminProperty: (state, action: PayloadAction<string>) => {
            state.properties = state.properties.filter((p) => p.id !== action.payload);
        },
        // Tenant CRUD
        addAdminTenant: (state, action: PayloadAction<Omit<AdminTenantItem, 'id' | 'loginId'>>) => {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            state.tenants.unshift({
                ...action.payload,
                id: `ten-${Date.now()}`,
                loginId: `SF-TEN-${randomNum}`,
            });
        },
        updateAdminTenant: (state, action: PayloadAction<AdminTenantItem>) => {
            const idx = state.tenants.findIndex((t) => t.id === action.payload.id);
            if (idx !== -1) state.tenants[idx] = action.payload;
        },
        deleteAdminTenant: (state, action: PayloadAction<string>) => {
            state.tenants = state.tenants.filter((t) => t.id !== action.payload);
        },
        // Support to Super Admin
        raiseAdminSupportTicket: (
            state,
            action: PayloadAction<Omit<AdminToSuperTicket, 'id' | 'status' | 'createdAt'>>
        ) => {
            state.supportTickets.unshift({
                ...action.payload,
                id: `SUP-${Math.floor(300 + Math.random() * 700)}`,
                status: 'OPEN',
                createdAt: new Date().toISOString().split('T')[0],
            });
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminDashboardThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdminDashboardThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.properties = action.payload.properties;
                state.tenants = action.payload.tenants;
                state.supportTickets = action.payload.supportTickets;
            })
            .addCase(fetchAdminDashboardThunk.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const {
    addAdminProperty,
    deleteAdminProperty,
    addAdminTenant,
    updateAdminTenant,
    deleteAdminTenant,
    raiseAdminSupportTicket,
} = adminSlice.actions;

export default adminSlice.reducer;