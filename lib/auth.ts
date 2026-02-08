// Authentication utilities for React Native
// Uses expo-secure-store for native and localStorage for web

import { Platform } from 'react-native';
import { API_BASE_URL } from './config';
import type { User } from './types';

// Conditionally import SecureStore only on native platforms
let SecureStore: typeof import('expo-secure-store') | null = null;
if (Platform.OS !== 'web') {
    SecureStore = require('expo-secure-store');
}

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

// Storage abstraction that works on both web and native
const storage = {
    async setItem(key: string, value: string): Promise<void> {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
        } else if (SecureStore) {
            await SecureStore.setItemAsync(key, value);
        }
    },

    async getItem(key: string): Promise<string | null> {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        } else if (SecureStore) {
            return await SecureStore.getItemAsync(key);
        }
        return null;
    },

    async removeItem(key: string): Promise<void> {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key);
        } else if (SecureStore) {
            await SecureStore.deleteItemAsync(key);
        }
    },
};

export interface LoginResponse {
    success: boolean;
    user?: User;
    token?: string;
    error?: string;
}

export const auth = {
    // Store authentication token securely
    async setToken(token: string): Promise<void> {
        await storage.setItem(AUTH_TOKEN_KEY, token);
    },

    // Get stored authentication token
    async getToken(): Promise<string | null> {
        return await storage.getItem(AUTH_TOKEN_KEY);
    },

    // Store user data
    async setUser(user: User): Promise<void> {
        await storage.setItem(USER_DATA_KEY, JSON.stringify(user));
    },

    // Get stored user data
    async getUser(): Promise<User | null> {
        const userData = await storage.getItem(USER_DATA_KEY);
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch {
                return null;
            }
        }
        return null;
    },

    // Login function
    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/mobile/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: email, password }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
                await this.setToken(data.token);
                if (data.user) {
                    await this.setUser(data.user);
                }
                return { success: true, user: data.user, token: data.token };
            } else {
                return { success: false, error: data.error || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    },

    // Logout function
    async logout(): Promise<void> {
        await storage.removeItem(AUTH_TOKEN_KEY);
        await storage.removeItem(USER_DATA_KEY);
    },

    // Check if user is authenticated
    async isAuthenticated(): Promise<boolean> {
        const token = await this.getToken();
        return !!token;
    },

    // Refresh user session (call to validate token is still valid)
    async refreshSession(): Promise<User | null> {
        try {
            const token = await this.getToken();
            if (!token) return null;

            const response = await fetch(`${API_BASE_URL}/api/mobile/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const user = await response.json();
                await this.setUser(user);
                return user;
            } else {
                // Token is invalid, clear storage
                await this.logout();
                return null;
            }
        } catch (error) {
            console.error('Session refresh error:', error);
            return null;
        }
    },
};
