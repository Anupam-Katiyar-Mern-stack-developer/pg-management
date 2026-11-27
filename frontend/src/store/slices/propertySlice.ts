// src/store/slices/propertySlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import {
    bookVisitLead,
    fetchPropertyDetails,
    fetchPropertyRooms,
    type BackendRoom,
} from '../../services/property.service';

export type PropertyDetailData = Awaited<ReturnType<typeof fetchPropertyDetails>>;

interface PropertyState {
    selectedProperty: PropertyDetailData | null;
    rooms: BackendRoom[];
    detailsLoading: boolean;
    detailsError: string;
    bookingLoading: boolean;
    bookingSuccess: boolean;
    bookingError: string;
}

const initialState: PropertyState = {
    selectedProperty: null,
    rooms: [],
    detailsLoading: false,
    detailsError: '',
    bookingLoading: false,
    bookingSuccess: false,
    bookingError: '',
};

export const fetchPGDetailsThunk = createAsyncThunk<
    { property: PropertyDetailData; rooms: BackendRoom[] },
    string,
    { rejectValue: string }
>('property/fetchDetails', async (idOrSlug, { rejectWithValue }) => {
    try {
        const property = await fetchPropertyDetails(idOrSlug);
        const rooms = await fetchPropertyRooms(property.id);
        return { property, rooms };
    } catch (err) {
        if (axios.isAxiosError(err)) {
            return rejectWithValue(
                err.response?.data?.message || 'Property not found or could not be loaded.'
            );
        }
        return rejectWithValue('Something went wrong while loading property details.');
    }
});

export const bookVisitThunk = createAsyncThunk<
    void,
    {
        propertyId: string;
        name: string;
        phone: string;
        visitDate: string;
        preferredSharing?: string;
    },
    { rejectValue: string }
>('property/bookVisit', async (payload, { rejectWithValue }) => {
    try {
        await bookVisitLead(payload);
    } catch (err) {
        if (axios.isAxiosError(err)) {
            return rejectWithValue(
                err.response?.data?.message || 'Could not schedule visit.'
            );
        }
        return rejectWithValue('Something went wrong. Please try again.');
    }
});

const propertySlice = createSlice({
    name: 'property',
    initialState,
    reducers: {
        clearPropertyDetails: (state) => {
            state.selectedProperty = null;
            state.rooms = [];
            state.detailsError = '';
        },
        resetBookingState: (state) => {
            state.bookingLoading = false;
            state.bookingSuccess = false;
            state.bookingError = '';
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch PG Details + Rooms
            .addCase(fetchPGDetailsThunk.pending, (state) => {
                state.detailsLoading = true;
                state.detailsError = '';
            })
            .addCase(fetchPGDetailsThunk.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.selectedProperty = action.payload.property;
                state.rooms = action.payload.rooms;
            })
            .addCase(fetchPGDetailsThunk.rejected, (state, action) => {
                state.detailsLoading = false;
                state.detailsError = action.payload || 'Failed to load property.';
            })
            // Book Visit Lead
            .addCase(bookVisitThunk.pending, (state) => {
                state.bookingLoading = true;
                state.bookingError = '';
                state.bookingSuccess = false;
            })
            .addCase(bookVisitThunk.fulfilled, (state) => {
                state.bookingLoading = false;
                state.bookingSuccess = true;
            })
            .addCase(bookVisitThunk.rejected, (state, action) => {
                state.bookingLoading = false;
                state.bookingError = action.payload || 'Could not schedule visit.';
            });
    },
});

export const { clearPropertyDetails, resetBookingState } = propertySlice.actions;
export default propertySlice.reducer;