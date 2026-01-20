import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService, Cart, CartItem } from '../services/cartService';
import { useAuth } from './AuthContext';
import { Product } from '../services/productService';
import { Alert } from 'react-native';

interface CartContextType {
    cart: Cart | null;
    loading: boolean;
    addToCart: (product: Product, quantity?: number, options?: { color?: string, storage?: string }) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadCart(user.uid);
        } else {
            setCart(null);
        }
    }, [user]);

    const loadCart = async (userId: string) => {
        setLoading(true);
        const res = await cartService.getCart(userId);
        if (res.success && res.cart) {
            setCart(res.cart);
        }
        setLoading(false);
    };

    const refreshCart = async () => {
        if (user) {
            await loadCart(user.uid);
        }
    };

    const addToCart = async (product: Product, quantity: number = 1, options?: { color?: string, storage?: string }) => {
        if (!user) {
            // Support guest cart for better UX
            const cartItem: CartItem = {
                id: `${product.id}_${options?.color || 'def'}_${options?.storage || 'def'}`,
                productId: product.id,
                name: product.name,
                brand: product.brand,
                thumbnail: product.thumbnail,
                price: product.price,
                originalPrice: product.originalPrice || product.price,
                quantity,
                selectedColor: options?.color,
                selectedStorage: options?.storage
            };

            setCart(prev => {
                const currentItems = prev?.items || [];
                const existingIndex = currentItems.findIndex(i => i.id === cartItem.id);
                let updatedItems;

                if (existingIndex >= 0) {
                    updatedItems = [...currentItems];
                    updatedItems[existingIndex].quantity += quantity;
                } else {
                    updatedItems = [...currentItems, cartItem];
                }

                const total = updatedItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
                const itemCount = updatedItems.reduce((acc, i) => acc + i.quantity, 0);

                return {
                    id: 'guest',
                    userId: 'guest',
                    items: updatedItems,
                    total,
                    itemCount,
                    createdAt: prev?.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
            });
            return;
        }

        try {
            const res = await cartService.addToCart(user.uid, product, quantity, options);
            if (res.success && res.cart) {
                setCart(res.cart);
            } else {
                Alert.alert('Lỗi', res.error || 'Không thể thêm vào giỏ hàng');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi thêm vào giỏ hàng');
        }
    };

    const removeFromCart = async (itemId: string) => {
        if (!user) {
            setCart(prev => {
                if (!prev) return null;
                const updatedItems = prev.items.filter(i => i.id !== itemId);
                const total = updatedItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
                const itemCount = updatedItems.reduce((acc, i) => acc + i.quantity, 0);
                return { ...prev, items: updatedItems, total, itemCount, updatedAt: new Date().toISOString() };
            });
            return;
        }
        const res = await cartService.removeFromCart(user.uid, itemId);
        if (res.success && res.cart) {
            setCart(res.cart);
        }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        if (!user) {
            setCart(prev => {
                if (!prev) return null;
                const updatedItems = prev.items.map(i => i.id === itemId ? { ...i, quantity: Math.max(0, quantity) } : i).filter(i => i.quantity > 0);
                const total = updatedItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
                const itemCount = updatedItems.reduce((acc, i) => acc + i.quantity, 0);
                return { ...prev, items: updatedItems, total, itemCount, updatedAt: new Date().toISOString() };
            });
            return;
        }
        const res = await cartService.updateCartItem(user.uid, itemId, quantity);
        if (res.success && res.cart) {
            setCart(res.cart);
        }
    };

    const clearCart = async () => {
        if (!user) {
            setCart(null);
            return;
        }
        const res = await cartService.clearCart(user.uid);
        if (res.success && res.cart) {
            setCart(res.cart);
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            loading,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            refreshCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
