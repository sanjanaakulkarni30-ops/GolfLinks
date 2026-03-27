import { create } from 'zustand';
import api from '../utils/axiosUtil';

const useScoreStore = create((set, get) => ({
    scores: [],
    isLoading: false,

    fetchScores: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/scores');
            set({ scores: response.data, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: error.response?.data?.message };
        }
    },

    addScore: async (scoreData) => {
        try {
            const response = await api.post('/scores', scoreData);
            set({ scores: response.data });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    updateScore: async (scoreId, scoreData) => {
        try {
            const response = await api.put(`/scores/${scoreId}`, scoreData);
            set({ scores: response.data });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    },

    deleteScore: async (scoreId) => {
        try {
            const response = await api.delete(`/scores/${scoreId}`);
            set({ scores: response.data });
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message };
        }
    }
}));

export default useScoreStore;