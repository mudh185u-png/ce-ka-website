import React, { useState } from 'react';
import { useProducts, type Order } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, Phone, MapPin, Loader2, ArrowRight, ArrowLeft, LogOut, Package, ExternalLink } from 'lucide-react';
import { useToast } from '../components/Toast';

const Auth: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { login, register, isAuthenticated, user, logout, getUserOrders } = useProducts();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const isRTL = i18n.language === 'ar';

    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);

        if (isAuthenticated && user) {
            console.log("Profile Debug:", {
                email: user.email,
                metadata: user.user_metadata,
                full_name: user.user_metadata?.full_name
            });
        }

        return () => window.removeEventListener('resize', handleResize);
    }, [isAuthenticated, user]);

    React.useEffect(() => {
        if (isAuthenticated) {
            setOrdersLoading(true);
            getUserOrders()
                .then(data => setOrders(data))
                .catch(err => console.error('Error fetching orders:', err))
                .finally(() => setOrdersLoading(false));
        }
    }, [isAuthenticated, getUserOrders]);

    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        address: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await login(formData.email, formData.password);
                if (error) throw error;
                showToast(t('auth.loginSuccess', { defaultValue: 'Giriş başarılı' }), 'success');
                navigate('/');
            } else {
                const { error } = await register(formData.email, formData.password, {
                    full_name: formData.fullName,
                    phone: formData.phone,
                    address: formData.address
                });
                if (error) throw error;
                showToast(t('auth.registerSuccess', { defaultValue: 'Kayıt başarılı! Lütfen e-postanızı doğrulayın.' }), 'success');
            }
        } catch (error: any) {
            showToast(error?.message || t('auth.error', { defaultValue: 'Bir hata oluştu' }), 'error');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: isRTL ? '0.8rem 2.8rem 0.8rem 1rem' : '0.8rem 1rem 0.8rem 2.8rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.2s',
        marginBottom: '1rem',
        textAlign: isRTL ? 'right' : 'left'
    };

    const iconStyle: React.CSSProperties = {
        position: 'absolute',
        [isRTL ? 'right' : 'left']: '12px',
        top: '14px'
    };

    const containerStyle: React.CSSProperties = {
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: isMobile ? '1rem' : '2rem'
    };

    const cardStyle: React.CSSProperties = {
        width: '100%',
        maxWidth: '450px',
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: isMobile ? '1.5rem' : '3rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    };

    if (isAuthenticated && user) {
        return (
            <div style={containerStyle}>
                <div style={{ ...cardStyle, maxWidth: '800px' }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        marginBottom: '2rem',
                        gap: isMobile ? '1rem' : '0'
                    }}>
                        <div>
                            <h1 style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.2rem', fontFamily: "'Playfair Display', serif" }}>
                                {user.user_metadata?.full_name || user.email}
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{user.email}</p>
                        </div>
                        <button
                            onClick={async () => {
                                await logout();
                                navigate('/');
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 1.2rem',
                                backgroundColor: '#fef2f2',
                                color: '#b91c1c',
                                border: '1px solid #fee2e2',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                        >
                            <LogOut size={18} />
                            {t('auth.logout', { defaultValue: 'Çıkış Yap' })}
                        </button>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Package size={22} color="#0066cc" />
                            {t('auth.myOrders', { defaultValue: 'Siparişlerim' })}
                        </h2>

                        {ordersLoading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <Loader2 className="animate-spin" size={32} color="#94a3b8" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
                                <Package size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: '#64748b' }}>{t('auth.noOrders', { defaultValue: 'Henüz bir siparişiniz bulunmuyor.' })}</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {orders.map(order => (
                                    <div key={order.id} style={{
                                        padding: isMobile ? '1rem' : '1.5rem',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        flexDirection: isMobile ? 'column' : 'row',
                                        justifyContent: 'space-between',
                                        alignItems: isMobile ? 'flex-start' : 'center',
                                        gap: isMobile ? '1rem' : '0'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                                <span style={{ fontWeight: 700, color: '#1e293b' }}>#{order.id}</span>
                                                <span style={{ color: '#64748b' }}>•</span>
                                                <span style={{ color: '#64748b' }}>{new Date(order.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: '#0066cc', fontWeight: 600 }}>
                                                {order.total_amount.toLocaleString()} TL
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{
                                                padding: '0.4rem 0.8rem',
                                                backgroundColor: '#e0f2fe',
                                                color: '#0369a1',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                textTransform: 'uppercase'
                                            }}>
                                                {t(`checkout.status.${order.status}`, { defaultValue: order.status })}
                                            </span>
                                            {order.invoice_url && (
                                                <a
                                                    href={order.invoice_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: '#64748b', transition: 'color 0.2s' }}
                                                    onMouseOver={e => e.currentTarget.style.color = '#1e293b'}
                                                    onMouseOut={e => e.currentTarget.style.color = '#64748b'}
                                                >
                                                    <ExternalLink size={20} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
                        {isLogin ? t('auth.loginTitle', { defaultValue: 'Hoş Geldiniz' }) : t('auth.registerTitle', { defaultValue: 'Hesap Oluştur' })}
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                        {isLogin ? t('auth.loginDesc', { defaultValue: 'Devam etmek için giriş yapın' }) : t('auth.registerDesc', { defaultValue: 'Özel avantajlardan yararlanmak için kaydolun' })}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div style={{ position: 'relative' }}>
                                <User size={18} color="#94a3b8" style={iconStyle} />
                                <input
                                    type="text"
                                    placeholder={t('auth.fullName', { defaultValue: 'Ad Soyad' })}
                                    style={inputStyle}
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Phone size={18} color="#94a3b8" style={iconStyle} />
                                <input
                                    type="tel"
                                    placeholder={t('auth.phone', { defaultValue: 'Telefon' })}
                                    style={inputStyle}
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={18} color="#94a3b8" style={iconStyle} />
                                <input
                                    type="text"
                                    placeholder={t('auth.address', { defaultValue: 'Adres' })}
                                    style={inputStyle}
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div style={{ position: 'relative' }}>
                        <Mail size={18} color="#94a3b8" style={iconStyle} />
                        <input
                            type="email"
                            placeholder={t('auth.email', { defaultValue: 'E-posta' })}
                            style={inputStyle}
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} color="#94a3b8" style={iconStyle} />
                        <input
                            type="password"
                            placeholder={t('auth.password', { defaultValue: 'Şifre' })}
                            style={inputStyle}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            backgroundColor: '#1e293b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.8rem',
                            transition: 'all 0.2s',
                            marginTop: '1.5rem'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#334155'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#1e293b'}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? t('auth.login', { defaultValue: 'Giriş Yap' }) : t('auth.register', { defaultValue: 'Kayıt Ol' }))}
                        {!loading && (isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />)}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ background: 'none', border: 'none', color: '#1890ff', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' }}
                    >
                        {isLogin ? t('auth.noAccount', { defaultValue: 'Hesabınız yok mu? Kaydolun' }) : t('auth.hasAccount', { defaultValue: 'Zaten hesabınız var mı? Giriş yapın' })}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
