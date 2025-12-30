import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useTranslation } from 'react-i18next';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

interface SiteSettingsState {
    contact_info?: {
        address?: string;
        phone?: string;
        email?: string;
        map_url?: string;
        copyright?: string;
    };
    social_links?: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
        youtube?: string;
    };
}

const Footer: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [settings, setSettings] = useState<SiteSettingsState | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('*')
                .in('key', ['contact_info', 'social_links']);

            if (data) {
                const map = data.reduce((acc: SiteSettingsState, item: { key: string; value: unknown }) => {
                    const key = item.key as keyof SiteSettingsState;
                    if (key === 'contact_info' || key === 'social_links') {
                        acc[key] = item.value as SiteSettingsState[typeof key];
                    }
                    return acc;
                }, {} as SiteSettingsState);
                setSettings(map);
            }
        };
        fetchSettings();
    }, []);

    const year = new Date().getFullYear();
    const contact = settings?.contact_info || {};
    const social = settings?.social_links || {};

    return (
        <footer style={{
            padding: '4rem 5% 2rem',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            borderTop: '1px solid #333'
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '3rem',
                marginBottom: '3rem'
            }}>
                {/* Brand Section */}
                <div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: "'Playfair Display', serif" }}>Ce & Ka</h3>
                    <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        {i18n.language === 'ar'
                            ? 'نحن نقدم أفضل الحلول للأثاث والأسرة بجودة عالية وتصميمات معاصرة.'
                            : 'Modern tasarımlar ve yüksek kalite ile en iyi mobilya çözümlerini sunuyoruz.'}
                    </p>
                </div>

                {/* Contact Info */}
                <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', fontWeight: 600 }}>{t('nav.contact') || 'İletيشim'}</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#aaa', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <li>
                            {contact.map_url ? (
                                <a href={contact.map_url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>
                                    {contact.address || 'Adres bilgisi eklenmemiş'}
                                </a>
                            ) : (
                                contact.address || 'Adres bilgisi eklenmemiş'
                            )}
                        </li>
                        <li>{contact.phone || 'Telefon bilgisi eklenmemiş'}</li>
                        <li>{contact.email || 'E-posta bilgisi eklenmemiş'}</li>
                    </ul>
                </div>

                {/* Social Links */}
                <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', fontWeight: 600 }}>{t('common.followUs') || 'Bizi Takip Edin'}</h4>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {social.instagram && (
                            <a href={social.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', opacity: 0.8 }} aria-label="Instagram">
                                <Instagram size={24} />
                            </a>
                        )}
                        {social.facebook && (
                            <a href={social.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', opacity: 0.8 }} aria-label="Facebook">
                                <Facebook size={24} />
                            </a>
                        )}
                        {social.twitter && (
                            <a href={social.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', opacity: 0.8 }} aria-label="Twitter">
                                <Twitter size={24} />
                            </a>
                        )}
                        {social.youtube && (
                            <a href={social.youtube} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', opacity: 0.8 }} aria-label="Youtube">
                                <Youtube size={24} />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div style={{
                paddingTop: '2rem',
                borderTop: '1px solid #333',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: '#666',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div>&copy; {year} {contact.copyright || 'Ce & Ka. Tüm hakları saklıdır.'}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>{t('policies.privacy.title')}</a>
                    <a href="/refund" style={{ color: 'inherit', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>{t('policies.refund.title')}</a>
                    <a href="/terms" style={{ color: 'inherit', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>{t('policies.terms.title')}</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
