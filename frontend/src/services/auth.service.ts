// src/services/auth.service.ts
import { api } from './api';
import type { AuthUser } from '../context/AuthContext';

export interface LoginResponse {
    token: string;
    user: AuthUser;
}

export const loginApi = async (
    email: string,
    password: string
): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
    return data;
};

export const getMeApi = async (): Promise<AuthUser> => {
    const { data } = await api.get<{ user: AuthUser }>('/auth/me');
    return data.user;
};