<<<<<<< HEAD
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import homeReducer from './slices/home.slice';


export const store = configureStore({
  reducer: {
    home: homeReducer,
    
  },
=======
import { configureStore } from "@reduxjs/toolkit";
import propertyReducer from './slices/propertySlice';

export const store = configureStore({
    reducer: {
        property: propertyReducer,
    },
>>>>>>> origin/main
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;