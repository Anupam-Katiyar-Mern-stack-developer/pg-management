// src/store/slices/superAdminSlice.ts
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
    fetchSuperAdminDashboardApi,
    type AdminSupportTicket,
    type SiteSeoSettings,
    type SuperAdminDashboardData,
    type SuperAdminPGAdmin,
    type SuperAdminPropertyView,
    type SuperAdminUserView,
} from '../../services/superAdmin.service';

interface SuperAdminState {
    admins: SuperAdminPGAdmin[];
    properties: SuperAdminPropertyView[];
    users: SuperAdminUserView[];
    supportTickets: AdminSupportTicket[];
    seoSettings: SiteSeoSettings | null;
    loading: boolean;
    seoSaved: boolean;
}

const initialState: SuperAdminState = {
    admins: [],
    properties: [],
    users: [],
    supportTickets: [],
    seoSettings: null,
    loading: false,
    seoSaved: false,
};

export const fetchSuperAdminDataThunk = createAsyncThunk<SuperAdminDashboardData>(
    'superAdmin/fetchAll',
    async () => {
        return await fetchSuperAdminDashboardApi();
    }
);

const superAdminSlice = createSlice({
    name: 'superAdmin',
    initialState,
    reducers: {
        toggleAdminPermission: (
            state,
            action: PayloadAction<{
                adminId: string;
                key: 'can_use_invoicing' | 'can_use_ticketing' | 'can_use_online_payment';
            }>
        ) => {
            const admin = state.admins.find((a) => a.id === action.payload.adminId);
            if (admin) {
                admin.permissions[action.payload.key] = !admin.permissions[action.payload.key];
            }
        },
        toggleAdminActive: (state, action: PayloadAction<string>) => {
            const admin = state.admins.find((a) => a.id === action.payload);
            if (admin) admin.isActive = !admin.isActive;
        },
        togglePropertyApproval: (state, action: PayloadAction<string>) => {
            const prop = state.properties.find((p) => p.id === action.payload);
            if (prop) prop.isApproved = !prop.isApproved;
        },
        toggleUserBlock: (state, action: PayloadAction<string>) => {
            const user = state.users.find((u) => u.id === action.payload);
            if (user) user.isBlocked = !user.isBlocked;
        },
        resolveAdminTicket: (
            state,
            action: PayloadAction<{ ticketId: string; replyNote: string }>
        ) => {
            const ticket = state.supportTickets.find((t) => t.id === action.payload.ticketId);
            if (ticket) {
                ticket.status = 'RESOLVED';
                ticket.replyNote = action.payload.replyNote;
            }
        },
        saveSeoSettings: (state, action: PayloadAction<SiteSeoSettings>) => {
            state.seoSettings = action.payload;
            state.seoSaved = true;
        },
        resetSeoSavedFlag: (state) => {
            state.seoSaved = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSuperAdminDataThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSuperAdminDataThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.admins = action.payload.admins;
                state.properties = action.payload.properties;
                state.users = action.payload.users;
                state.supportTickets = action.payload.supportTickets;
                state.seoSettings = action.payload.seoSettings;
            })
            .addCase(fetchSuperAdminDataThunk.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const {
    toggleAdminPermission,
    toggleAdminActive,
    togglePropertyApproval,
    toggleUserBlock,
    resolveAdminTicket,
    saveSeoSettings,
    resetSeoSavedFlag,
} = superAdminSlice.actions;

export default superAdminSlice.reducer;