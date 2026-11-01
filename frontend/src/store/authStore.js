import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, userAPI } from '../services/api.js';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setLoading: (val) => set({ isLoading: val }),
      setError: (err) => set({ error: err }),
      clearError: () => set({ error: null }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.login({ email, password });
          const { token, ...user } = data.data;
          localStorage.setItem('gpa_token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      register: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authAPI.register(formData);
          const { token, ...user } = data.data;
          localStorage.setItem('gpa_token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      logout: async () => {
        try { await authAPI.logout(); } catch {}
        localStorage.removeItem('gpa_token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      refreshUser: async () => {
        try {
          const { data } = await authAPI.getMe();
          set({ user: data.data, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },

      updateProfile: async (updates) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await userAPI.updateProfile(updates);
          set({ user: { ...get().user, ...data.data }, isLoading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Update failed';
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      }
    }),
    {
      name: 'gpa-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
