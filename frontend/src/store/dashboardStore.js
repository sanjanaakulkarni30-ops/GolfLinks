import { create } from 'zustand';
import api from '../utils/axiosUtil';

const useDashboardStore = create((set, get) => ({
    dashboardData: null,
    isLoading: false,

    fetchDashboardData: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/user/dashboard');
            set({ dashboardData: response.data, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: error.response?.data?.message };
        }
    },

    updateCharityContribution: async (percentage) => {
        try {
            await api.put('/user/profile', { charityContribution: percentage });
            const currentData = get().dashboardData;
            if (currentData) {
                set({
                    dashboardData: {
                        ...currentData,
                        charityContribution: percentage
                    }
                });
            }
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    }
}));

export default useDashboardStore;