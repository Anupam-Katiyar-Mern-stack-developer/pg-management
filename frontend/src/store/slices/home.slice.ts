// src/store/slices/homeSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type { PGItem } from '../../components/shared';
import {
    fetchHomeDataApi,
    type HomeDataResponse,
    type HomeStats,
    type PopularCity,
} from '../../services/home.service';

interface HomeState {
    featuredPgs: PGItem[];
    popularCities: PopularCity[];
    stats: HomeStats | null;
    loading: boolean;
    error: string;
}

const initialState: HomeState = {
    featuredPgs: [],
    popularCities: [],
    stats: null,
    loading: false,
    error: '',
};

export const fetchHomeDataThunk = createAsyncThunk<
    HomeDataResponse,
    void,
    { rejectValue: string }
>('home/fetchData', async (_, { rejectWithValue }) => {
    try {
        return await fetchHomeDataApi();
    } catch (err) {
        if (axios.isAxiosError(err)) {
            return rejectWithValue(
                err.response?.data?.message || 'Could not load home page data.'
            );
        }
        return rejectWithValue('Something went wrong while loading home data.');
    }
});

const homeSlice = createSlice({
    name: 'home',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchHomeDataThunk.pending, (state) => {
                state.loading = true;
                state.error = '';
            })
            .addCase(fetchHomeDataThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.featuredPgs = action.payload.featuredPgs;
                state.popularCities = action.payload.popularCities;
                state.stats = action.payload.stats;
            })
            .addCase(fetchHomeDataThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load home data.';
            });
    },
});

export default homeSlice.reducer;