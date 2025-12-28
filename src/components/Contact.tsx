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

    useEffect(() => {
        const fetchContact = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'contact_info')
                .single();
            if (data) setSettings(data.value);
        };
        fetchContact();
    }, []);

    const address = settings?.address || t('contact.address');
    const phone = settings?.phone || t('contact.phone');
    const email = settings?.email || t('contact.email');

    return (
        <section style={{ padding: '5rem 5%', backgroundColor: '#fff', color: 'var(--color-secondary)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>{t('contact.title')}</h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
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
                        gap: '1rem',
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: settings?.map_url ? 'pointer' : 'default',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => settings?.map_url && (e.currentTarget.style.transform = 'translateY(-5px)')}
                    onMouseLeave={(e) => settings?.map_url && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                    <MapPin size={40} color="var(--color-primary)" />
                    <p style={{ fontSize: '1.2rem', whiteSpace: 'pre-wrap', fontWeight: settings?.map_url ? 500 : 400 }}>
                        {address}
                        {settings?.map_url && (
                            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-primary)', marginTop: '0.5rem' }}>
                                {t('contact.viewOnMap') || 'Haritada Gör'} →
                            </span>
                        )}
                    </p>
                </a>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Phone size={40} color="var(--color-primary)" />
                    <p style={{ fontSize: '1.2rem' }}>{phone}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Mail size={40} color="var(--color-primary)" />
                    <p style={{ fontSize: '1.2rem' }}>{email}</p>
                </div>
            </div>
        </section>
    );
};

export default Contact;
