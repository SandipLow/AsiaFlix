export interface User {
    id: string;
    userName: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    dob: string;
    phone: string;
    address: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    subscribed: boolean;
    fetchUser: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string, dob: string, phone: string, address: string) => Promise<void>;
    logout: () => void;
    update: (userData: unknown) => Promise<void>;
    subscribe: () => Promise<void>;
}