import { create } from 'zustand';
import { AuthState } from '../types/auth';
import { persist } from 'zustand/middleware';

const API_URL = (import.meta.env.VITE_API_URL ??  'http://localhost:3000') as string;


export const useAuthStore = create(persist<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    subscribed: false,

    fetchUser: async () => {
        try {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                set({ user: null, isAuthenticated: false, loading: false });
                return;
            }

            const response = await fetch(`${API_URL}/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch user');

            const user = await response.json();
            set({ user, isAuthenticated: true, loading: false });
        } catch (error) {
            console.error(error);
            set({ user: null, isAuthenticated: false, loading: false });
        }
    },

    login: async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/user/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) throw new Error('Login failed');

            const { token, user } = await response.json();
            localStorage.setItem('auth-token', token);

            set({ token, user, isAuthenticated: true });
        } catch (error) {
            console.error(error);
            throw new Error('Login failed');
        }
    },

    signup: async (userName: string, email: string, password: string, dob: string, phone: string, address: string) => {
        try {
            const response = await fetch(`${API_URL}/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName, email, password, dob, phone, address }),
            });

            if (!response.ok) throw new Error('Signup failed');

            const { token, user } = await response.json();
            localStorage.setItem('auth-token', token);

            set({ token, user, isAuthenticated: true });
        } catch (error) {
            console.error(error);
            throw new Error('Signup failed');
        }
    },

    logout: () => {
        localStorage.removeItem('auth-token');
        set({ token: null, user: null, isAuthenticated: false });
    },
    
    update: async (userData: unknown) => {
        try {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                set({ user: null, isAuthenticated: false, loading: false });
                return;
            }

            const response = await fetch(`${API_URL}/user`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) throw new Error('Failed to update user');

            const user = await response.json();
            set({ user });
        } catch (error) {
            console.error(error)
        }
    },

    async subscribe() {
        set((state) => ({ subscribed: !state.subscribed }));
    }
}), {
    name: 'auth-storage',
}));
