import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    token: string;
}

interface AuthContextData {
    user: AdminUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const API_URL = '/api';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('admin_user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch { /* ignore */ }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Erro ao entrar');

            const adminUser: AdminUser = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role || 'user',
                token: data.token,
            };

            localStorage.setItem('admin_user', JSON.stringify(adminUser));
            setUser(adminUser);
        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Erro ao registar');

            const adminUser: AdminUser = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role || 'user',
                token: data.token,
            };

            localStorage.setItem('admin_user', JSON.stringify(adminUser));
            setUser(adminUser);
        } catch (error: any) {
            console.error('Register error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
