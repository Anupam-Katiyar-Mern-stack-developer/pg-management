// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import homeReducer from './slices/home.slice';
import tenantReducer from './slices/tenantSlice';
import superAdminReducer from './slices/superAdminSlice';

export const store = configureStore({
  reducer: {
    home: homeReducer,
    tenant: tenantReducer,
    superAdmin: superAdminReducer,

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;