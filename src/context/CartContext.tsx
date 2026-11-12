import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { storage } from '../lib/storage';

export interface CartItem {
    id: string;
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    unit?: string;
}

interface CartContextData {
    items: CartItem[];
    addToCart: (product: any, quantity?: number) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalPrice: number;
    totalItems: number;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const loadCart = async () => {
            const storedCart = await storage.getItem('cart_items');
            if (storedCart) {
                setItems(JSON.parse(storedCart));
            }
        };
        loadCart();
    }, []);

    useEffect(() => {
        storage.setItem('cart_items', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: any, quantity: number = 1) => {
        setItems(prev => {
            const existing = prev.find(item => item.product_id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, {
                id: `cart-${Date.now()}-${product.id}`,
                product_id: product.id,
                name: product.name,
                price: product.price,
                quantity,
                image: product.image,
                unit: product.unit || 'un'
            }];
        });
    };

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalPrice = useMemo(() => items.reduce((acc, item) => acc + (item.price * item.quantity), 0), [items]);
    const totalItems = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalPrice,
            totalItems
        }}>
            {children}
        </CartContext.Provider>
    );
};

export function useCart() {
    return useContext(CartContext);
}
