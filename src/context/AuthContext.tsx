import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { storage } from '../lib/storage';

WebBrowser.maybeCompleteAuthSession();

// ⚠️ Configuração de IP para conexão com o Backend
import { Platform } from 'react-native';

const MACHINE_IP = '172.20.10.5'; // Seu IP atual detectado
const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;
export const API_URL =
    ENV_API_URL ||
    (Platform.OS === 'web'
        ? 'http://localhost:5000'
        : Platform.OS === 'android'
            ? 'http://10.0.2.2:5000'
            : `http://${MACHINE_IP}:5000`);

// Nota: Para iOS Simulator use 'http://localhost:5000'
// Se estiver usando Android físico, mude a lógica acima para sempre usar o MACHINE_IP.

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    photo?: string;
    profile_type?: string;
    company_nif?: string;
    company_name?: string;
    is_active?: number;
    onboarding_completed?: number;
    created_at?: string;
    updated_at?: string;
}

interface AuthTokens {
    token: string;
    refreshToken: string;
}

interface AuthContextData {
    user: User | null;
    googleLoading: boolean;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (name: string, email: string, password: string, phone?: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    completeOnboarding: (data: { profile_type: string; company_nif?: string; company_name?: string }) => Promise<void>;
    isAuthenticated: boolean;
    apiUrl: string;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

/**
 * Makes an authenticated API request, automatically refreshing tokens if expired.
 */
async function authFetch(
    url: string,
    options: RequestInit = {},
    tokens: AuthTokens | null,
    setTokens: (t: AuthTokens | null) => void,
    setUser: (u: User | null) => void,
): Promise<Response> {
    if (!tokens) throw new Error('Not authenticated');

    const headers: any = {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: `Bearer ${tokens.token}`,
    };

    let res = await fetch(url, { ...options, headers });

    // If token expired, try refresh
    if (res.status === 401) {
        let data: any = {};
        try {
            data = await res.json();
        } catch (e) { /* ignore fallback to refresh */ }

        if (data.code === 'TOKEN_EXPIRED' && tokens.refreshToken) {
            try {
                const refreshRes = await fetch(`${API_URL}/api/refresh-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
                });

                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    const newTokens: AuthTokens = {
                        token: refreshData.token,
                        refreshToken: refreshData.refreshToken,
                    };

                    // Save new tokens
                    await storage.setItem('auth_tokens', JSON.stringify(newTokens));
                    setTokens(newTokens);

                    if (refreshData.user) {
                        await storage.setItem('user_data', JSON.stringify(refreshData.user));
                        setUser(refreshData.user);
                    }

                    // Retry original request with new token
                    headers.Authorization = `Bearer ${newTokens.token}`;
                    res = await fetch(url, { ...options, headers });
                } else {
                    // Refresh failed — logout
                    await storage.deleteItem('auth_tokens');
                    await storage.deleteItem('user_data');
                    setTokens(null);
                    setUser(null);
                    throw new Error('Session expired. Please sign in again.');
                }
            } catch (refreshError: any) {
                if (refreshError.message === 'Session expired. Please sign in again.') {
                    throw refreshError;
                }
                throw new Error('Failed to refresh session');
            }
        }
    }

    return res;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [tokens, setTokens] = useState<AuthTokens | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const initialLoadDone = useRef(false);

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: 'SEU_ANDROID_CLIENT_ID.apps.googleusercontent.com',
        iosClientId: 'SEU_IOS_CLIENT_ID.apps.googleusercontent.com',
        webClientId: 'SEU_WEB_CLIENT_ID.apps.googleusercontent.com',
    });

    // Google auth response handler
    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                handleUserInfoFetch(authentication.accessToken);
            }
        } else {
            setGoogleLoading(false);
        }
    }, [response]);

    const handleUserInfoFetch = async (googleToken: string) => {
        try {
            setGoogleLoading(true);
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${googleToken}` },
            });
            const userInfo = await res.json();

            const userData: User = {
                id: userInfo.sub,
                name: userInfo.name,
                email: userInfo.email,
                photo: userInfo.picture,
            };

            await storage.setItem('user_data', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('Failed to process Google login:', error);
        } finally {
            setGoogleLoading(false);
        }
    };

    // Load stored user data on mount
    useEffect(() => {
        async function loadStoredData() {
            try {
                const storedUser = await storage.getItem('user_data');
                const storedTokens = await storage.getItem('auth_tokens');

                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch (e) {
                        console.error('Failed to parse stored user');
                    }
                }
                if (storedTokens) {
                    try {
                        setTokens(JSON.parse(storedTokens));
                    } catch (e) {
                        console.error('Failed to parse stored tokens');
                    }
                }
            } catch (error) {
                console.error('Failed to load saved data:', error);
            } finally {
                setLoading(false);
                initialLoadDone.current = true;
            }
        }
        loadStoredData();
    }, []);

    // ─── Sign In ────────────────────────────────────────────
    // Modo demonstração: qualquer email e senha são aceites.
    const signIn = useCallback(async (email: string, password: string) => {
        try {
            setLoading(true);
            const cleanEmail = email.trim() || 'demo@agricargas.ao';
            const userData: User = {
                id: `local-${Date.now()}`,
                name: cleanEmail.split('@')[0] || 'User',
                email: cleanEmail,
                onboarding_completed: 0,
            };
            const authTokens: AuthTokens = {
                token: 'local-token',
                refreshToken: '',
            };

            await storage.setItem('user_data', JSON.stringify(userData));
            await storage.setItem('auth_tokens', JSON.stringify(authTokens));

            setTokens(authTokens);
            setUser(userData);
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── Sign Up ────────────────────────────────────────────
    const signUp = useCallback(async (name: string, email: string, password: string, phone?: string) => {
        try {
            setLoading(true);
            const cleanEmail = email.trim() || 'demo@agricargas.ao';
            const userData: User = {
                id: `local-${Date.now()}`,
                name: name.trim() || cleanEmail.split('@')[0] || 'User',
                email: cleanEmail,
                phone,
                onboarding_completed: 0,
            };
            const authTokens: AuthTokens = {
                token: 'local-token',
                refreshToken: '',
            };

            await storage.setItem('user_data', JSON.stringify(userData));
            await storage.setItem('auth_tokens', JSON.stringify(authTokens));

            setTokens(authTokens);
            setUser(userData);
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── Sign In With Google ────────────────────────────────
    const signInWithGoogle = useCallback(async () => {
        setGoogleLoading(true);
        try {
            await promptAsync();
        } catch (error) {
            console.error('Failed to open Google Auth:', error);
            setGoogleLoading(false);
        }
    }, [promptAsync]);

    // ─── Update Profile ─────────────────────────────────────
    // Modo demonstração: os dados são guardados apenas localmente.
    const updateProfile = useCallback(async (data: Partial<User>) => {
        try {
            setLoading(true);
            if (!user) throw new Error('Not authenticated');

            const updatedUser: User = { ...user, ...data };
            await storage.setItem('user_data', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // ─── Change Password ────────────────────────────────────
    const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
        // Modo demonstração: qualquer senha é aceite, nada para alterar.
        void currentPassword;
        void newPassword;
    }, []);

    // ─── Complete Onboarding ────────────────────────────────
    // Modo demonstração: conclui sempre localmente, sem chamar o backend.
    const completeOnboarding = useCallback(async (data: { profile_type: string; company_nif?: string; company_name?: string }) => {
        try {
            setLoading(true);
            if (!user) throw new Error('Not authenticated');

            const updatedUser: User = {
                ...user,
                ...data,
                onboarding_completed: 1,
            };
            await storage.setItem('user_data', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // ─── Sign Out ───────────────────────────────────────────
    const signOut = useCallback(async () => {
        setTokens(null);
        setUser(null);

        storage.deleteItem('user_data').catch(() => { });
        storage.deleteItem('auth_tokens').catch(() => { });
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            googleLoading,
            loading,
            signIn,
            signUp,
            signInWithGoogle,
            signOut,
            updateProfile,
            changePassword,
            completeOnboarding,
            isAuthenticated: !!user,
            apiUrl: API_URL,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    return useContext(AuthContext);
}
