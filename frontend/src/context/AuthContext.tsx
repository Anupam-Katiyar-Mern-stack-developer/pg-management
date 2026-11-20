// src/context/AuthContext.tsx
import React, { createContext, useContext, useState } from 'react';
import type { AdminPermissions } from '../components/layout';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TENANT';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    permissions?: AdminPermissions;
    roomLabel?: string; // Sirf Tenant ke liye
}

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (userData: AuthUser) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'stayflow_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<AuthUser | null>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? (JSON.parse(saved) as AuthUser) : null;
    });

    const login = (userData: AuthUser) => {
        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: Boolean(user),
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used inside an AuthProvider');
    }
    return ctx;
};