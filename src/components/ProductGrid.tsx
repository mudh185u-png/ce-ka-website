import React from 'react';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import ProductCard from './ProductCard';

// Swiper Styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProductGrid: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { products } = useProducts();
    const navigate = useNavigate();

    const sections = [
        { id: 'set', labelKey: 'categories.set', bg: '#f9fafb' },
        { id: 'yatak', labelKey: 'categories.yatak', bg: '#fff' },
        { id: 'baza', labelKey: 'categories.baza', bg: '#f9fafb' },
        { id: 'baslik', labelKey: 'categories.baslik', bg: '#fff' },
        { id: 'bebek', labelKey: 'categories.bebek', bg: '#f9fafb' },
        { id: 'tekstil', labelKey: 'categories.tekstil', bg: '#fff' },
        { id: 'outlet', labelKey: 'categories.outlet', bg: '#f9fafb' }
    ];

    const isRTL = i18n.language === 'ar';

    return (
        <div style={{ paddingBottom: '4rem' }}>
            {sections.map((section) => {
                const categoryProducts = products.filter(p => p.category === section.id);

                if (categoryProducts.length === 0) return null;

                return (
                    <section key={section.id} style={{ padding: '4rem 0', backgroundColor: section.bg }}>
                        <div style={{
                            padding: '0 5%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'end',
                            marginBottom: '2rem',
                            borderBottom: '2px solid #e5e7eb',
                            paddingBottom: '1rem'
                        }}>
                            <h2 style={{
                                fontSize: '2rem',
                                color: '#111',
                                margin: 0,
                                fontFamily: "'Playfair Display', serif",
                                letterSpacing: '-0.5px'
                            }}>
                                {t(section.labelKey)}
                            </h2>
                            <button
                                onClick={() => navigate(`/category/${section.id}`)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.6rem 1.2rem',
                                    border: '1px solid #000',
                                    backgroundColor: 'transparent',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    borderRadius: '4px'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.backgroundColor = '#000';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#000';
                                }}
                            >
                                {t('common.viewAll')} {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                            </button>
                        </div>

                        <div style={{ padding: '0 5%' }}>
                            <Swiper
                                modules={[Navigation, Pagination, A11y]}
                                spaceBetween={30}
                                slidesPerView={1.2}
                                navigation
                                dir={isRTL ? 'rtl' : 'ltr'}
                                breakpoints={{
                                    640: { slidesPerView: 2.2 },
                                    1024: { slidesPerView: 3.2 },
                                    1440: { slidesPerView: 4.2 },
                                }}
                                style={{ padding: '20px 5px' }}
                            >
                                {categoryProducts.map((product) => (
                                    <SwiperSlide key={product.id}>
                                        <ProductCard product={product} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </section>
                );
            })}
        </div>
    );
};

export default ProductGrid;
