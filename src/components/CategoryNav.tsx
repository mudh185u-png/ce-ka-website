import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
// import { useTranslation } from 'react-i18next';
import { Bed, Armchair, Box, Layers, Archive, Percent } from 'lucide-react'; // Icons

// @ts-expect-error - Swiper CSS imports might not have type declarations
import 'swiper/css';
// @ts-expect-error - Swiper CSS imports might not have type declarations
import 'swiper/css/navigation';
// @ts-expect-error - Swiper CSS imports might not have type declarations
import 'swiper/css/pagination';

const CategoryNav: React.FC = () => {
    // const { t } = useTranslation();
    // const navigate = useNavigate();

    const categories = [
        { id: 'set', label: 'Baza & Başlık Set', icon: <Layers size={24} />, path: '/category/set' },
        { id: 'yatak', label: 'Yatak Modelleri', icon: <Bed size={24} />, path: '/category/yatak' },
        { id: 'baza', label: 'Baza Modelleri', icon: <Box size={24} />, path: '/category/baza' },
        { id: 'baslik', label: 'Başlık Modelleri', icon: <Armchair size={24} />, path: '/category/baslik' },
        { id: 'tekstil', label: 'Ev Tekstili', icon: <Archive size={24} />, path: '/category/tekstil' },
        { id: 'outlet', label: 'Outlet & Fırsatlar', icon: <Percent size={24} />, path: '/category/outlet' },
    ];

    return (
        <div style={{ padding: '2rem 5%', borderBottom: '1px solid #eee', backgroundColor: '#fff' }}>
            <Swiper
                modules={[Navigation, Pagination, A11y]}
                spaceBetween={20}
                slidesPerView={2}
                breakpoints={{
                    640: { slidesPerView: 3 },
                    768: { slidesPerView: 4 },
                    1024: { slidesPerView: 5 },
                }}
                navigation
                style={{ padding: '10px 5px' }}
            >
                {categories.map((cat) => (
                    <SwiperSlide key={cat.id}>
                        <div
                            className="swiper-no-swiping"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = cat.path;
                            }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '1.5rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                height: '100%',
                                backgroundColor: '#fff'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
                                e.currentTarget.style.borderColor = '#000';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                            }}
                        >
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                border: '1px solid #000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem',
                                color: '#000'
                            }}>
                                {cat.icon}
                            </div>
                            <span style={{
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                textAlign: 'center',
                                color: '#333'
                            }}>
                                {cat.label}
                            </span>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default CategoryNav;
