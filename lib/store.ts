// Zustand stores for React Native
// These mirror the web app's state management

import { create } from 'zustand';
import { apiClient, batteriesApi, dronesApi, inventoryApi, ordersApi, subcontractorsApi, teamApi } from './api';
import { auth } from './auth';
import type { Battery, Drone, FlightLog, InventoryComponent, InventoryTransaction, ManufacturedUnit, Order, Subcontractor, TeamMember, User } from './types';

// ============================================
// AUTH STORE
// ============================================
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (user: User) => void;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setAuth: (user) => {
        set({ user, isAuthenticated: true, isLoading: false });
    },

    logout: async () => {
        await auth.logout();
        set({ user: null, isAuthenticated: false, isLoading: false });
    },

    checkAuth: async () => {
        set({ isLoading: true });
        const user = await auth.getUser();
        if (user) {
            set({ user, isAuthenticated: true, isLoading: false });
        } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    updateUser: (updates) => {
        set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null
        }));
    },
}));

// ============================================
// COMPLIANCE STORE (Main Data Store)
// ============================================
interface ComplianceState {
    drones: Drone[];
    teamMembers: TeamMember[];
    subcontractors: Subcontractor[];
    batteries: Battery[];
    orders: Order[];
    flightLogs: FlightLog[];
    components: InventoryComponent[];
    inventoryTransactions: InventoryTransaction[];
    loading: boolean;
    error: string | null;

    // Fetch actions
    fetchDrones: () => Promise<void>;
    fetchTeamMembers: () => Promise<void>;
    fetchSubcontractors: () => Promise<void>;
    fetchBatteries: () => Promise<void>;
    fetchOrders: () => Promise<void>;
    fetchFlightLogs: () => Promise<void>;
    fetchInventory: (search?: string) => Promise<void>;
    fetchAll: () => Promise<void>;

    // Drone actions
    addDrone: (drone: Partial<Drone>) => Promise<void>;
    updateDrone: (id: string, updates: Partial<Drone>) => Promise<void>;
    deleteDrone: (id: string) => Promise<void>;

    // Team actions
    addTeamMember: (member: Partial<TeamMember>) => Promise<void>;
    updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
    deleteTeamMember: (id: string) => Promise<void>;

    // Subcontractor actions
    addSubcontractor: (sub: Partial<Subcontractor>) => Promise<void>;
    updateSubcontractor: (id: string, updates: Partial<Subcontractor>) => Promise<void>;
    deleteSubcontractor: (id: string) => Promise<void>;

    // Battery actions
    addBattery: (battery: Partial<Battery>) => Promise<void>;
    deleteBattery: (id: string) => Promise<void>;

    // Order actions
    addOrder: (order: Partial<Order>) => Promise<void>;
    updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
    deleteOrder: (id: string) => Promise<void>;

    // FlightLog actions
    addFlightLog: (log: Partial<FlightLog>) => Promise<void>;
    deleteFlightLog: (id: string) => Promise<void>;

    // Inventory actions
    addInventoryTransaction: (data: any) => Promise<void>;
    addComponentType: (data: any) => Promise<void>;

    // Compliance actions
    updateDroneUploads: (droneId: string, uploadType: string, files: string | string[], label?: string) => Promise<void>;
    assignAccountableManager: (droneId: string, managerId: string) => Promise<void>;
    updateWebPortal: (droneId: string, link: string) => Promise<void>;
    updateManufacturedUnits: (droneId: string, units: ManufacturedUnit[]) => Promise<void>;
    updateRecurringData: (droneId: string, data: any) => Promise<void>;
    calculateCompliance: () => number;
    // Clear error
    clearError: () => void;
}

