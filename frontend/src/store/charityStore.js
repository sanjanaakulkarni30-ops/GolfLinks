import { create } from 'zustand';
import api from '../utils/axiosUtil';

const useCharityStore = create((set, get) => ({
    charities: [],
    categories: [],
    featuredCharity: null,
    selectedCharity: null,
    donations: [],
    isLoading: false,

    fetchCharities: async (filters = {}) => {
        set({ isLoading: true });
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.category) params.append('category', filters.category);
            if (filters.featured) params.append('featured', 'true');

            const response = await api.get(`/charity?${params}`);
            set({ charities: response.data, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: error.response?.data?.message };
        }
    },

    fetchCategories: async () => {
        try {
            const response = await api.get('/charity/categories');
            set({ categories: response.data });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    fetchFeaturedCharity: async () => {
        try {
            const response = await api.get('/charity/featured');
            set({ featuredCharity: response.data });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    fetchCharityById: async (id) => {
        set({ isLoading: true });
        try {
            const response = await api.get(`/charity/${id}`);
            set({ selectedCharity: response.data, isLoading: false });
            return { success: true, data: response.data };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: error.response?.data?.message };
        }
    },

    selectCharity: async (charityId) => {
        try {
            await api.put('/user/charity', { charityId });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    makeDonation: async (charityId, amount) => {
        try {
            const response = await api.post('/charity/donate', { charityId, amount });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    fetchDonationHistory: async () => {
        try {
            const response = await api.get('/charity/donations/history');
            set({ donations: response.data });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    }
}));

export default useCharityStore;