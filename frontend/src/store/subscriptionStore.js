import { create } from 'zustand';
import api from '../utils/axiosUtil';

const useSubscriptionStore = create((set, get) => ({
    plans: [],
    currentSubscription: null,
    isLoading: false,

    fetchPlans: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/subscription/plans');
            set({ plans: response.data.plans, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: error.response?.data?.message };
        }
    },

    fetchSubscriptionStatus: async () => {
        try {
            const response = await api.get('/subscription/status');
            if (response.data.hasSubscription) {
                set({ currentSubscription: response.data.subscription });
            }
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    createSubscription: async (plan) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/subscription/create', { plan: plan.id });
            set({ isLoading: false });
            return { success: true, data: response.data };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: error.response?.data?.message };
        }
    },

    cancelSubscription: async () => {
        try {
            await api.post('/subscription/cancel');
            const updatedSub = { ...get().currentSubscription, cancelAtPeriodEnd: true };
            set({ currentSubscription: updatedSub });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    }
}));

export default useSubscriptionStore;