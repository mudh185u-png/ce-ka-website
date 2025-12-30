import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Menu, X, Trash2, Search, User, CreditCard, Heart } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Link, useNavigate } from 'react-router-dom';
import SearchOverlay from './SearchOverlay';

const Header: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { cart, cartCount, cartTotal, isCartOpen, toggleCart, removeFromCart } = useCart();
    const { wishlist } = useWishlist();
    const { isAuthenticated, user } = useProducts();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
            }
        };
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    useEffect(() => {
        document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    }, [i18n.language]);

    const navStyles = {
        textDecoration: 'none',
        color: '#212529',
        fontWeight: 500,
        fontSize: '0.95rem',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
    };

    return (
        <>
            <header style={{
                backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'white',
                backdropFilter: scrolled ? 'blur(10px)' : 'none',
                padding: scrolled ? '0.5rem 0' : '0.75rem 0',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                transition: 'all 0.3s ease',
                boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
                borderBottom: scrolled ? 'none' : '1px solid #f0f0f0'
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '0 5%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Logo Section */}
                    <Link
                        to="/"
                        style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'transform 0.3s ease, opacity 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.02)';
                            e.currentTarget.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.opacity = '1';
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            lineHeight: '1.1',
                            position: 'relative',
                            padding: '0.25rem 0'
                        }}>
                            <div style={{
                                fontSize: isMobile ? '1.5rem' : '2rem',
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #212529 0%, #495057 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                letterSpacing: '4px',
                                marginBottom: '3px',
                                fontFamily: "'Playfair Display', serif",
                                position: 'relative',
                                transition: 'all 0.3s ease'
                            }}>
                                CE-KA
                            </div>
                            <div style={{
                                fontSize: isMobile ? '0.75rem' : '0.9rem',
                                fontWeight: 600,
                                color: '#868e96',
                                letterSpacing: '5px',
                                textTransform: 'uppercase',
                                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                position: 'relative',
                                marginTop: '1px',
                                transition: 'color 0.3s ease'
                            }}>
                                BAZA
                            </div>
                            {/* Decorative line */}
                            <div style={{
                                position: 'absolute',
                                bottom: '-2px',
                                left: 0,
                                width: '100%',
                                height: '2px',
                                background: 'linear-gradient(90deg, transparent 0%, #dee2e6 50%, transparent 100%)',
                                opacity: 0.5
                            }} />
                        </div>
                    </Link>

                    {/* Navigation Links - Desktop */}
                    {!isMobile && (
                        <nav style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center'
                        }}>
                            <Link
                                to="/"
                                style={navStyles}
                                onMouseEnter={e => e.currentTarget.style.color = '#0066cc'}
                                onMouseLeave={e => e.currentTarget.style.color = '#212529'}
                            >
                                {t('nav.home')}
                            </Link>
                            <a
                                href="#about"
                                style={navStyles}
                                onMouseEnter={e => e.currentTarget.style.color = '#0066cc'}
                                onMouseLeave={e => e.currentTarget.style.color = '#212529'}
                            >
                                {t('nav.about')}
                            </a>
                            <a
                                href="#contact"
                                style={navStyles}
                                onMouseEnter={e => e.currentTarget.style.color = '#0066cc'}
                                onMouseLeave={e => e.currentTarget.style.color = '#212529'}
                            >
                                {t('nav.contact')}
                            </a>
                        </nav>
                    )}

                    {/* Right Section */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '0.75rem' : '1.5rem'
                    }}>
                        {/* Search Icon */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.5rem',
                                color: '#212529',
                                transition: 'transform 0.2s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Search size={isMobile ? 20 : 22} />
                        </button>

                        {/* Auth / Profile Link */}
                        <Link
                            to="/auth"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '0.6rem 1rem',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                textDecoration: 'none',
                                border: isAuthenticated ? '1px solid #bae7ff' : '1px solid transparent',
                                backgroundColor: isAuthenticated ? '#f0f7ff' : 'transparent',
                                borderRadius: '12px',
                                color: isAuthenticated ? '#0066cc' : '#212529'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                if (isAuthenticated) e.currentTarget.style.backgroundColor = '#e6f7ff';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                if (isAuthenticated) e.currentTarget.style.backgroundColor = '#f0f7ff';
                            }}
                        >
                            <User size={isMobile ? 20 : 22} />
                            {!isMobile && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    {isAuthenticated ? (
                                        <>
                                            <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 500, lineHeight: 1 }}>{t('common.welcome') || 'Merhaba'}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#0066cc', fontWeight: 700 }}>
                                                {String(user?.user_metadata?.full_name || t('auth.profile')).split(' ')[0]}
                                            </span>
                                        </>
                                    ) : (
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t('auth.login')}</span>
                                    )}
                                </div>
                            )}
                        </Link>

                        {/* Wishlist Link */}
                        <Link
                            to="/wishlist"
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.5rem',
                                color: wishlist.length > 0 ? '#ff4d4d' : '#212529',
                                transition: 'transform 0.2s ease',
                                textDecoration: 'none',
                                position: 'relative'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Heart size={isMobile ? 20 : 22} fill={wishlist.length > 0 ? '#ff4d4d' : 'none'} />
                            {wishlist.length > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    backgroundColor: '#ff4d4d',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    {wishlist.length}
                                </span>
                            )}
                        </Link>

                        {/* Cart Trigger */}
                        <div
                            style={{ position: 'relative', cursor: 'pointer', padding: '0.5rem' }}
                            onClick={toggleCart}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <ShoppingCart size={isMobile ? 20 : 22} color="#212529" />
                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    backgroundColor: '#0066cc',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    {cartCount}
                                </span>
                            )}
                        </div>

                        {/* Language Switcher */}
                        {!isMobile && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#f8f9fa',
                                padding: '4px',
                                borderRadius: '10px',
                                marginLeft: '0.5rem'
                            }}>
                                {['tr', 'ar', 'en'].map((lang) => (
                                    <button
                                        key={lang}
                                        onClick={() => changeLanguage(lang)}
                                        style={{
                                            border: 'none',
                                            background: i18n.language === lang ? 'white' : 'transparent',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: i18n.language === lang ? '#0066cc' : '#6c757d',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            transition: 'all 0.2s',
                                            boxShadow: i18n.language === lang ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                                        }}
                                    >
                                        {lang.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        {isMobile && (
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                style={{
                                    background: '#f8f9fa',
                                    border: 'none',
                                    cursor: 'pointer',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isMobileMenuOpen ? <X size={20} color="#212529" /> : <Menu size={20} color="#212529" />}
                            </button>
                        )}
                    </div>
                </div>
            </header >

            {/* Mobile Menu Overlay */}
            {
                isMobile && isMobileMenuOpen && (
                    <div style={{
                        position: 'fixed',
                        top: scrolled ? '65px' : '85px',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        borderTop: '1px solid #f0f0f0',
                        padding: '1rem',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        zIndex: 999,
                        transition: 'all 0.3s ease'
                    }}>
                        <Link
                            to="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{ ...navStyles, padding: '1rem' }}
                        >
                            {t('nav.home')}
                        </Link>
                        <a
                            href="#about"
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{ ...navStyles, padding: '1rem' }}
                        >
                            {t('nav.about')}
                        </a>
                        <a
                            href="#contact"
                            onClick={() => setIsMobileMenuOpen(false)}
                            style={{ ...navStyles, padding: '1rem' }}
                        >
                            {t('nav.contact')}
                        </a>

                        {/* Language Switcher for Mobile */}
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            padding: '1rem',
                            borderTop: '1px solid #f0f0f0',
                            marginTop: '0.5rem'
                        }}>
                            {['tr', 'ar', 'en'].map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => {
                                        changeLanguage(lang);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid #f0f0f0',
                                        background: i18n.language === lang ? '#f8f9fa' : 'white',
                                        fontWeight: 'bold',
                                        color: i18n.language === lang ? '#0066cc' : '#212529'
                                    }}
                                >
                                    {lang.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* Search Overlay */}
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* Cart Drawer Overlay */}
            {
                isCartOpen && (
                    <>
                        <div onClick={toggleCart} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2001 }} />
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            right: i18n.language === 'ar' ? 'auto' : 0,
                            left: i18n.language === 'ar' ? 0 : 'auto',
                            bottom: 0,
                            width: isMobile ? '100%' : '420px',
                            backgroundColor: 'white',
                            zIndex: 2002,
                            padding: isMobile ? '1.5rem' : '2.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: i18n.language === 'ar' ? '10px 0 30px rgba(0,0,0,0.1)' : '-10px 0 30px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{t('cart.title')}</h2>
                                <button
                                    onClick={toggleCart}
                                    style={{
                                        background: '#f8f9fa',
                                        border: 'none',
                                        cursor: 'pointer',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem' }}>
                                {cart.length === 0 ? (
                                    <div style={{ textAlign: 'center', marginTop: '4rem', color: '#adb5bd' }}>
                                        <ShoppingCart size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                        <p style={{ fontSize: '1.1rem' }}>{t('cart.empty')}</p>
                                    </div>
                                ) : (
                                    cart.map((item, idx) => {
                                        const uniqueKey = `${item.id}-${item.selectedSize?.size || 'default'}-${item.selectedFabric || 'default'}-${item.selectedLeg || 'default'}-${idx}`;
                                        return (
                                            <div key={uniqueKey} style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem', position: 'relative' }}>
                                                <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#f8f9fa' }}>
                                                    <img src={item.images?.[0]} alt={item.title.tr} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.4rem', paddingRight: '2rem' }}>
                                                        {item.title[i18n.language as 'tr' | 'en' | 'ar']}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#6c757d', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                        {item.selectedSize && <span style={{ background: '#f8f9fa', padding: '2px 8px', borderRadius: '4px' }}>{item.selectedSize.size}</span>}
                                                        {item.selectedFabric && <span style={{ background: '#f8f9fa', padding: '2px 8px', borderRadius: '4px' }}>{item.selectedFabric}</span>}
                                                    </div>
                                                    <div style={{ fontWeight: 700, marginTop: '0.5rem', color: '#212529' }}>{item.price.toLocaleString()} TL</div>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.id, idx)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        right: 0,
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#adb5bd',
                                                        cursor: 'pointer',
                                                        padding: '4px'
                                                    }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div style={{
                                    background: '#f8f9fa',
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    marginTop: 'auto'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                                        <span style={{ color: '#6c757d' }}>{t('cart.total')}</span>
                                        <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>{cartTotal.toLocaleString()} TL</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            toggleCart();
                                            navigate('/checkout');
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '1.25rem',
                                            backgroundColor: '#25D366',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.75rem',
                                            boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)'
                                        }}
                                    >
                                        <CreditCard size={20} />
                                        {t('cart.checkout')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )
            }
        </>
    );
};

export default Header;
