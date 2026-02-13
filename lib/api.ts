// API client for React Native
// This connects to the same backend as the web app

import axios, { AxiosInstance } from 'axios';
import { auth } from './auth';
import { API_BASE_URL } from './config';
import type { Battery, Drone, FlightLog, FlightPlan, Order, Pilot, Subcontractor, TeamMember } from './types';

// Create axios instance with base configuration
const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
    });

    // Add auth token to all requests
    client.interceptors.request.use(async (config) => {
        const token = await auth.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Handle response errors
    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            if (error.response?.status === 401) {
                // Token expired or invalid, logout user
                await auth.logout();
            }
            return Promise.reject(error);
        }
    );

    return client;
};

export const apiClient = createApiClient();

// ============================================
// DRONES API
// ============================================
export const dronesApi = {
    list: async (): Promise<Drone[]> => {
        const response = await apiClient.get('/api/mobile/drones');
        return response.data;
    },

    get: async (id: string): Promise<Drone> => {
        const response = await apiClient.get(`/api/mobile/drones/${id}`);
        return response.data;
    },

    create: async (data: Partial<Drone>): Promise<Drone> => {
        const response = await apiClient.post('/api/mobile/drones', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Drone>): Promise<Drone> => {
        const response = await apiClient.put(`/api/mobile/drones/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/mobile/drones/${id}`);
    },
};

// ============================================
// TEAM API
// ============================================
export const teamApi = {
    list: async (): Promise<TeamMember[]> => {
        const response = await apiClient.get('/api/mobile/team');
        return response.data;
    },

    create: async (data: Partial<TeamMember>): Promise<TeamMember> => {
        const response = await apiClient.post('/api/mobile/team', data);
        return response.data;
    },

    update: async (id: string, data: Partial<TeamMember>): Promise<TeamMember> => {
        const response = await apiClient.put(`/api/mobile/team/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/mobile/team/${id}`);
    },
};

// ============================================
// SUBCONTRACTORS API
// ============================================
export const subcontractorsApi = {
    list: async (): Promise<Subcontractor[]> => {
        const response = await apiClient.get('/api/mobile/subcontractors');
        return response.data;
    },

    create: async (data: Partial<Subcontractor>): Promise<Subcontractor> => {
        const response = await apiClient.post('/api/mobile/subcontractors', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Subcontractor>): Promise<Subcontractor> => {
        const response = await apiClient.put(`/api/mobile/subcontractors/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/mobile/subcontractors/${id}`);
    },
};

// ============================================
// BATTERIES API
// ============================================
export const batteriesApi = {
    list: async (): Promise<Battery[]> => {
        const response = await apiClient.get('/api/mobile/batteries');
        return response.data;
    },

    create: async (data: Partial<Battery>): Promise<Battery> => {
        const response = await apiClient.post('/api/mobile/batteries', data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/mobile/batteries/${id}`);
    },
};

// ============================================
// ORDERS API
// ============================================
export const ordersApi = {
    list: async (): Promise<Order[]> => {
        const response = await apiClient.get('/api/mobile/orders');
        return response.data;
    },

    get: async (id: string): Promise<Order> => {
        const response = await apiClient.get(`/api/mobile/orders/${id}`);
        return response.data;
    },

    create: async (data: Partial<Order>): Promise<Order> => {
        const response = await apiClient.post('/api/mobile/orders', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Order>): Promise<Order> => {
        const response = await apiClient.put(`/api/mobile/orders/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/mobile/orders/${id}`);
    },
};

// ============================================
// PILOTS API
// ============================================
export const pilotsApi = {
    list: async (): Promise<Pilot[]> => {
        const response = await apiClient.get('/api/pilots');
        return response.data;
    },

    get: async (id: string): Promise<Pilot> => {
        const response = await apiClient.get(`/api/pilots/${id}`);
        return response.data;
    },

    create: async (data: Partial<Pilot>): Promise<Pilot> => {
        const response = await apiClient.post('/api/pilots', data);
        return response.data;
    },
};

// ============================================
// FLIGHTS API
// ============================================
export const flightsApi = {
    list: async (): Promise<FlightLog[]> => {
        const response = await apiClient.get('/api/mobile/flights');
        return response.data;
    },

    get: async (id: string): Promise<FlightLog> => {
        const response = await apiClient.get(`/api/mobile/flights/${id}`);
        return response.data;
    },

    create: async (data: Partial<FlightLog>): Promise<FlightLog> => {
        const response = await apiClient.post('/api/mobile/flights', data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/mobile/flights/${id}`);
    },

    // Legacy/Mock methods for plans
    listPlans: async (): Promise<FlightPlan[]> => {
        const response = await apiClient.get('/api/flights');
        return response.data;
    },
};
