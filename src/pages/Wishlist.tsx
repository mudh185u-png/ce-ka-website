import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Heart } from 'lucide-react';

const Wishlist: React.FC = () => {
    const { t } = useTranslation();
    const { wishlist } = useWishlist();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1, padding: '4rem 5%' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontFamily: "'Playfair Display', serif",
                            marginBottom: '1rem'
                        }}>
                            {t('wishlistPage.title')}
                        </h1>
                        <p style={{ color: '#666', fontSize: '1.1rem' }}>
                            {t('wishlistPage.description')}
                        </p>
                    </div>

                    {wishlist.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '6rem 2rem',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '24px',
                            border: '1px dashed #dee2e6'
                        }}>
                            <Heart size={64} style={{ color: '#dee2e6', marginBottom: '1.5rem' }} />
                            <h3 style={{ fontSize: '1.5rem', color: '#adb5bd', marginBottom: '1rem' }}>
                                {t('wishlist.empty')}
                            </h3>
                            <a href="/" style={{
                                display: 'inline-block',
                                padding: '1rem 2rem',
                                backgroundColor: '#212529',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                fontWeight: 600,
                                transition: 'transform 0.2s ease'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {t('common.viewAll')}
                            </a>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '2.5rem'
                        }}>
                            {wishlist.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Wishlist;
