import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '../supabase';
import type { User, AuthError } from '@supabase/supabase-js';

export interface Product {
    id: number;
    images: string[];
    price: number;
    category: 'yatak' | 'baza' | 'baslik' | 'set' | 'tekstil' | 'bebek' | 'outlet';
    title: {
        tr: string;
        ar: string;
        en: string;
    };
    description: {
        tr: string;
        ar: string;
        en: string;
    };
    variants?: { size: string; price: number }[] | null;
    fabrics?: string[] | null;
    legs?: string[] | null;
    discountPrice: number | null;
    badge: 'new' | 'sale' | 'bestseller' | null;
    sku?: string | null;
}

export interface Order {
    id: number;
    user_id: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    customer_address: string;
    total_amount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    invoice_url?: string;
    created_at: string;
    items?: OrderItem[];
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    product_sku?: string;
    product_title: { tr: string; ar: string; en: string };
    quantity: number;
    unit_price: number;
    variant_size?: string;
    fabric?: string;
    leg?: string;
}

interface ProductContextType {
    products: Product[];
    loading: boolean;
    addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    updateProduct: (id: number, updatedProduct: Partial<Product>) => Promise<void>;
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    register: (email: string, password: string, profile: { full_name: string; phone: string; address: string }) => Promise<{ error: AuthError | null }>;
    logout: () => Promise<void>;
    createOrder: (order: Omit<Order, 'id' | 'created_at' | 'user_id'>, items: Omit<OrderItem, 'id' | 'order_id'>[]) => Promise<void>;
    getUserOrders: () => Promise<Order[]>;
    getAllOrders: () => Promise<Order[]>;
    updateOrderStatus: (orderId: number, status: Order['status']) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
        } else {
            // Ensure proper data transformation for variants, fabrics, and legs
            const transformedProducts: Product[] = (data || []).map((product) => {
                const rawProduct = product as Record<string, unknown>;
                return {
                    id: rawProduct.id as number,
                    price: rawProduct.price as number,
                    category: rawProduct.category as Product['category'],
                    images: rawProduct.images ? (Array.isArray(rawProduct.images) ? rawProduct.images as string[] : []) : [],
                    discountPrice: (rawProduct.discountPrice as number) ?? null,
                    badge: (rawProduct.badge as string) ?? null,
                    sku: (rawProduct.sku as string) || null,
                    title: rawProduct.title ? (typeof rawProduct.title === 'string' ? JSON.parse(rawProduct.title as string) : rawProduct.title) : { tr: '', ar: '', en: '' },
                    description: rawProduct.description ? (typeof rawProduct.description === 'string' ? JSON.parse(rawProduct.description as string) : rawProduct.description) : { tr: '', ar: '', en: '' },
                    variants: rawProduct.variants ? (Array.isArray(rawProduct.variants) ? rawProduct.variants as Product['variants'] : JSON.parse(rawProduct.variants as string || '[]')) : null,
                    fabrics: rawProduct.fabrics ? (Array.isArray(rawProduct.fabrics) ? rawProduct.fabrics as string[] : []) : null,
                    legs: rawProduct.legs ? (Array.isArray(rawProduct.legs) ? rawProduct.legs as string[] : []) : null
                } as Product;
            });
            setProducts(transformedProducts);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            if (isMounted) {
                await fetchProducts();
            }

            // Check active session
            const { data: { session } } = await supabase.auth.getSession();
            if (isMounted) {
                setIsAuthenticated(!!session);
                setUser(session?.user || null);
            }
        };

        init();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (isMounted) {
                setIsAuthenticated(!!session);
                setUser(session?.user || null);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProducts]);

    const addProduct = async (product: Omit<Product, 'id'>) => {
        const { badge, discountPrice, variants, fabrics, legs, sku, ...productData } = product;

        // Ensure arrays are properly formatted
        const productToInsert = {
            ...productData,
            variants: variants && variants.length > 0 ? variants : null,
            fabrics: fabrics && fabrics.length > 0 ? fabrics : null,
            legs: legs && legs.length > 0 ? legs : null,
            badge: badge || null,
            discountPrice: discountPrice || null,
            sku: sku || null
        };

        const { error } = await supabase.from('products').insert([productToInsert]);
        if (error) {
            console.error('Error adding product:', error);
            throw new Error(error.message || 'Ürün eklenirken bir hata oluştu');
        } else {
            fetchProducts();
        }
    };

    const deleteProduct = async (id: number) => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            console.error('Error deleting product:', error);
            throw new Error(error.message || 'Ürün silinirken bir hata oluştu');
        } else {
            setProducts(prev => prev.filter(p => p.id !== id));
        }
    };

    const updateProduct = async (id: number, updatedProduct: Partial<Product>) => {
        const { badge, discountPrice, variants, fabrics, legs, sku, ...productData } = updatedProduct;

        // Prepare update object with proper null handling
        const updateData: Partial<Product> = { ...productData };

        // Only include fields that are being updated
        if (variants !== undefined) {
            updateData.variants = variants;
        }
        if (fabrics !== undefined) {
            updateData.fabrics = fabrics;
        }
        if (legs !== undefined) {
            updateData.legs = legs;
        }
        if (badge !== undefined) {
            updateData.badge = badge || null;
        }
        if (discountPrice !== undefined) {
            updateData.discountPrice = discountPrice || null;
        }
        if (sku !== undefined) {
            updateData.sku = sku || null;
        }

        const { error } = await supabase.from('products').update(updateData).eq('id', id);
        if (error) {
            console.error('Error updating product:', error);
            throw new Error(error.message || 'Ürün güncellenirken bir hata oluştu');
        } else {
            fetchProducts();
        }
    };

    const login = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const register = async (email: string, password: string, profile: { full_name: string; phone: string; address: string }): Promise<{ error: AuthError | null }> => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: profile
            }
        });
        return { error };
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const createOrder = async (order: Omit<Order, 'id' | 'created_at' | 'user_id'>, items: Omit<OrderItem, 'id' | 'order_id'>[]) => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) throw new Error('User not authenticated');

        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({ ...order, user_id: currentUser.id })
            .select()
            .single();

        if (orderError) throw orderError;

        const orderItemsToInsert = items.map(item => ({
            ...item,
            order_id: orderData.id
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert);

        if (itemsError) throw itemsError;
    };

    const getUserOrders = async (): Promise<Order[]> => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return [];

        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items(*)
            `)
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user orders:', error);
            return [];
        }
        return (data || []) as Order[];
    };

    const getAllOrders = async (): Promise<Order[]> => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items(*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all orders:', error);
            return [];
        }
        return (data || []) as Order[];
    };

    const updateOrderStatus = async (orderId: number, status: Order['status']) => {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    };

    return (
        <ProductContext.Provider value={{
            products, loading, addProduct, deleteProduct, updateProduct,
            isAuthenticated, user, login, register, logout, createOrder, getUserOrders, getAllOrders, updateOrderStatus
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
