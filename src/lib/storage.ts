import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';

async function setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
        try {
            window.localStorage.setItem(key, value);
        } catch (e) {
            console.warn('storage.setItem falhou na web:', e);
        }
        return;
    }
    await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
    if (isWeb) {
        try {
            return window.localStorage.getItem(key);
        } catch (e) {
            console.warn('storage.getItem falhou na web:', e);
            return null;
        }
    }
    return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
    if (isWeb) {
        try {
            window.localStorage.removeItem(key);
        } catch (e) {
            console.warn('storage.deleteItem falhou na web:', e);
        }
        return;
    }
    await SecureStore.deleteItemAsync(key);
}

export const storage = { setItem, getItem, deleteItem };
