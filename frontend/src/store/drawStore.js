import { create } from 'zustand';
import api from '../utils/axiosUtil';

const useDrawStore = create((set, get) => ({
    currentDraw: null,
    drawHistory: [],
    myNumbers: null,
    myWinnings: [],
    stats: {},
    isLoading: false,

    fetchCurrentDraw: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/draw/current');
            set({ currentDraw: response.data, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: error.response?.data?.message };
        }
    },

    fetchDrawHistory: async (page = 1, limit = 10) => {
        try {
            const response = await api.get(`/draw/history?page=${page}&limit=${limit}`);
            set({ drawHistory: response.data.draws || [] });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    fetchMyNumbers: async () => {
        try {
            const response = await api.get('/draw/my-numbers');
            set({ myNumbers: response.data });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    fetchMyWinnings: async () => {
        try {
            const response = await api.get('/draw/my-winnings');
            set({ myWinnings: response.data });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    fetchDrawStats: async () => {
        try {
            const response = await api.get('/draw/stats');
            set({ stats: response.data });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    submitProof: async (winningId, file) => {
        try {
            const formData = new FormData();
            formData.append('proof', file);

            const response = await api.post(`/draw/submit-proof/${winningId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update local winnings
            const updatedWinnings = get().myWinnings.map(w =>
                w._id === winningId ? { ...w, status: 'pending', proofImage: response.data.winning.proofImage } : w
            );
            set({ myWinnings: updatedWinnings });

            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    }
}));

export default useDrawStore;