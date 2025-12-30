import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../context/ProductContext';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';

const CategoryPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const { products } = useProducts();
    const navigate = useNavigate();

    // Filter States
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedBadge, setSelectedBadge] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleClearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setSortBy('newest');
        setSelectedBadge('all');
    };

    const sortedAndFiltered = useMemo(() => {
        let result = products;

        // 1. Category Filter (Fixed)
        if (id) {
            result = result.filter(p => p.category === id);
        }

        // 2. Price Filter
        if (minPrice) {
            result = result.filter(p => (p.discountPrice || p.price) >= Number(minPrice));
        }
        if (maxPrice) {
            result = result.filter(p => (p.discountPrice || p.price) <= Number(maxPrice));
        }

        // 3. Badge Filter
        if (selectedBadge !== 'all') {
            result = result.filter(p => p.badge === selectedBadge);
        }

        // 4. Sorting
        const sorted = [...result].sort((a, b) => {
            const priceA = a.discountPrice || a.price;
            const priceB = b.discountPrice || b.price;

            if (sortBy === 'price-asc') return priceA - priceB;
            if (sortBy === 'price-desc') return priceB - priceA;
            if (sortBy === 'newest') return b.id - a.id; // Assuming ID is incremental
            return 0;
        });

        return sorted;
    }, [id, products, minPrice, maxPrice, selectedBadge, sortBy]);

    const getCategoryTitle = (catId: string | undefined) => {
        if (!catId) return t('common.products', 'Koleksiyon');
        const key = `categories.${catId}Page` as keyof typeof t;
        const fallback = t(`categories.${catId}`, t('common.products', 'Koleksiyon'));
        return t(key, fallback);
    };

    return (
        <div style={{ padding: isMobile ? '1.5rem 1rem' : '2rem 5%', minHeight: '80vh' }}>
            <button
                onClick={() => navigate('/')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    marginBottom: isMobile ? '1.5rem' : '2rem',
                    fontSize: isMobile ? '0.9rem' : '1rem',
                    color: '#666'
                }}
            >
                <ArrowLeft size={isMobile ? 18 : 20} />
                {t('common.back', 'Ana Sayfaya Dön')}
            </button>

            <div style={{ marginBottom: isMobile ? '2rem' : '3rem' }}>
                <h1 style={{ fontSize: isMobile ? '2rem' : '2.5rem', margin: '0 0 0.5rem', fontFamily: "'Playfair Display', serif" }}>
                    {getCategoryTitle(id)}
                </h1>
                <div style={{ color: '#888', fontSize: isMobile ? '0.95rem' : '1.1rem' }}>
                    {sortedAndFiltered.length} {t('common.productsFound')}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
                {/* Filters Sidebar */}
                <div style={{ width: '280px', flexShrink: 0 }} className="hidden lg:block">
                    <ProductFilters
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        setMinPrice={setMinPrice}
                        setMaxPrice={setMaxPrice}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        selectedBadge={selectedBadge}
                        setSelectedBadge={setSelectedBadge}
                        onClear={handleClearFilters}
                        isOpen={isFilterOpen}
                        setIsOpen={setIsFilterOpen}
                    />
                </div>

                {/* Product Grid */}
                <div style={{ flexGrow: 1 }}>
                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden">
                        <ProductFilters
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            setMinPrice={setMinPrice}
                            setMaxPrice={setMaxPrice}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            selectedBadge={selectedBadge}
                            setSelectedBadge={setSelectedBadge}
                            onClear={handleClearFilters}
                            isOpen={isFilterOpen}
                            setIsOpen={setIsFilterOpen}
                        />
                    </div>

                    {sortedAndFiltered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '6rem 2rem', backgroundColor: '#fafafa', borderRadius: '16px', color: '#888' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                            <h3 style={{ margin: 0, color: '#333', fontSize: '1.2rem' }}>{t('common.noProducts')}</h3>
                            <p style={{ marginTop: '0.5rem' }}>Farklı filtreler deneyerek aramayı genişletebilirsiniz.</p>
                            <button
                                onClick={handleClearFilters}
                                style={{ marginTop: '1.5rem', padding: '0.6rem 1.5rem', borderRadius: '8px', border: '1px solid #1a1a1a', background: 'none', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Filtreleri Temizle
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(160px, 1fr))' : 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: isMobile ? '1rem' : '2rem'
                        }}>
                            {sortedAndFiltered.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @media (min-width: 1024px) {
                    .hidden.lg\\:block { display: block !important; }
                    .lg\\:hidden { display: none !important; }
                }
                @media (max-width: 1023px) {
                    .hidden.lg\\:block { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default CategoryPage;
