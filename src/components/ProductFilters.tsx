import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, SlidersHorizontal } from 'lucide-react';

interface ProductFiltersProps {
    minPrice: string;
    maxPrice: string;
    setMinPrice: (val: string) => void;
    setMaxPrice: (val: string) => void;
    sortBy: string;
    setSortBy: (val: string) => void;
    selectedBadge: string;
    setSelectedBadge: (val: string) => void;
    onClear: () => void;
    isOpen: boolean;
    setIsOpen: (val: boolean) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
    minPrice, maxPrice, setMinPrice, setMaxPrice,
    sortBy, setSortBy, selectedBadge, setSelectedBadge,
    onClear, isOpen, setIsOpen
}) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const badges = [
        { id: 'all', label: t('common.viewAll', 'Tümü') },
        { id: 'new', label: t('common.new', 'Yeni') },
        { id: 'sale', label: t('common.sale', 'İndirim') },
        { id: 'bestseller', label: 'Bestseller' }
    ];

    const sortOptions = [
        { id: 'newest', label: t('filters.newest', 'En Yeni') },
        { id: 'price-asc', label: t('filters.lowToHigh', 'Fiyat: Düşükten Yükseğe') },
        { id: 'price-desc', label: t('filters.highToLow', 'Fiyat: Yüksekten Düşüğe') }
    ];

    const filterContent = (
        <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <SlidersHorizontal size={18} /> {t('filters.title', 'Filtrele')}
                </h3>
                <button
                    onClick={onClear}
                    style={{ background: 'none', border: 'none', color: '#8c8c8c', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                    {t('filters.clear', 'Temizle')}
                </button>
            </div>

            {/* Sort */}
            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    {t('filters.sort', 'Sırala')}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {sortOptions.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setSortBy(opt.id)}
                            style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid',
                                borderColor: sortBy === opt.id ? '#1a1a1a' : '#eee',
                                backgroundColor: sortBy === opt.id ? '#1a1a1a' : '#fff',
                                color: sortBy === opt.id ? '#fff' : '#444',
                                textAlign: isRTL ? 'right' : 'left',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Badges/Tags */}
            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    Durum
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {badges.map(badge => (
                        <button
                            key={badge.id}
                            onClick={() => setSelectedBadge(badge.id)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                border: '1px solid',
                                borderColor: selectedBadge === badge.id ? '#1a1a1a' : '#eee',
                                backgroundColor: selectedBadge === badge.id ? '#1a1a1a' : '#fff',
                                color: selectedBadge === badge.id ? '#fff' : '#444',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {badge.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    {t('filters.price', 'Fiyat Aralığı')}
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                        type="number"
                        placeholder={t('filters.min', 'Min')}
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.6rem',
                            borderRadius: '8px',
                            border: '1px solid #eee',
                            outline: 'none',
                            fontSize: '0.9rem'
                        }}
                    />
                    <span style={{ color: '#888' }}>-</span>
                    <input
                        type="number"
                        placeholder={t('filters.max', 'Maks')}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.6rem',
                            borderRadius: '8px',
                            border: '1px solid #eee',
                            outline: 'none',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div style={{ display: 'none', '@media (min-width: 1024px)': { display: 'block' } } as any} className="hidden lg:block lg:w-64">
                {filterContent}
            </div>

            {/* Mobile Toggle Button */}
            <div className="lg:hidden" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        border: '1px solid #eee',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <SlidersHorizontal size={18} /> {t('filters.title', 'Filtrele')}
                </button>
            </div>

            {/* Mobile Drawer Overlay */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 1000,
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}
                >
                    <div
                        style={{
                            width: '85%',
                            maxWidth: '350px',
                            height: '100%',
                            backgroundColor: '#fff',
                            animation: isRTL ? 'slideInLeft 0.3s ease-out' : 'slideInRight 0.3s ease-out',
                            padding: '2rem',
                            position: 'relative',
                            overflowY: 'auto'
                        }}
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '1.5rem',
                                [isRTL ? 'left' : 'right']: '1.5rem',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            } as any}
                        >
                            <X size={24} />
                        </button>
                        <div style={{ marginTop: '2rem' }}>
                            {filterContent}
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                width: '100%',
                                marginTop: '2rem',
                                padding: '1rem',
                                borderRadius: '12px',
                                backgroundColor: '#1a1a1a',
                                color: '#fff',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '1rem',
                                cursor: 'pointer'
                            }}
                        >
                            {t('filters.apply', 'Uygula')}
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
                @media (min-width: 1024px) {
                    .lg\\:block { display: block !important; }
                    .lg\\:w-64 { width: 16rem !important; }
                    .lg\\:hidden { display: none !important; }
                }
            `}</style>
        </>
    );
};

export default ProductFilters;
