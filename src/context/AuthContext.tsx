import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';

WebBrowser.maybeCompleteAuthSession();

const API_URL = 'http://localhost:5000'; // No Android Emulator use 'http://10.0.2.2:5000'

interface User {
    id: string;
    name: string;
    email: string;
    photo?: string;
    token?: string;
}

interface AuthContextData {
    user: User | null;
    googleLoading: boolean;
    loading: boolean;
    signIn: (email: string, password?: string) => Promise<void>;
    signUp: (name: string, email: string, password?: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: 'SEU_ANDROID_CLIENT_ID.apps.googleusercontent.com',
        iosClientId: 'SEU_IOS_CLIENT_ID.apps.googleusercontent.com',
        webClientId: 'SEU_WEB_CLIENT_ID.apps.googleusercontent.com',
    });

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

    const handleUserInfoFetch = async (token: string) => {
        try {
            setGoogleLoading(true);
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const userInfo = await res.json();

            const userData: User = {
                id: userInfo.sub,
                name: userInfo.name,
                email: userInfo.email,
                photo: userInfo.picture,
                token: token,
            };

            await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('Erro ao processar login Google:', error);
        } finally {
            setGoogleLoading(false);
        }
    };

    useEffect(() => {
        async function loadStoredData() {
            const storedUser = await SecureStore.getItemAsync('user_data');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
        loadStoredData();
    }, []);

    const signIn = async (email: string, password?: string) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Erro ao entrar');

            const userData: User = { ...data.user, token: data.token };
            await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
            setUser(userData);
        } catch (error: any) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (name: string, email: string, password?: string) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Erro ao registrar');

            const userData: User = { ...data.user, token: data.token };
            await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
            setUser(userData);
        } catch (error: any) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        setGoogleLoading(true);
        try {
            await promptAsync();
        } catch (error) {
            console.error('Falha ao abrir Google Auth:', error);
            setGoogleLoading(false);
        }
    };

    const signOut = async () => {
        await SecureStore.deleteItemAsync('user_data');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            googleLoading,
            loading,
            signIn,
            signUp,
            signInWithGoogle,
            signOut,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    return useContext(AuthContext);
}
