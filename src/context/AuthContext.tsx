import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';

WebBrowser.maybeCompleteAuthSession();

// ⚠️ Configuração de IP para conexão com o Backend
import { Platform } from 'react-native';

const MACHINE_IP = '172.20.10.5'; // Seu IP atual detectado
export const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : `http://${MACHINE_IP}:5000`;

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
    if (!tokens) throw new Error('Não autenticado');

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
                    await SecureStore.setItemAsync('auth_tokens', JSON.stringify(newTokens));
                    setTokens(newTokens);

                    if (refreshData.user) {
                        await SecureStore.setItemAsync('user_data', JSON.stringify(refreshData.user));
                        setUser(refreshData.user);
                    }

                    // Retry original request with new token
                    headers.Authorization = `Bearer ${newTokens.token}`;
                    res = await fetch(url, { ...options, headers });
                } else {
                    // Refresh failed — logout
                    await SecureStore.deleteItemAsync('auth_tokens');
                    await SecureStore.deleteItemAsync('user_data');
                    setTokens(null);
                    setUser(null);
                    throw new Error('Sessão expirada. Faça login novamente.');
                }
            } catch (refreshError: any) {
                if (refreshError.message === 'Sessão expirada. Faça login novamente.') {
                    throw refreshError;
                }
                throw new Error('Erro ao renovar sessão');
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

            await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('Erro ao processar login Google:', error);
        } finally {
            setGoogleLoading(false);
        }
    };

    // Load stored user data on mount
    useEffect(() => {
        async function loadStoredData() {
            try {
                const storedUser = await SecureStore.getItemAsync('user_data');
                const storedTokens = await SecureStore.getItemAsync('auth_tokens');

                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch (e) {
                        console.error('Erro ao parsear storedUser');
                    }
                }
                if (storedTokens) {
                    try {
                        setTokens(JSON.parse(storedTokens));
                    } catch (e) {
                        console.error('Erro ao parsear storedTokens');
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar dados salvos:', error);
            } finally {
                setLoading(false);
                initialLoadDone.current = true;
            }
        }
        loadStoredData();
    }, []);

    // ─── Sign In ────────────────────────────────────────────
    const signIn = useCallback(async (email: string, password: string) => {
        const url = `${API_URL}/api/login`;
        try {
            setLoading(true);
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            }).catch(err => {
                throw new Error(`Erro de Conexão: Não foi possível alcançar ${url}. Verifique se o servidor está ligado e se o seu celular está no mesmo Wi-Fi que o seu PC.`);
            });

            let data: any = {};
            try {
                data = await res.json();
            } catch (jsonErr) {
                throw new Error('Resposta inválida do servidor (não é JSON).');
            }

            if (!res.ok) throw new Error(data.message || 'Erro ao entrar');

            const userData: User = data.user;
            const authTokens: AuthTokens = {
                token: data.token,
                refreshToken: data.refreshToken,
            };

            await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
            await SecureStore.setItemAsync('auth_tokens', JSON.stringify(authTokens));

            setTokens(authTokens);
            setUser(userData);
        } catch (error: any) {
            console.error('Login Error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── Sign Up ────────────────────────────────────────────
    const signUp = useCallback(async (name: string, email: string, password: string, phone?: string) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone }),
            });

            let data: any = {};
            try {
                data = await res.json();
            } catch (jsonErr) {
                throw new Error('Resposta inválida do servidor ao registrar.');
            }

            if (!res.ok) throw new Error(data.message || 'Erro ao registrar');

            const userData: User = data.user;
            const authTokens: AuthTokens = {
                token: data.token,
                refreshToken: data.refreshToken,
            };

            await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
            await SecureStore.setItemAsync('auth_tokens', JSON.stringify(authTokens));

            setTokens(authTokens);
            setUser(userData);
        } catch (error: any) {
            throw error;
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
            console.error('Falha ao abrir Google Auth:', error);
            setGoogleLoading(false);
        }
    }, [promptAsync]);

    // ─── Update Profile ─────────────────────────────────────
    const updateProfile = useCallback(async (data: Partial<User>) => {
        try {
            setLoading(true);
            const res = await authFetch(
                `${API_URL}/api/me`,
                {
                    method: 'PUT',
                    body: JSON.stringify(data),
                },
                tokens,
                setTokens,
                setUser,
            );
            const result = await res.json();

            if (!res.ok) throw new Error(result.message || 'Erro ao atualizar perfil');

            await SecureStore.setItemAsync('user_data', JSON.stringify(result.user));
            setUser(result.user);
        } catch (error: any) {
            throw error;
        } finally {
            setLoading(false);
        }
    }, [tokens]);

    // ─── Change Password ────────────────────────────────────
    const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
        try {
            setLoading(true);
            const res = await authFetch(
                `${API_URL}/api/me/password`,
                {
                    method: 'PUT',
                    body: JSON.stringify({ currentPassword, newPassword }),
                },
                tokens,
                setTokens,
                setUser,
            );
            const result = await res.json();

            if (!res.ok) throw new Error(result.message || 'Erro ao alterar senha');

            // After password change, logout
            await signOut();
        } catch (error: any) {
            throw error;
        } finally {
            setLoading(false);
        }
    }, [tokens]);

    // ─── Complete Onboarding ────────────────────────────────
    const completeOnboarding = useCallback(async (data: { profile_type: string; company_nif?: string; company_name?: string }) => {
        try {
            setLoading(true);
            const res = await authFetch(
                `${API_URL}/api/me/onboarding`,
                {
                    method: 'POST',
                    body: JSON.stringify(data),
                },
                tokens,
                setTokens,
                setUser,
            );
            const result = await res.json();

            if (!res.ok) throw new Error(result.message || 'Erro ao completar onboarding');

            await SecureStore.setItemAsync('user_data', JSON.stringify(result.user));
            setUser(result.user);
        } catch (error: any) {
            throw error;
        } finally {
            setLoading(false);
        }
    }, [tokens]);

    // ─── Sign Out ───────────────────────────────────────────
    const signOut = useCallback(async () => {
        try {
            const currentTokens = tokens;

            // 🛑 Immediate clear state (Termina a sessão imediatamente no App)
            setTokens(null);
            setUser(null);

            // 🔥 Async remove from storage (Pode demorar uns ms)
            SecureStore.deleteItemAsync('user_data').catch(() => { });
            SecureStore.deleteItemAsync('auth_tokens').catch(() => { });

            if (currentTokens?.refreshToken) {
                // background call (Opcional, não precisa de await se quisermos logout instantâneo)
                fetch(`${API_URL}/api/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentTokens.token}`
                    },
                    body: JSON.stringify({ refreshToken: currentTokens.refreshToken }),
                }).catch(() => { });
            }
        } catch (error) {
            console.error('Erro no logout persistente:', error);
        }
    }, [tokens]);

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
