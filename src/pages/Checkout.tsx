import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, CreditCard, Truck, CheckCircle, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useCart } from '../context/CartContext';

const Checkout: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { isAuthenticated, createOrder } = useProducts();
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isRTL = i18n.language === 'ar';

    const [loading, setLoading] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }

        if (cart.length === 0 && !orderSuccess) {
            navigate('/');
        }
    }, [isAuthenticated, cart.length, navigate, orderSuccess]);

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            // Get user data from Supabase Auth
            const { data: { user } } = await (await import('../supabase')).supabase.auth.getUser();
            if (!user) throw new Error('User not found');

            const order = {
                user_id: user.id,
                customer_name: user.user_metadata.full_name || user.email,
                customer_phone: user.user_metadata.phone || '-',
                customer_address: user.user_metadata.address || '-',
                customer_email: user.email,
                total_amount: cartTotal,
                status: 'pending' as const
            };

            const orderItems = cart.map(item => ({
                product_id: item.id,
                product_sku: item.sku || undefined,
                product_title: item.title,
                quantity: item.quantity,
                unit_price: item.price,
                variant_info: {
                    size: item.selectedSize?.size,
                    fabric: item.selectedFabric,
                    leg: item.selectedLeg
                }
            }));

            await createOrder(order, orderItems);

            // Clear cart
            clearCart();
            setOrderSuccess(true);
            showToast(t('checkout.success', { defaultValue: 'Siparişiniz başarıyla oluşturuldu' }), 'success');
        } catch (error: unknown) {
            console.error('Order error:', error);
            const errorMessage = error instanceof Error ? error.message : t('checkout.error', { defaultValue: 'Sipariş oluşturulurken hata oluştu' });
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (orderSuccess) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
                <CheckCircle size={80} color="#52c41a" style={{ marginBottom: '1.5rem' }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>
                    {t('checkout.thankYou', { defaultValue: 'Teşekkür Ederiz!' })}
                </h1>
                <p style={{ color: '#666', fontSize: '1.2rem', maxWidth: '500px', marginBottom: '2rem' }}>
                    {t('checkout.orderConfirmed', { defaultValue: 'Siparişiniz başarıyla alındı. Faturanız e-posta adresinize gönderilecektir.' })}
                </p>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '1rem 2.5rem',
                        backgroundColor: '#1e293b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    {t('checkout.backToHome', { defaultValue: 'Ana Sayfaya Dön' })}
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{
                fontSize: isMobile ? '1.8rem' : '2.5rem',
                fontWeight: 800,
                marginBottom: isMobile ? '2rem' : '3rem',
                color: '#1a1a1a',
                fontFamily: "'Playfair Display', serif",
                textAlign: isRTL ? 'right' : 'left'
            }}>
                {t('checkout.title', { defaultValue: 'Ödeme ve Onay' })}
            </h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr',
                gap: isMobile ? '2rem' : '4rem'
            }}>
                {/* Order Summary */}
                <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <ShoppingBag size={24} color="var(--color-primary)" />
                        {t('checkout.orderSummary', { defaultValue: 'Sipariş Özeti' })}
                    </h2>

                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '1.5rem' }}>
                        {cart.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                                <img src={item.images?.[0]} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.title[i18n.language as 'tr' | 'en' | 'ar'] || item.title.tr}</h4>
                                    <p style={{ margin: '0.3rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                                        {item.sku && `SKU: ${item.sku} | `}
                                        {item.selectedSize?.size && `${item.selectedSize.size} | `}
                                        {t('common.quantity')}: {item.quantity}
                                    </p>
                                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-primary)' }}>{item.price.toLocaleString()} TL</p>
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                <span>{t('checkout.subtotal', { defaultValue: 'Ara Toplam' })}</span>
                                <span>{cartTotal.toLocaleString()} TL</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                <span>{t('checkout.shipping', { defaultValue: 'Kargo' })}</span>
                                <span style={{ color: '#52c41a', fontWeight: 600 }}>{t('checkout.free', { defaultValue: 'Ücretsiz' })}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e2e8f0', fontSize: '1.25rem', fontWeight: 800 }}>
                                <span>{t('checkout.total', { defaultValue: 'Toplam' })}</span>
                                <span>{cartTotal.toLocaleString()} TL</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirm Order */}
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <ArrowLeft size={24} color="#1e293b" />
                        {t('checkout.confirm', { defaultValue: 'Siparişi Onayla' })}
                    </h2>

                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                                <Truck size={20} color="#64748b" />
                                <div>
                                    <p style={{ fontWeight: 600, margin: 0 }}>{t('checkout.deliveryType', { defaultValue: 'Kapıda Ödeme & Teslimat' })}</p>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0' }}>{t('checkout.deliveryDesc', { defaultValue: 'Ürününüz kapınıza ulaştığında ödemenizi yapabilirsiniz.' })}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <CreditCard size={20} color="#64748b" />
                                <div>
                                    <p style={{ fontWeight: 600, margin: 0 }}>{t('checkout.paymentType', { defaultValue: 'Güvenli Ödeme' })}</p>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0' }}>{t('checkout.paymentDesc', { defaultValue: 'Faturanız sistem tarafından otomatik olarak e-postanıza iletilir.' })}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading || cart.length === 0}
                            style={{
                                width: '100%',
                                padding: '1.2rem',
                                backgroundColor: '#1e293b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                transition: 'all 0.2s',
                                opacity: (loading || cart.length === 0) ? 0.7 : 1
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#334155'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = '#1e293b'}
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : t('checkout.complete', { defaultValue: 'Siparişi Tamamla' })}
                        </button>

                        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', justifyContent: 'center' }}>
                            <AlertCircle size={14} />
                            {t('checkout.terms', { defaultValue: 'Siparişi onaylayarak satış sözleşmesini kabul etmiş sayılırsınız.' })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
