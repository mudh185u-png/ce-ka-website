import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabase';

interface AboutSettings {
    imageUrl?: string;
    title?: { [key: string]: string };
    description?: { [key: string]: string };
}

const About: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [settings, setSettings] = useState<AboutSettings | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);

        const fetchAbout = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'about_us')
                .single();
            if (data) setSettings(data.value);
        };
        fetchAbout();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const title = settings?.title?.[i18n.language] || settings?.title?.tr || t('about.title');
    const desc = settings?.description?.[i18n.language] || settings?.description?.tr || t('about.desc');
    const image = settings?.imageUrl || "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1000&auto=format&fit=crop";

    return (
        <section style={{ padding: isMobile ? '3rem 1.5rem' : '5rem 10%', backgroundColor: 'var(--color-bg)' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '2rem' : '4rem',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                <div style={{ flex: '1 1 300px' }}>
                    <img
                        src={image}
                        alt="Craftsmanship"
                        style={{ width: '100%', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                    />
                </div>
                <div style={{ flex: '1 1 300px', textAlign: isMobile ? 'center' : 'start' }}>
                    <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', marginBottom: '1.5rem', color: 'var(--color-secondary)' }}>
                        {title}
                    </h2>
                    <p style={{ fontSize: isMobile ? '1rem' : '1.1rem', lineHeight: '1.8', color: '#555', whiteSpace: 'pre-wrap' }}>
                        {desc}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default About;
