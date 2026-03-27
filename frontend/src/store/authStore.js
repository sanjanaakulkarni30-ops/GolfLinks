import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/axiosUtil';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/login', { email, password });
                    const { token, user } = response.data;

                    localStorage.setItem('token', token);
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    set({ user, token, isLoading: false });
                    return { success: true };
                } catch (error) {
                    set({ isLoading: false });
                    return {
                        success: false,
                        message: error.response?.data?.message || 'Login failed'
                    };
                }
            },

            register: async (userData) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/register', userData);
                    const { token, user } = response.data;

                    localStorage.setItem('token', token);
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                    set({ user, token, isLoading: false });
                    return { success: true };
                } catch (error) {
                    set({ isLoading: false });
                    return {
                        success: false,
                        message: error.response?.data?.message || 'Registration failed'
                    };
                }
            },

            logout: () => {
                localStorage.removeItem('token');
                delete api.defaults.headers.common['Authorization'];
                set({ user: null, token: null });
            },

            updateUser: (userData) => {
                set({ user: { ...get().user, ...userData } });
            },

            initializeAuth: () => {
                const token = localStorage.getItem('token');
                if (token) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    set({ token });

                    // Fetch profile if we have a token but no user
                    const currentState = get();
                    if (!currentState.user) {
                        currentState.fetchProfile();
                    }
                }
            },

            fetchProfile: async () => {
                try {
                    const response = await api.get('/user/profile');
                    set({ user: response.data });
                    return { success: true };
                } catch (error) {
                    return { success: false, message: error.response?.data?.message };
                }
            },

            updateProfile: async (profileData) => {
                try {
                    const response = await api.put('/user/profile', profileData);
                    set({ user: response.data });
                    return { success: true };
                } catch (error) {
                    return { success: false, message: error.response?.data?.message };
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ token: state.token, user: state.user })
        }
    )
);

export default useAuthStore;