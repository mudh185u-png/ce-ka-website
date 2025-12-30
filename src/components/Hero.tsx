import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase } from '../supabase';

const Hero: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [heroData, setHeroData] = useState<{
        url: string;
        title: { tr: string; ar: string; en: string };
        subtitle: { tr: string; ar: string; en: string };
    }>({
        url: 'https://cdn.coverr.co/videos/coverr-interior-design-presentation-5309/1080p.mp4',
        title: { tr: '', ar: '', en: '' },
        subtitle: { tr: '', ar: '', en: '' }
    });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const isRTL = i18n.dir() === 'rtl';

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);

        const fetchVideoSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'hero_video')
                .single();

            if (data?.value) {
                setHeroData({
                    url: data.value.url || heroData.url,
                    title: data.value.title || heroData.title,
                    subtitle: data.value.subtitle || heroData.subtitle
                });
            }
        };
        fetchVideoSettings();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const currentLang = i18n.language as 'tr' | 'en' | 'ar';

    return (
        <div style={{ padding: isMobile ? '0.5rem' : '1rem 2rem', backgroundColor: '#fdfdfd' }}>
            <section style={{
                position: 'relative',
                height: isMobile ? '50vh' : '65vh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isRTL ? 'flex-end' : 'flex-start',
                overflow: 'hidden',
                borderRadius: isMobile ? '12px' : '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                {/* Video Background */}
                <video
                    key={heroData.url} // Force reload when URL changes
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 0
                    }}
                >
                    <source src={heroData.url} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    zIndex: 1
                }} />

                <motion.div
                    initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1 }}
                    style={{
                        position: 'relative',
                        zIndex: 10,
                        padding: isMobile ? '0 1.5rem' : '0 8%',
                        maxWidth: '800px',
                        color: '#fff',
                        textAlign: isRTL ? 'right' : 'left'
                    }}
                >
                    <h1 style={{
                        fontSize: isMobile ? '2rem' : '3.5rem',
                        marginBottom: '1rem',
                        lineHeight: 1.2,
                        color: '#fff',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        fontFamily: '"Playfair Display", serif'
                    }}>
                        {heroData.title[currentLang] || t('hero.title')}
                    </h1>
                    <p style={{
                        fontSize: isMobile ? '0.95rem' : '1.2rem',
                        marginBottom: '2rem',
                        opacity: 0.95,
                        maxWidth: '600px',
                        lineHeight: 1.6
                    }}>
                        {heroData.subtitle[currentLang] || t('hero.subtitle')}
                    </p>
                    <button style={{
                        padding: isMobile ? '0.8rem 1.8rem' : '1rem 2.5rem',
                        fontSize: isMobile ? '0.95rem' : '1.1rem',
                        backgroundColor: '#D4AF37', // Gold color for contrast
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        borderRadius: '50px',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
                        }}
                    >
                        {t('hero.cta')}
                    </button>
                </motion.div>
            </section>
        </div>
    );
};

export default Hero;
