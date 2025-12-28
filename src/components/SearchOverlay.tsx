import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProducts } from '../context/ProductContext';
import { Link } from 'react-router-dom';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const { products } = useProducts();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(products);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const searchTerm = query.toLowerCase();
        const filtered = products.filter(product => {
            const title = product.title[i18n.language as 'tr' | 'en' | 'ar']?.toLowerCase() || '';
            const description = product.description[i18n.language as 'tr' | 'en' | 'ar']?.toLowerCase() || '';
            return title.includes(searchTerm) || description.includes(searchTerm);
        });
        setResults(filtered);
    }, [query, products, i18n.language]);

    const getLocalized = (obj: any) => {
        return obj[i18n.language] || obj['en'] || obj['tr'] || '';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 2005,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '1rem 5%',
                        height: '100dvh', // Dynamic viewport height for mobile
                        overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: '2rem'
                    }}>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.5rem',
                                color: '#212529'
                            }}
                        >
                            <X size={32} />
                        </button>
                    </div>

                    {/* Search Input */}
                    <div style={{
                        maxWidth: '800px',
                        margin: '0 auto',
                        width: '100%',
                        position: 'relative'
                    }}>
                        <Search
                            size={28}
                            style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#adb5bd'
                            }}
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={t('search.placeholder')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1.5rem 1rem 1.5rem 4rem',
                                fontSize: '1.5rem',
                                border: 'none',
                                borderBottom: '2px solid #212529',
                                background: 'transparent',
                                outline: 'none',
                                color: '#212529',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    {/* Results Area */}
                    <div style={{
                        maxWidth: '800px',
                        margin: '2rem auto 0',
                        width: '100%',
                        flex: 1,
                        overflowY: 'auto',
                        paddingBottom: '2rem'
                    }}>
                        {query && (
                            <div style={{ marginBottom: '1.5rem', color: '#6c757d', fontSize: '0.9rem' }}>
                                {results.length} {t('search.results')}
                            </div>
                        )}

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {results.map((product) => (
                                <Link
                                    key={product.id}
                                    to={`/product/${product.id}`}
                                    onClick={onClose}
                                    style={{
                                        display: 'flex',
                                        gap: '1.5rem',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        transition: 'background-color 0.2s',
                                        alignItems: 'center'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        backgroundColor: '#f0f0f0'
                                    }}>
                                        <img
                                            src={product.images?.[0] || 'https://via.placeholder.com/150'}
                                            alt={getLocalized(product.title)}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                                            {getLocalized(product.title)}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                                            {String(getLocalized(product.description)).substring(0, 100)}...
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: '#212529' }}>
                                        {product.price.toLocaleString()} TL
                                    </div>
                                    <ArrowRight size={20} color="#adb5bd" />
                                </Link>
                            ))}

                            {!query && (
                                <div style={{ marginTop: '2rem' }}>
                                    <h4 style={{ marginBottom: '1rem', color: '#6c757d' }}>{t('search.popular')}</h4>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        {['Baza', 'Yatak', 'Başlık', 'Set'].map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => setQuery(tag)}
                                                style={{
                                                    padding: '0.5rem 1.25rem',
                                                    borderRadius: '20px',
                                                    border: '1px solid #dee2e6',
                                                    background: 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = '#212529';
                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = '#dee2e6';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {query && results.length === 0 && (
                                <div style={{ textAlign: 'center', marginTop: '4rem', color: '#6c757d' }}>
                                    <p style={{ fontSize: '1.2rem' }}>{t('search.noResults')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchOverlay;
