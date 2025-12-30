import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '../supabase';

interface ContactSettings {
    address?: string;
    phone?: string;
    email?: string;
    map_url?: string;
}

const Contact: React.FC = () => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<ContactSettings | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);

        const fetchContact = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'contact_info')
                .single();
            if (data) setSettings(data.value);
        };
        fetchContact();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const address = settings?.address || t('contact.address');
    const phone = settings?.phone || t('contact.phone');
    const email = settings?.email || t('contact.email');

    return (
        <section style={{ padding: isMobile ? '3rem 1.5rem' : '5rem 5%', backgroundColor: '#fff', color: 'var(--color-secondary)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: isMobile ? '2rem' : '3rem', fontSize: isMobile ? '1.8rem' : '2.5rem' }}>{t('contact.title')}</h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: isMobile ? '1.5rem' : '2rem',
                textAlign: 'center'
            }}>
                <a
                    href={settings?.map_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.8rem',
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: settings?.map_url ? 'pointer' : 'default',
                        transition: 'transform 0.2s',
                        padding: isMobile ? '1.5rem' : '0',
                        backgroundColor: isMobile ? '#f8f9fa' : 'transparent',
                        borderRadius: '16px',
                        border: isMobile ? '1px solid #eee' : 'none'
                    }}
                    onMouseEnter={(e) => settings?.map_url && (e.currentTarget.style.transform = 'translateY(-5px)')}
                    onMouseLeave={(e) => settings?.map_url && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                    <MapPin size={isMobile ? 32 : 40} color="var(--color-primary)" />
                    <p style={{ fontSize: isMobile ? '1rem' : '1.2rem', whiteSpace: 'pre-wrap', fontWeight: settings?.map_url ? 500 : 400 }}>
                        {address}
                        {settings?.map_url && (
                            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-primary)', marginTop: '0.5rem' }}>
                                {t('contact.viewOnMap') || 'Haritada Gör'} →
                            </span>
                        )}
                    </p>
                </a>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.8rem',
                    padding: isMobile ? '1.5rem' : '0',
                    backgroundColor: isMobile ? '#f8f9fa' : 'transparent',
                    borderRadius: '16px',
                    border: isMobile ? '1px solid #eee' : 'none'
                }}>
                    <Phone size={isMobile ? 32 : 40} color="var(--color-primary)" />
                    <p style={{ fontSize: isMobile ? '1rem' : '1.2rem' }}>{phone}</p>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.8rem',
                    padding: isMobile ? '1.5rem' : '0',
                    backgroundColor: isMobile ? '#f8f9fa' : 'transparent',
                    borderRadius: '16px',
                    border: isMobile ? '1px solid #eee' : 'none'
                }}>
                    <Mail size={isMobile ? 32 : 40} color="var(--color-primary)" />
                    <p style={{ fontSize: isMobile ? '1rem' : '1.2rem' }}>{email}</p>
                </div>
            </div>
        </section>
    );
};

export default Contact;
