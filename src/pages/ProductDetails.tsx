import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import {
    ShoppingCart, Share2, Truck, ShieldCheck, ArrowLeft, CreditCard, Star, MessageSquare, Send, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

interface Review {
    id: string;
    product_id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
    status: 'pending' | 'approved' | 'rejected';
}

const ProductDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { products } = useProducts();
    const { addToCart } = useCart();
    const { i18n, t } = useTranslation();

    const getOptimizedUrl = (url: string | undefined, width = 800, height = 800) => {
        if (!url) return 'https://via.placeholder.com/600';
        if (url.includes('supabase.co')) {
            return `${url}?width=${width}&height=${height}&resize=contain&format=webp&quality=80`;
        }
        return url;
    };
    const navigate = useNavigate();

    const getLocalized = useCallback((obj: { [key: string]: string } | undefined) => {
        if (!obj) return '';
        return obj[i18n.language] || obj['en'] || Object.values(obj)[0] || '';
    }, [i18n.language]);

    // Find product - handle potential type mismatch if ID comes as string
    const product = products.find(p => p.id === Number(id));

    // State for gallery
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<{ size: string; price: number } | null>(null);
    const [selectedFabric, setSelectedFabric] = useState<string>('');
    const [selectedLeg, setSelectedLeg] = useState<string>('');
    const [openModal, setOpenModal] = useState<'size' | 'fabric' | 'leg' | null>(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const lastProductId = useRef<number | null>(null);

    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewMessage, setReviewMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
    const { user, isAuthenticated } = useProducts();

    useEffect(() => {
        if (isAuthenticated && user?.user_metadata?.full_name) {
            setReviewForm(prev => ({ ...prev, name: user.user_metadata.full_name }));
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (product && product.id !== lastProductId.current) {
            lastProductId.current = product.id;

            const initialImage = product.images?.[0] || '';
            const initialVariant = product.variants?.[0] || null;
            const initialFabric = product.fabrics?.[0] || '';
            const initialLeg = product.legs?.[0] || '';

            setSelectedImage(initialImage);
            setSelectedSize(initialVariant);
            setSelectedFabric(initialFabric);
            setSelectedLeg(initialLeg);
            window.scrollTo(0, 0);

            // Dynamic SEO Enhancement
            const title = getLocalized(product.title);
            const desc = getLocalized(product.description);
            document.title = `${title} | Ce & Ka Baza`;

            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', desc.substring(0, 160));
            }

            fetchReviews(product.id);
        }
    }, [product, getLocalized]);

    const fetchReviews = async (productId: number) => {
        try {
            const { data, error } = await supabase
                .from('product_reviews')
                .select('*')
                .eq('product_id', productId)
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setReviews(data);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        // Use user name from metadata if authenticated, otherwise from form
        const submissionName = isAuthenticated ? (user?.user_metadata?.full_name || user?.email) : reviewForm.name;

        if (!submissionName || !reviewForm.comment) {
            console.error("Submission blocked: missing name or comment", { submissionName, comment: reviewForm.comment });
            return;
        }

        setSubmittingReview(true);
        setReviewMessage(null);

        try {
            const { error } = await supabase
                .from('product_reviews')
                .insert([{
                    product_id: product?.id,
                    user_name: submissionName,
                    rating: reviewForm.rating,
                    comment: reviewForm.comment,
                    status: 'approved' // Now approved by default
                }]);

            if (error) throw error;

            setReviewMessage({
                text: i18n.language === 'ar' ? 'شكراً لك! تقييمك بانتظار موافقة المسؤول ليظهر للجميع.' : (i18n.language === 'tr' ? 'Teşekkürler! Değerlendirmeniz yönetici onayından sonra görünecektir.' : 'Thank you! Your review will appear after admin approval.'),
                type: 'success'
            });
            setReviewForm({ name: '', rating: 5, comment: '' });
        } catch (err) {
            console.error('Error submitting review:', err);
            const error = err as Error;
            const errorMessage = error?.message || (i18n.language === 'ar' ? 'فشل إرسال التقييم.' : 'Değerlendirme gönderilemedi.');
            setReviewMessage({ text: errorMessage, type: 'error' });
            // Add a temporary alert if fetch fails to make it obvious
            alert(`Review Error: ${error?.message}`);
        } finally {
            setSubmittingReview(false);
        }
    };

    const [deliveryInfo, setDeliveryInfo] = useState({ tr: 'Ücretsiz Teslimat', en: 'Free Delivery', ar: 'توصيل مجاني' });
    const [warrantyInfo, setWarrantyInfo] = useState({ tr: '2 Yıl Garanti', en: '2 Years Warranty', ar: 'ضمان لمدة سنتين' });

    const handleNextImage = useCallback(() => {
        if (!product?.images) return;
        const currentIndex = product.images.indexOf(selectedImage);
        const nextIndex = (currentIndex + 1) % product.images.length;
        setSelectedImage(product.images[nextIndex]);
    }, [product, selectedImage]);

    const handlePrevImage = useCallback(() => {
        if (!product?.images) return;
        const currentIndex = product.images.indexOf(selectedImage);
        const prevIndex = (currentIndex - 1 + product.images.length) % product.images.length;
        setSelectedImage(product.images[prevIndex]);
    }, [product, selectedImage]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isLightboxOpen) return;
            if (e.key === 'ArrowRight') handleNextImage();
            if (e.key === 'ArrowLeft') handlePrevImage();
            if (e.key === 'Escape') setIsLightboxOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, handleNextImage, handlePrevImage]);

    const handleShare = async () => {
        const shareData = {
            title: getLocalized(product?.title),
            text: getLocalized(product?.description),
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } catch (err) {
                console.error('Error copying link:', err);
            }
        }
    };

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('*');

            if (data) {
                const prodSettings = data.find(s => s.key === 'product_settings')?.value;
                if (prodSettings) {
                    if (prodSettings.delivery) setDeliveryInfo(prodSettings.delivery);
                    if (prodSettings.warranty) setWarrantyInfo(prodSettings.warranty);
                }
            }
        };
        fetchSettings();
    }, []);


    if (!product) {
        return <div style={{ padding: '4rem', textAlign: 'center', fontSize: '1.2rem', color: '#666' }}>{t('common.productNotFound')}</div>;
    }

    return (
        <div style={{ padding: isMobile ? '1rem' : '2rem 5%', backgroundColor: '#fdfdfd', minHeight: '90vh' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: isMobile ? '1rem' : '2rem',
                    fontSize: '0.95rem',
                    color: '#666',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <ArrowLeft size={18} />
                {t('nav.back') || 'Geri Dön'}
            </button>

            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: isMobile ? '2rem' : '3rem',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* Gallery Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div
                        onClick={() => setIsLightboxOpen(true)}
                        style={{
                            width: '100%',
                            height: isMobile ? '350px' : '450px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            marginBottom: '1rem',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                            border: '1px solid #f0f0f0',
                            backgroundColor: '#fff',
                            cursor: 'zoom-in'
                        }}
                    >
                        <img
                            src={selectedImage || 'https://via.placeholder.com/600'}
                            alt={getLocalized(product.title)}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>

                    {/* Image Lightbox */}
                    {isLightboxOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.9)',
                                zIndex: 2000,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '2rem',
                                cursor: 'zoom-out'
                            }}
                            onClick={() => setIsLightboxOpen(false)}
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    color: 'white',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                            >
                                ✕
                            </button>
                            {/* Navigation Buttons */}
                            {product.images?.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                                        style={{
                                            position: 'absolute',
                                            left: '20px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: 'none',
                                            color: 'white',
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            fontSize: '1.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 2100,
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                    >
                                        ‹
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                                        style={{
                                            position: 'absolute',
                                            right: '20px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: 'none',
                                            color: 'white',
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            fontSize: '1.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 2100,
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                                    >
                                        ›
                                    </button>
                                </>
                            )}

                            <motion.img
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                src={getOptimizedUrl(selectedImage, 1200, 1200)}
                                alt=""
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </motion.div>
                    )}
                    {/* Thumbnails */}
                    {product.images?.length > 1 && (
                        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {product.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: selectedImage === img ? '2px solid var(--color-primary)' : '2px solid transparent',
                                        opacity: selectedImage === img ? 1 : 0.6,
                                        transition: 'all 0.2s',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                        backgroundColor: '#fff'
                                    }}
                                >
                                    <img src={getOptimizedUrl(img, 150, 150)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Info Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    style={{ display: 'flex', flexDirection: 'column' }}
                >
                    <span style={{
                        alignSelf: 'flex-start',
                        backgroundColor: '#f0f0f0',
                        padding: '0.4rem 1rem',
                        borderRadius: '30px',
                        fontSize: '0.8rem',
                        color: '#555',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: 600,
                        marginBottom: '1rem'
                    }}>
                        {product.category}
                    </span>

                    <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem', color: '#1a1a1a', fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}>
                        {getLocalized(product.title)}
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        {product.discountPrice && product.discountPrice < product.price ? (
                            <>
                                <span style={{ fontSize: '2.5rem', color: '#cf1322', fontWeight: 'bold' }}>
                                    {(selectedSize ? (selectedSize.price * (product.discountPrice / product.price)) : product.discountPrice).toLocaleString()} TL
                                </span>
                                <span style={{ fontSize: '1.2rem', color: '#8c8c8c', textDecoration: 'line-through' }}>
                                    {(selectedSize ? selectedSize.price : product.price).toLocaleString()} TL
                                </span>
                            </>
                        ) : (
                            <span style={{ fontSize: '2rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                                {(selectedSize ? selectedSize.price : product.price).toLocaleString()} TL
                            </span>
                        )}
                        <span style={{ fontSize: '0.9rem', color: '#25D366', backgroundColor: 'rgba(37, 211, 102, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '4px', fontWeight: 500 }}>
                            Hızlı Sipariş
                        </span>
                    </div>

                    <p style={{ lineHeight: '1.8', color: '#555', marginBottom: '2rem', fontSize: '1.05rem', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', padding: '1.5rem 0' }}>
                        {getLocalized(product.description)}
                    </p>

                    {/* Variant Selectors - Rows */}
                    <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e9ecef', overflow: 'hidden' }}>
                        {/* Size Row */}
                        <div
                            onClick={() => product.variants && product.variants.length > 0 && setOpenModal('size')}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem 1.25rem',
                                cursor: product.variants && product.variants.length > 0 ? 'pointer' : 'default',
                                borderBottom: ((product.fabrics && product.fabrics.length > 0) || (product.legs && product.legs.length > 0)) ? '1px solid #e9ecef' : 'none',
                                transition: 'background-color 0.2s',
                                opacity: product.variants && product.variants.length > 0 ? 1 : 0.5
                            }}
                            onMouseEnter={(e) => {
                                if (product.variants && product.variants.length > 0) {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (product.variants && product.variants.length > 0) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <span style={{ fontSize: '0.95rem', color: '#212529', fontWeight: 400 }}>Boyut</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '0.95rem', color: '#212529', fontWeight: 400 }}>
                                    {selectedSize ? (() => {
                                        const width = parseInt(selectedSize.size.split('×')[0] || selectedSize.size.split('x')[0] || '0');
                                        const isDouble = width > 120;
                                        const label = isDouble ? 'Çift Kişilik' : 'Tek Kişilik';
                                        return `${label} - ${selectedSize.size} cm`;
                                    })() : 'Seçiniz'}
                                </span>
                                {product.variants && product.variants.length > 0 && (
                                    <ArrowLeft size={16} style={{ transform: 'rotate(180deg)', color: '#6c757d' }} />
                                )}
                            </div>
                        </div>

                        {/* Fabric Row */}
                        <div
                            onClick={() => product.fabrics && product.fabrics.length > 0 && setOpenModal('fabric')}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem 1.25rem',
                                cursor: product.fabrics && product.fabrics.length > 0 ? 'pointer' : 'default',
                                borderBottom: product.legs && product.legs.length > 0 ? '1px solid #e9ecef' : 'none',
                                transition: 'background-color 0.2s',
                                opacity: product.fabrics && product.fabrics.length > 0 ? 1 : 0.5
                            }}
                            onMouseEnter={(e) => {
                                if (product.fabrics && product.fabrics.length > 0) {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (product.fabrics && product.fabrics.length > 0) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <span style={{ fontSize: '0.95rem', color: '#212529', fontWeight: 400 }}>Kumaş Türü & Renk</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {selectedFabric && (
                                    <>
                                        <span style={{ fontSize: '0.95rem', color: '#212529', fontWeight: 400 }}>
                                            {selectedFabric}
                                        </span>
                                        {/* Color Swatch */}
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            border: '1px solid #dee2e6',
                                            backgroundColor: (() => {
                                                // Extract color from fabric string or use default
                                                const colorMap: { [key: string]: string } = {
                                                    'Koyu Gri': '#4a5568',
                                                    'Gri': '#9ca3af',
                                                    'Açık Gri': '#e5e7eb',
                                                    'Beyaz': '#ffffff',
                                                    'Siyah': '#1a1a1a',
                                                    'Bej': '#f5f5dc',
                                                    'Kahverengi': '#8b4513',
                                                    'Antrasit': '#2d3748'
                                                };
                                                for (const [key, value] of Object.entries(colorMap)) {
                                                    if (selectedFabric.toLowerCase().includes(key.toLowerCase())) {
                                                        return value;
                                                    }
                                                }
                                                return '#9ca3af'; // Default grey
                                            })(),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 0 0 1px rgba(0,0,0,0.1) inset'
                                        }} />
                                    </>
                                )}
                                {!selectedFabric && <span style={{ fontSize: '0.95rem', color: '#6c757d', fontWeight: 400 }}>Seçiniz</span>}
                                {product.fabrics && product.fabrics.length > 0 && (
                                    <ArrowLeft size={16} style={{ transform: 'rotate(180deg)', color: '#6c757d' }} />
                                )}
                            </div>
                        </div>

                        {/* Leg Row */}
                        <div
                            onClick={() => product.legs && product.legs.length > 0 && setOpenModal('leg')}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem 1.25rem',
                                cursor: product.legs && product.legs.length > 0 ? 'pointer' : 'default',
                                transition: 'background-color 0.2s',
                                opacity: product.legs && product.legs.length > 0 ? 1 : 0.5
                            }}
                            onMouseEnter={(e) => {
                                if (product.legs && product.legs.length > 0) {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (product.legs && product.legs.length > 0) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <span style={{ fontSize: '0.95rem', color: '#212529', fontWeight: 400 }}>Ayak Malzemesi & Ayak Rengi</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {selectedLeg && (
                                    <>
                                        <span style={{ fontSize: '0.95rem', color: '#212529', fontWeight: 400 }}>
                                            {selectedLeg}
                                        </span>
                                        {/* Color Swatch */}
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            border: '1px solid #dee2e6',
                                            backgroundColor: (() => {
                                                // Extract color from leg string or use default
                                                const colorMap: { [key: string]: string } = {
                                                    'Antrasit': '#2d3748',
                                                    'Siyah': '#1a1a1a',
                                                    'Beyaz': '#ffffff',
                                                    'Gri': '#9ca3af',
                                                    'Koyu Gri': '#4a5568',
                                                    'Kahverengi': '#8b4513',
                                                    'Altın': '#d4af37',
                                                    'Gümüş': '#c0c0c0'
                                                };
                                                for (const [key, value] of Object.entries(colorMap)) {
                                                    if (selectedLeg.toLowerCase().includes(key.toLowerCase())) {
                                                        return value;
                                                    }
                                                }
                                                return '#2d3748'; // Default dark grey/anthracite
                                            })(),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 0 0 1px rgba(0,0,0,0.1) inset'
                                        }} />
                                    </>
                                )}
                                {!selectedLeg && <span style={{ fontSize: '0.95rem', color: '#6c757d', fontWeight: 400 }}>Seçiniz</span>}
                                {product.legs && product.legs.length > 0 && (
                                    <ArrowLeft size={16} style={{ transform: 'rotate(180deg)', color: '#6c757d' }} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Modals */}
                    {openModal && (
                        <>
                            <div
                                onClick={() => setOpenModal(null)}
                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99 }}
                            />
                            <div style={{
                                position: 'fixed',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                backgroundColor: 'white',
                                borderTopLeftRadius: '20px',
                                borderTopRightRadius: '20px',
                                padding: '1.5rem',
                                zIndex: 100,
                                maxHeight: '70vh',
                                overflowY: 'auto',
                                boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
                                animation: 'slideUp 0.3s ease-out'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                                        {openModal === 'size' && 'Boyut Seçin'}
                                        {openModal === 'fabric' && 'Kumaş Seçin'}
                                        {openModal === 'leg' && 'Ayak Seçin'}
                                    </h3>
                                    <button onClick={() => setOpenModal(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#666' }}>✕</button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {openModal === 'size' && product.variants?.map((v, i) => {
                                        // Simple heuristic for Label (Tek/Çift)
                                        const width = parseInt(v.size.split('x')[0] || '0');
                                        const isDouble = width > 120;
                                        const label = isDouble ? 'Çift Kişilik' : 'Tek Kişilik';

                                        return (
                                            <div
                                                key={i}
                                                onClick={() => { setSelectedSize(v); setOpenModal(null); }}
                                                style={{
                                                    padding: '1.2rem 0',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    {/* Radio Circle */}
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        border: selectedSize?.size === v.size ? '6px solid #262626' : '2px solid #ddd',
                                                        backgroundColor: 'white'
                                                    }} />

                                                    {/* Icon */}
                                                    <div style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        borderRadius: '12px',
                                                        border: '1px solid #eee',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: '#fff'
                                                    }}>
                                                        {/* Simple SVG Bed Icon */}
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M2 19h20" />
                                                            <path d="M2 15h20" />
                                                            <path d="M2 9v11" />
                                                            <path d="M22 9v11" />
                                                            <path d="M4 9V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" />
                                                            {isDouble && <path d="M12 4v5" />}
                                                        </svg>
                                                    </div>

                                                    {/* Text Info */}
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: 600, color: '#262626', fontSize: '0.95rem' }}>{label}</span>
                                                        <span style={{ fontSize: '0.85rem', color: '#666' }}>{v.size} cm</span>
                                                    </div>
                                                </div>

                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{ fontWeight: 600, color: '#262626', fontSize: '1rem' }}>{v.price.toLocaleString()} TL</span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {openModal === 'fabric' && product.fabrics?.map((f, i) => {
                                        const getColorFromFabric = (fabric: string): string => {
                                            const colorMap: { [key: string]: string } = {
                                                'Koyu Gri': '#4a5568',
                                                'Gri': '#9ca3af',
                                                'Açık Gri': '#e5e7eb',
                                                'Beyaz': '#ffffff',
                                                'Siyah': '#1a1a1a',
                                                'Bej': '#f5f5dc',
                                                'Kahverengi': '#8b4513',
                                                'Antrasit': '#2d3748'
                                            };
                                            for (const [key, value] of Object.entries(colorMap)) {
                                                if (fabric.toLowerCase().includes(key.toLowerCase())) {
                                                    return value;
                                                }
                                            }
                                            return '#9ca3af';
                                        };
                                        const fabricColor = getColorFromFabric(f);

                                        return (
                                            <div
                                                key={i}
                                                onClick={() => { setSelectedFabric(f); setOpenModal(null); }}
                                                style={{
                                                    padding: '1.2rem',
                                                    border: selectedFabric === f ? '2px solid #212529' : '1px solid #e9ecef',
                                                    borderRadius: '8px',
                                                    backgroundColor: selectedFabric === f ? '#f8f9fa' : '#fff',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (selectedFabric !== f) {
                                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (selectedFabric !== f) {
                                                        e.currentTarget.style.backgroundColor = '#fff';
                                                    }
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    {/* Radio Circle */}
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        border: selectedFabric === f ? '6px solid #212529' : '2px solid #dee2e6',
                                                        backgroundColor: 'white'
                                                    }} />

                                                    {/* Color Swatch */}
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        border: '1px solid #dee2e6',
                                                        backgroundColor: fabricColor,
                                                        boxShadow: '0 0 0 1px rgba(0,0,0,0.1) inset'
                                                    }} />

                                                    {/* Text */}
                                                    <span style={{
                                                        fontSize: '0.95rem',
                                                        color: '#212529',
                                                        fontWeight: selectedFabric === f ? 500 : 400
                                                    }}>
                                                        {f}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {openModal === 'leg' && product.legs?.map((l, i) => {
                                        const getColorFromLeg = (leg: string): string => {
                                            const colorMap: { [key: string]: string } = {
                                                'Antrasit': '#2d3748',
                                                'Siyah': '#1a1a1a',
                                                'Beyaz': '#ffffff',
                                                'Gri': '#9ca3af',
                                                'Koyu Gri': '#4a5568',
                                                'Kahverengi': '#8b4513',
                                                'Altın': '#d4af37',
                                                'Gümüş': '#c0c0c0'
                                            };
                                            for (const [key, value] of Object.entries(colorMap)) {
                                                if (leg.toLowerCase().includes(key.toLowerCase())) {
                                                    return value;
                                                }
                                            }
                                            return '#2d3748';
                                        };
                                        const legColor = getColorFromLeg(l);

                                        // Parse material and color from string like "Plastik - Antrasit"
                                        // const parts = l.split(' - ');
                                        // const material = parts[0] || l;
                                        // const color = parts[1] || '';

                                        return (
                                            <div
                                                key={i}
                                                onClick={() => { setSelectedLeg(l); setOpenModal(null); }}
                                                style={{
                                                    padding: '1.2rem',
                                                    border: selectedLeg === l ? '2px solid #212529' : '1px solid #e9ecef',
                                                    borderRadius: '8px',
                                                    backgroundColor: selectedLeg === l ? '#f8f9fa' : '#fff',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (selectedLeg !== l) {
                                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (selectedLeg !== l) {
                                                        e.currentTarget.style.backgroundColor = '#fff';
                                                    }
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    {/* Radio Circle */}
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        border: selectedLeg === l ? '6px solid #212529' : '2px solid #dee2e6',
                                                        backgroundColor: 'white'
                                                    }} />

                                                    {/* Color Swatch */}
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        border: '1px solid #dee2e6',
                                                        backgroundColor: legColor,
                                                        boxShadow: '0 0 0 1px rgba(0,0,0,0.1) inset'
                                                    }} />

                                                    {/* Text */}
                                                    <span style={{
                                                        fontSize: '0.95rem',
                                                        color: '#212529',
                                                        fontWeight: selectedLeg === l ? 500 : 400
                                                    }}>
                                                        {l}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Features */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Truck size={20} color="var(--color-primary)" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600, color: '#333' }}>{getLocalized(deliveryInfo)}</span>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>{t('common.deliveryDesc', { defaultValue: 'Tüm şehre gönderim' })}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ShieldCheck size={20} color="var(--color-primary)" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600, color: '#333' }}>{getLocalized(warrantyInfo)}</span>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>{t('common.warrantyDesc', { defaultValue: 'Resmi üretici garantisi' })}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
                        <button
                            onClick={() => {
                                addToCart(product, 1, {
                                    selectedSize: selectedSize || undefined,
                                    selectedFabric: selectedFabric || undefined,
                                    selectedLeg: selectedLeg || undefined
                                });
                            }}
                            style={{
                                padding: '1.2rem',
                                backgroundColor: '#1a1a1a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.8rem',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s',
                                width: '100%'
                            }}
                            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.backgroundColor = '#333'; }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.backgroundColor = '#1a1a1a'; }}
                        >
                            <ShoppingCart size={20} />
                            {t('common.addToCart')}
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
                            <button
                                onClick={() => {
                                    addToCart(product, 1, {
                                        selectedSize: selectedSize || undefined,
                                        selectedFabric: selectedFabric || undefined,
                                        selectedLeg: selectedLeg || undefined
                                    });
                                    navigate('/checkout');
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '1rem',
                                    backgroundColor: '#fff',
                                    border: '1px solid #1e293b',
                                    borderRadius: '8px',
                                    color: '#1e293b',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                <CreditCard size={18} />
                                {t('cart.checkout')}
                            </button>

                            <button
                                onClick={handleShare}
                                title={t('common.share')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '50px',
                                    backgroundColor: '#f8f9fa',
                                    color: '#212529',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = '#e9ecef';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Toast Notification */}
                    <AnimatePresence>
                        {showToast && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                style={{
                                    position: 'fixed',
                                    bottom: '30px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: '#212529',
                                    color: 'white',
                                    padding: '0.8rem 1.5rem',
                                    borderRadius: '30px',
                                    zIndex: 3000,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <span style={{ fontSize: '0.9rem' }}>{t('common.linkCopied')}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Reviews Section */}
            <div style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid #eee' }}>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Review List */}
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.6rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#222' }}>
                            <MessageSquare size={24} /> {t('common.reviews') || 'Müşteri Değerlendirmeleri'}
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {reviews.slice(0, 3).map((review) => (
                                <div key={review.id} style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                                        <div>
                                            <span style={{ fontWeight: 600, color: '#333', fontSize: '1rem' }}>{review.user_name}</span>
                                            <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} fill={i < review.rating ? "#d4af37" : "none"} color={i < review.rating ? "#d4af37" : "#ddd"} />
                                                ))}
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(review.created_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : (i18n.language === 'tr' ? 'tr-TR' : 'en-US'))}</span>
                                    </div>
                                    <p style={{ color: '#555', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>{review.comment}</p>
                                </div>
                            ))}

                            {reviews.length > 3 && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsReviewsModalOpen(true);
                                    }}
                                    style={{
                                        alignSelf: 'center',
                                        padding: '0.8rem 2rem',
                                        borderRadius: '30px',
                                        border: '1px solid #ddd',
                                        background: 'transparent',
                                        color: '#666',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        marginTop: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                        e.currentTarget.style.borderColor = '#999';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = '#ddd';
                                    }}
                                >
                                    {`${t('common.viewAll') || (i18n.language === 'ar' ? 'عرض الكل' : 'Hepsini Gör')} (${reviews.length})`}
                                </button>
                            )}

                            {reviews.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fafafa', borderRadius: '12px', color: '#888' }}>
                                    {t('common.noReviews') || 'Henüz bu ürün için değerlendirme yapılmamış.'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Review Form */}
                    <div style={{ width: isMobile ? '100%' : '380px' }}>
                        <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', position: 'sticky', top: '100px' }}>
                            <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 700 }}>{t('common.addReview') || 'Değerlendirme Yaz'}</h4>

                            {reviewMessage ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ padding: '1.5rem', backgroundColor: reviewMessage.type === 'success' ? '#f6ffed' : '#fff2f0', border: `1px solid ${reviewMessage.type === 'success' ? '#b7eb8f' : '#ffccc7'}`, borderRadius: '8px', textAlign: 'center' }}
                                >
                                    {reviewMessage.type === 'success' ? <CheckCircle size={32} color="#52c41a" style={{ marginBottom: '0.8rem' }} /> : null}
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#333' }}>{reviewMessage.text}</p>
                                    {reviewMessage.type === 'success' && (
                                        <button
                                            onClick={() => setReviewMessage(null)}
                                            style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#1a1a1a', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            {t('common.close') || 'Kapat'}
                                        </button>
                                    )}
                                </motion.div>
                            ) : (
                                <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    {isAuthenticated ? (
                                        <div style={{ padding: '1rem', backgroundColor: '#f0f7ff', borderRadius: '12px', border: '1px solid #bae7ff', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <div style={{ backgroundColor: '#1890ff', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CheckCircle size={16} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#0050b3', fontWeight: 600, textTransform: 'uppercase' }}>{t('common.verifiedAccount') || 'Doğrulanmış Hesap'}</div>
                                                <div style={{ fontSize: '0.95rem', color: '#002766', fontWeight: 700 }}>{user?.user_metadata?.full_name || user?.email}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#444' }}>{t('common.name') || 'Adınız'}</label>
                                            <input
                                                type="text"
                                                required
                                                value={reviewForm.name}
                                                onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem' }}
                                                placeholder={t('common.yourName') || 'Adınız Soyadınız'}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#444' }}>{t('common.rating') || 'Puanınız'}</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                                                >
                                                    <Star size={24} fill={star <= reviewForm.rating ? "#d4af37" : "none"} color={star <= reviewForm.rating ? "#d4af37" : "#ddd"} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#444' }}>{t('common.comment') || 'Yorumunuz'}</label>
                                        <textarea
                                            required
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                            rows={4}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', resize: 'none' }}
                                            placeholder={t('common.yourComment') || 'Ürün hakkındaki görüşleriniz...'}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submittingReview}
                                        style={{
                                            padding: '1rem',
                                            backgroundColor: '#1a1a1a',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            cursor: submittingReview ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            transition: 'opacity 0.2s'
                                        }}
                                    >
                                        {submittingReview ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>⏳</motion.div> : <Send size={18} />}
                                        {t('common.submitReview') || 'Değerlendirmeyi Gönder'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            <div style={{ marginTop: '6rem', paddingTop: '3rem', borderTop: '1px solid #eee' }}>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '2.5rem', textAlign: 'center', color: '#222', fontFamily: "'Playfair Display', serif" }}>
                    Benzer Ürünler
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                    {products
                        .filter(p => p.category === product.category && p.id !== product.id)
                        .slice(0, 3)
                        .map(related => (
                            <div
                                key={related.id}
                                style={{
                                    cursor: 'pointer',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s',
                                    backgroundColor: '#fff',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                                }}
                                onClick={() => navigate(`/ product / ${related.id} `)}
                                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)'; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'; }}
                            >
                                <div style={{ height: '220px', position: 'relative' }}>
                                    <img src={getOptimizedUrl(related.images?.[0], 400, 400)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ padding: '1.2rem' }}>
                                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#999', letterSpacing: '0.5px' }}>{related.category}</span>
                                    <h4 style={{ margin: '0.3rem 0 0.8rem', fontSize: '1.1rem', color: '#333' }}>{getLocalized(related.title)}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {related.discountPrice && related.discountPrice < related.price ? (
                                                <>
                                                    <p style={{ color: '#cf1322', fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>{related.discountPrice.toLocaleString()} TL</p>
                                                    <p style={{ color: '#999', fontSize: '0.8rem', textDecoration: 'line-through', margin: 0 }}>{related.price.toLocaleString()} TL</p>
                                                </>
                                            ) : (
                                                <p style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>{related.price.toLocaleString()} TL</p>
                                            )}
                                        </div>
                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
                                            <ShoppingCart size={14} color="#666" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
            {/* Reviews Modal */}
            <AnimatePresence>
                {isReviewsModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 9999,
                            padding: '20px',
                            backdropFilter: 'blur(5px)'
                        }}
                        onClick={() => setIsReviewsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={{
                                backgroundColor: 'white',
                                width: '100%',
                                maxWidth: '600px',
                                maxHeight: '80vh',
                                borderRadius: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#1a1a1a' }}>
                                    {t('common.reviews') || 'Değerlendirmeler'} ({reviews.length})
                                </h3>
                                <button
                                    onClick={() => setIsReviewsModalOpen(false)}
                                    style={{ background: '#f5f5f5', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eee'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                >
                                    <ArrowLeft size={20} style={{ transform: i18n.language === 'ar' ? 'scaleX(-1)' : 'none' }} />
                                </button>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {reviews.map((review) => (
                                        <div key={review.id} style={{ padding: '1.5rem', backgroundColor: '#fcfcfc', borderRadius: '16px', border: '1px solid #f0f0f0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                                                <div>
                                                    <span style={{ fontWeight: 600, color: '#333', fontSize: '1rem' }}>{review.user_name}</span>
                                                    <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < review.rating ? "#d4af37" : "none"} color={i < review.rating ? "#d4af37" : "#ddd"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(review.created_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : (i18n.language === 'tr' ? 'tr-TR' : 'en-US'))}</span>
                                            </div>
                                            <p style={{ color: '#555', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #eee', textAlign: 'center', backgroundColor: '#fafafa' }}>
                                <button
                                    onClick={() => setIsReviewsModalOpen(false)}
                                    style={{ padding: '0.8rem 2.5rem', backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#333'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                                >
                                    {t('common.close') || 'Kapat'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductDetails;
