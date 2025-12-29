import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from './ProductContext';
import { useToast } from '../components/Toast';
import { useTranslation } from 'react-i18next';

interface WishlistContextType {
    wishlist: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: number) => void;
    isInWishlist: (productId: number) => boolean;
    toggleWishlist: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [wishlist, setWishlist] = useState<Product[]>(() => {
        const saved = localStorage.getItem('wishlist');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse wishlist', e);
            }
        }
        return [];
    });

    // Save to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const addToWishlist = (product: Product) => {
        if (!wishlist.find(item => item.id === product.id)) {
            setWishlist(prev => [...prev, product]);
            showToast(t('wishlist.added'), 'success');
        }
    };

    const removeFromWishlist = (productId: number) => {
        setWishlist(prev => prev.filter(item => item.id !== productId));
        showToast(t('wishlist.removed'), 'info');
    };

    const isInWishlist = (productId: number) => {
        return wishlist.some(item => item.id === productId);
    };

    const toggleWishlist = (product: Product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
