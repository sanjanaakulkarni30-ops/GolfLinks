import { create } from 'zustand';
import api from '../utils/axiosUtil';

const useAdminStore = create((set, get) => ({
    // Dashboard Stats
    stats: {},

    // Users Management
    users: [],
    usersTotal: 0,
    usersCurrentPage: 1,
    usersTotalPages: 1,

    // Charities Management
    charities: [],
    charitiesTotal: 0,
    charitiesCurrentPage: 1,
    charitiesTotalPages: 1,

    // Draws Management
    draws: [],
    drawsTotal: 0,
    drawsCurrentPage: 1,
    drawsTotalPages: 1,
    drawSimulation: null,

    // Winners Management
    winners: [],
    winnersFilter: 'all',

    isLoading: false,

    // Dashboard Stats
    fetchDashboardStats: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/admin/dashboard');
            set({ stats: response.data, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: error.response?.data?.message };
        }
    },

    // Users Management
    fetchUsers: async (page = 1, search = '') => {
        set({ isLoading: true });
        try {
            const params = new URLSearchParams({ page, limit: 20 });
            if (search) params.append('search', search);

            const response = await api.get(`/admin/users?${params}`);
            set({
                users: response.data.users,
                usersTotal: response.data.total,
                usersCurrentPage: response.data.currentPage,
                usersTotalPages: response.data.totalPages,
                isLoading: false
            });
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: error.response?.data?.message };
        }
    },

    updateUserScores: async (userId, scores) => {
        try {
            await api.put(`/admin/users/${userId}/scores`, { scores });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    // Charities Management
    fetchCharities: async (page = 1) => {
        set({ isLoading: true });
        try {
            const response = await api.get(`/admin/charities?page=${page}&limit=20`);
            set({
                charities: response.data.charities,
                charitiesTotal: response.data.total,
                charitiesCurrentPage: response.data.currentPage,
                charitiesTotalPages: response.data.totalPages,
                isLoading: false
            });
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: error.response?.data?.message };
        }
    },

    createCharity: async (charityData) => {
        try {
            const response = await api.post('/admin/charities', charityData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    updateCharity: async (charityId, charityData) => {
        try {
            const response = await api.put(`/admin/charities/${charityId}`, charityData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    deleteCharity: async (charityId) => {
        try {
            await api.delete(`/admin/charities/${charityId}`);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    // Draws Management
    fetchDraws: async (page = 1) => {
        set({ isLoading: true });
        try {
            const response = await api.get(`/admin/draws?page=${page}&limit=10`);
            set({
                draws: response.data.draws,
                drawsTotal: response.data.total,
                drawsCurrentPage: response.data.currentPage,
                drawsTotalPages: response.data.totalPages,
                isLoading: false
            });
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: error.response?.data?.message };
        }
    },

    simulateDraw: async () => {
        try {
            const response = await api.post('/admin/draws/simulate');
            set({ drawSimulation: response.data });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    runDraw: async () => {
        try {
            const response = await api.post('/admin/draws/run');
            set({ drawSimulation: null });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    // Winners Management
    fetchWinners: async (status = 'all') => {
        set({ isLoading: true, winnersFilter: status });
        try {
            const response = await api.get(`/admin/winners?status=${status}`);
            set({ winners: response.data, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: error.response?.data?.message };
        }
    },

    verifyWinner: async (userId, winningId, status) => {
        try {
            await api.put(`/admin/winners/${userId}/${winningId}/verify`, { status });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    payWinner: async (userId, winningId) => {
        try {
            await api.put(`/admin/winners/${userId}/${winningId}/pay`);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    }
}));

export default useAdminStore;