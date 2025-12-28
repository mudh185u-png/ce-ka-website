import React, { createContext, useState, useEffect, useContext } from 'react';
import type { Product } from './ProductContext';

export interface CartItem extends Product {
    quantity: number;
    selectedImage: string;
    selectedSize?: { size: string; price: number };
    selectedFabric?: string;
    selectedLeg?: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number, options?: { selectedSize?: { size: string; price: number }, selectedFabric?: string, selectedLeg?: string }) => void;
    removeFromCart: (productId: number, index?: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    checkoutViaWhatsapp: () => void;
    isCartOpen: boolean;
    toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from local storage
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('ceka_cart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                if (Array.isArray(parsedCart)) {
                    setCart(parsedCart);
                }
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            localStorage.removeItem('ceka_cart');
        }
    }, []);

    // Save cart to local storage
    useEffect(() => {
        try {
            localStorage.setItem('ceka_cart', JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }, [cart]);

    const addToCart = (product: Product, quantity = 1, options?: { selectedSize?: { size: string; price: number }, selectedFabric?: string, selectedLeg?: string }) => {
        setCart(prev => {
            // Use selected size price if available, otherwise use product price
            const finalPrice = options?.selectedSize?.price || product.price;
            
            // Create a unique key for cart items based on product ID and selected options
            const itemKey = `${product.id}-${options?.selectedSize?.size || 'default'}-${options?.selectedFabric || 'default'}-${options?.selectedLeg || 'default'}`;
            
            const existing = prev.find(item => {
                const existingKey = `${item.id}-${item.selectedSize?.size || 'default'}-${item.selectedFabric || 'default'}-${item.selectedLeg || 'default'}`;
                return existingKey === itemKey;
            });
            
            if (existing) {
                return prev.map(item => {
                    const existingKey = `${item.id}-${item.selectedSize?.size || 'default'}-${item.selectedFabric || 'default'}-${item.selectedLeg || 'default'}`;
                    if (existingKey === itemKey) {
                        return { ...item, quantity: item.quantity + quantity };
                    }
                    return item;
                });
            }
            
            return [...prev, { 
                ...product, 
                price: finalPrice, // Use selected size price
                quantity, 
                selectedImage: product.images?.[0] || '',
                selectedSize: options?.selectedSize,
                selectedFabric: options?.selectedFabric,
                selectedLeg: options?.selectedLeg
            }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId: number, index?: number) => {
        if (index !== undefined) {
            // Remove specific item by index
            setCart(prev => prev.filter((_, i) => i !== index));
        } else {
            // Remove first matching item (backward compatibility)
            setCart(prev => {
                const itemIndex = prev.findIndex(item => item.id === productId);
                if (itemIndex !== -1) {
                    return prev.filter((_, i) => i !== itemIndex);
                }
                return prev;
            });
        }
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    const checkoutViaWhatsapp = () => {
        const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "905555555555";
        let message = "Merhaba, Ce & Ka Web Sitesinden sipariş vermek istiyorum:\n\n";

        cart.forEach(item => {
            let itemDetails = `${item.title.tr}`;
            if (item.selectedSize) {
                itemDetails += ` (${item.selectedSize.size})`;
            }
            if (item.selectedFabric) {
                itemDetails += ` - ${item.selectedFabric}`;
            }
            if (item.selectedLeg) {
                itemDetails += ` - ${item.selectedLeg}`;
            }
            message += `- ${itemDetails} x ${item.quantity} : ${item.price * item.quantity} TL\n`;
        });

        message += `\n*Toplam Tutar: ${cartTotal} TL*`;

        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, clearCart,
            cartTotal, cartCount, checkoutViaWhatsapp,
            isCartOpen, toggleCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