export const useComplianceStore = create<ComplianceState>((set, get) => ({
    drones: [],
    teamMembers: [],
    subcontractors: [],
    batteries: [],
    orders: [],
    flightLogs: [],
    components: [],
    inventoryTransactions: [],
    loading: false,
    error: null,

    // Fetch all data at once
    fetchAll: async () => {
        set({ loading: true, error: null });
        try {
            await Promise.all([
                get().fetchDrones(),
                get().fetchTeamMembers(),
                get().fetchSubcontractors(),
                get().fetchBatteries(),
                get().fetchOrders(),
                get().fetchFlightLogs(),
                get().fetchInventory(),
            ]);
        } catch (error) {
            set({ error: 'Failed to fetch data' });
        } finally {
            set({ loading: false });
        }
    },

    // Fetch drones
    fetchDrones: async () => {
        try {
            const drones = await dronesApi.list();
            set({ drones });
        } catch (error) {
            console.error('Failed to fetch drones:', error);
        }
    },

    // Fetch team members
    fetchTeamMembers: async () => {
        try {
            const teamMembers = await teamApi.list();
            set({ teamMembers });
        } catch (error) {
            console.error('Failed to fetch team members:', error);
        }
    },

    // Fetch subcontractors
    fetchSubcontractors: async () => {
        try {
            const subcontractors = await subcontractorsApi.list();
            set({ subcontractors });
        } catch (error) {
            console.error('Failed to fetch subcontractors:', error);
        }
    },

    // Fetch batteries
    fetchBatteries: async () => {
        try {
            const batteries = await batteriesApi.list();
            set({ batteries });
        } catch (error) {
            console.error('Failed to fetch batteries:', error);
        }
    },

    // Fetch orders
    fetchOrders: async () => {
        try {
            const orders = await ordersApi.list();
            set({ orders });
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    },

    // Fetch flight logs
    fetchFlightLogs: async () => {
        try {
            const { flightsApi } = await import('./api');
            const flightLogs = await flightsApi.list();
            set({ flightLogs });
        } catch (error) {
            console.error('Failed to fetch flight logs:', error);
        }
    },

    // Fetch inventory
    fetchInventory: async (search) => {
        try {
            const [components, inventoryTransactions] = await Promise.all([
                inventoryApi.listComponents(),
                inventoryApi.listTransactions(search)
            ]);
            set({ components, inventoryTransactions });
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
        }
    },

    // Drone CRUD
    addDrone: async (drone) => {
        try {
            const newDrone = await dronesApi.create(drone);
            set((state) => ({ drones: [newDrone, ...state.drones] }));
        } catch (error) {
            console.error('Failed to add drone:', error);
            throw error;
        }
    },

    updateDrone: async (id, updates) => {
        try {
            const updatedDrone = await dronesApi.update(id, updates);
            set((state) => ({
                drones: state.drones.map((d) => (d.id === id ? updatedDrone : d)),
            }));
        } catch (error) {
            console.error('Failed to update drone:', error);
            throw error;
        }
    },

    deleteDrone: async (id) => {
        try {
            await dronesApi.delete(id);
            set((state) => ({ drones: state.drones.filter((d) => d.id !== id) }));
        } catch (error) {
            console.error('Failed to delete drone:', error);
            throw error;
        }
    },

    // Team CRUD
    addTeamMember: async (member) => {
        try {
            const newMember = await teamApi.create(member);
            set((state) => ({ teamMembers: [newMember, ...state.teamMembers] }));
        } catch (error) {
            console.error('Failed to add team member:', error);
            throw error;
        }
    },

    updateTeamMember: async (id, updates) => {
        try {
            const updatedMember = await teamApi.update(id, updates);
            set((state) => ({
                teamMembers: state.teamMembers.map((m) => (m.id === id ? updatedMember : m)),
            }));
        } catch (error) {
            console.error('Failed to update team member:', error);
            throw error;
        }
    },

    deleteTeamMember: async (id) => {
        try {
            await teamApi.delete(id);
            set((state) => ({ teamMembers: state.teamMembers.filter((m) => m.id !== id) }));
        } catch (error) {
            console.error('Failed to delete team member:', error);
            throw error;
        }
    },

    // Subcontractor CRUD
    addSubcontractor: async (sub) => {
        try {
            const newSub = await subcontractorsApi.create(sub);
            set((state) => ({ subcontractors: [newSub, ...state.subcontractors] }));
        } catch (error) {
            console.error('Failed to add subcontractor:', error);
            throw error;
        }
    },

    updateSubcontractor: async (id, updates) => {
        try {
            const updatedSub = await subcontractorsApi.update(id, updates);
            set((state) => ({
                subcontractors: state.subcontractors.map((s) => (s.id === id ? updatedSub : s)),
            }));
        } catch (error) {
            console.error('Failed to update subcontractor:', error);
            throw error;
        }
    },

    deleteSubcontractor: async (id) => {
        try {
            await subcontractorsApi.delete(id);
            set((state) => ({ subcontractors: state.subcontractors.filter((s) => s.id !== id) }));
        } catch (error) {
            console.error('Failed to delete subcontractor:', error);
            throw error;
        }
    },

    // Battery CRUD
    addBattery: async (battery) => {
        try {
            const newBattery = await batteriesApi.create(battery);
            set((state) => ({ batteries: [newBattery, ...state.batteries] }));
        } catch (error) {
            console.error('Failed to add battery:', error);
            throw error;
        }
    },

    deleteBattery: async (id) => {
        try {
            await batteriesApi.delete(id);
            set((state) => ({ batteries: state.batteries.filter((b) => b.id !== id) }));
        } catch (error) {
            console.error('Failed to delete battery:', error);
            throw error;
        }
    },

    // Order CRUD
    addOrder: async (order) => {
        try {
            const newOrder = await ordersApi.create(order);
            set((state) => ({ orders: [newOrder, ...state.orders] }));
        } catch (error) {
            console.error('Failed to add order:', error);
            throw error;
        }
    },

    updateOrder: async (id, updates) => {
        try {
            const updatedOrder = await ordersApi.update(id, updates);
            set((state) => ({
                orders: state.orders.map((o) => (o.id === id ? updatedOrder : o)),
            }));
        } catch (error) {
            console.error('Failed to update order:', error);
            throw error;
        }
    },

    deleteOrder: async (id) => {
        try {
            await ordersApi.delete(id);
            set((state) => ({ orders: state.orders.filter((o) => o.id !== id) }));
        } catch (error) {
            console.error('Failed to delete order:', error);
            throw error;
        }
    },

    deleteFlightLog: async (id) => {
        try {
            const { flightsApi } = await import('./api');
            await flightsApi.delete(id);
            set((state) => ({ flightLogs: state.flightLogs.filter((f) => f.id !== id) }));
        } catch (error) {
            console.error('Failed to delete flight log:', error);
            throw error;
        }
    },

    addFlightLog: async (log) => {
        try {
            const { flightsApi } = await import('./api');
            const newLog = await flightsApi.create(log);
            set((state) => ({ flightLogs: [newLog, ...state.flightLogs] }));
        } catch (error) {
            console.error('Failed to add flight log:', error);
            throw error;
        }
    },

    // Inventory actions
    addInventoryTransaction: async (data) => {
        try {
            await inventoryApi.createTransaction(data);
            await get().fetchInventory();
        } catch (error) {
            console.error('Failed to add transaction:', error);
            throw error;
        }
    },

    addComponentType: async (data) => {
        try {
            await inventoryApi.createComponent(data);
            await get().fetchInventory();
        } catch (error) {
            console.error('Failed to add component:', error);
            throw error;
        }
    },

    // Compliance Actions Implementation
    updateDroneUploads: async (droneId, uploadType, files, label) => {
        try {
            await apiClient.post(`/api/mobile/drones/${droneId}/uploads`, {
                uploadType,
                files: Array.isArray(files) ? files : [files],
                label
            });
            await get().fetchDrones();
        } catch (error) {
            console.error('Failed to update drone uploads:', error);
        }
    },

    assignAccountableManager: async (droneId, managerId) => {
        try {
            await dronesApi.update(droneId, { accountableManagerId: managerId });
            set((state) => ({
                drones: state.drones.map((d) =>
                    d.id === droneId ? { ...d, accountableManagerId: managerId } : d
                )
            }));
        } catch (error) {
            console.error('Failed to assign manager:', error);
        }
    },

    updateWebPortal: async (droneId, link) => {
        try {
            await dronesApi.update(droneId, { webPortalLink: link } as any);
            set((state) => ({
                drones: state.drones.map((d) =>
                    d.id === droneId ? { ...d, uploads: { ...d.uploads, webPortalLink: link } } : d
                )
            }));
        } catch (error) {
            console.error('Failed to update web portal:', error);
        }
    },

    updateManufacturedUnits: async (droneId, units) => {
        try {
            await dronesApi.update(droneId, { manufacturedUnits: units } as any);
            set((state) => ({
                drones: state.drones.map((d) =>
                    d.id === droneId ? { ...d, manufacturedUnits: units } : d
                )
            }));
        } catch (error) {
            console.error('Failed to update manufactured units:', error);
        }
    },

    updateRecurringData: async (droneId, data) => {
        try {
            const drone = get().drones.find(d => d.id === droneId);
            const currentData = (drone as any)?.recurringData || {};
            const newData = { ...currentData, ...data };

            await dronesApi.update(droneId, { recurringData: newData } as any);
            set((state) => ({
                drones: state.drones.map((d) =>
                    d.id === droneId ? { ...d, recurringData: newData } : d
                )
            }));
        } catch (error) {
            console.error('Failed to update recurring data:', error);
        }
    },

    calculateCompliance: () => {
        const { drones } = get();
        if (drones.length === 0) return 0;
        const itemsWithManager = drones.filter(d => d.accountableManagerId).length;
        return Math.round((itemsWithManager / drones.length) * 100);
    },

    clearError: () => set({ error: null }),
}));
