import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

interface LocalizedText {
    tr: string;
    ar: string;
    en: string;
}

interface WhatsAppSettings {
    enabled: boolean;
    phone_number: string;
    title: LocalizedText;
    welcome_message: LocalizedText;
    online_text: LocalizedText;
    powered_by: string;
}

const WhatsAppWidget: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [showHeaderMsg, setShowHeaderMsg] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [settings, setSettings] = useState<WhatsAppSettings>({
        enabled: true,
        phone_number: '905550000000',
        title: { tr: 'Ce & Ka', ar: 'Ce & Ka', en: 'Ce & Ka' },
        welcome_message: {
            tr: 'Merhaba! Size nasıl yardımcı olabiliriz?',
            ar: 'مرحباً! كيف يمكننا مساعدتك؟',
            en: 'Hello! How can we help you?'
        },
        online_text: { tr: 'Çevrimiçi', ar: 'متواجد الآن', en: 'Online' },
        powered_by: 'Ce & Ka'
    });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);

        const fetchSettings = async () => {
            console.log("WhatsAppWidget: Fetching settings...");
            try {
                const { data, error } = await supabase
                    .from('site_settings')
                    .select('value')
                    .eq('key', 'whatsapp_widget')
                    .single();

                if (error) {
                    console.warn("WhatsAppWidget: Fetch Error (using defaults):", error.message);
                    return;
                }

                if (data && data.value) {
                    console.log("WhatsAppWidget: Received data:", data.value);
                    const fetchedValue = data.value as any;

                    // Only update if fetchedValue is an object and contains expected fields
                    if (typeof fetchedValue === 'object') {
                        setSettings(prev => ({
                            ...prev,
                            ...fetchedValue,
                            // Ensure nested objects are merged correctly too
                            title: { ...(prev.title || {}), ...(fetchedValue.title || {}) },
                            welcome_message: { ...(prev.welcome_message || {}), ...(fetchedValue.welcome_message || {}) },
                            online_text: { ...(prev.online_text || {}), ...(fetchedValue.online_text || {}) },
                            // Strictly check for boolean false
                            enabled: fetchedValue.enabled === false ? false : true
                        }));
                    }
                } else {
                    console.log("WhatsAppWidget: No data found in DB, keeping defaults.");
                }
            } catch (err) {
                console.error("WhatsAppWidget: Critical error in fetch:", err);
            }
        };

        fetchSettings();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Show a floating "bubble" message after 5 seconds, and auto-hide after 15 seconds (longer)
    useEffect(() => {
        if (!settings.enabled || isOpen) {
            const t = setTimeout(() => setShowHeaderMsg(false), 0);
            return () => clearTimeout(t);
        }

        let hideTimer: any;
        const showTimer = setTimeout(() => {
            setShowHeaderMsg(true);
            hideTimer = setTimeout(() => {
                setShowHeaderMsg(false);
            }, 10000); // 10 seconds display
        }, 5000);

        return () => {
            clearTimeout(showTimer);
            if (hideTimer) clearTimeout(hideTimer);
        };
    }, [isOpen, settings.enabled]);

    if (!settings.enabled) return null;

    const handleChat = (dept: string) => {
        const currentLang = i18n.language as keyof LocalizedText;
        const msg = settings.welcome_message[currentLang] || settings.welcome_message.tr;
        const message = encodeURIComponent(`${msg} [${dept}]`);

        // Sanitize phone number: remove all non-numeric characters (spaces, +, -, etc.)
        const cleanNumber = settings.phone_number.replace(/\D/g, '');

        window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
        setIsOpen(false);
    };

    const currentLang = i18n.language as keyof LocalizedText;

    return (
        <div
            className="whatsapp-widget-container"
            style={{
                position: 'fixed',
                bottom: isMobile ? '2rem' : '2.5rem', // Slightly higher to avoid mobile bars
                right: i18n.language === 'ar' ? 'auto' : (isMobile ? '1.5rem' : '2rem'),
                left: i18n.language === 'ar' ? (isMobile ? '1.5rem' : '2rem') : 'auto',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: i18n.language === 'ar' ? 'flex-start' : 'flex-end',
                pointerEvents: 'none'
            }}
        >
            <AnimatePresence>
                {showHeaderMsg && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setIsOpen(true)}
                        style={{
                            backgroundColor: 'white',
                            padding: '0.8rem 1.2rem',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                            marginBottom: '1rem',
                            fontSize: '0.9rem',
                            position: 'relative',
                            maxWidth: '250px',
                            color: '#333',
                            pointerEvents: 'auto',
                            cursor: 'pointer',
                            border: '1px solid #f0f0f0'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            bottom: '-8px',
                            right: i18n.language === 'ar' ? 'auto' : '20px',
                            left: i18n.language === 'ar' ? '20px' : 'auto',
                            width: '16px',
                            height: '16px',
                            backgroundColor: 'white',
                            transform: 'rotate(45deg)',
                            boxShadow: '5px 5px 10px rgba(0,0,0,0.02)'
                        }} />
                        {settings.welcome_message[currentLang] || settings.welcome_message.tr}
                    </motion.div>
                )}

                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: i18n.language === 'ar' ? 'bottom left' : 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        style={{
                            backgroundColor: 'white',
                            width: 'min(320px, 85vw)',
                            borderRadius: '24px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                            overflow: 'hidden',
                            marginBottom: '1rem',
                            border: '1px solid #f0f0f0',
                            pointerEvents: 'auto'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                            padding: '1.25rem',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <MessageCircle size={22} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                                        {settings.title[currentLang] || settings.title.tr}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                        {settings.online_text[currentLang] || settings.online_text.tr}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '5px' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '1.5rem' }}>
                            <p style={{ margin: '0 0 1.25rem', fontSize: '0.9rem', color: '#666', lineHeight: '1.5' }}>
                                {settings.welcome_message[currentLang] || settings.welcome_message.tr}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button
                                    onClick={() => handleChat(t('whatsapp.sales'))}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.85rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #e9ecef',
                                        backgroundColor: '#f8f9fa',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        textAlign: i18n.language === 'ar' ? 'right' : 'left',
                                        width: '100%'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e9ecef'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                >
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('whatsapp.sales')}</span>
                                    <Send size={14} color="#25D366" style={{ transform: i18n.language === 'ar' ? 'scaleX(-1)' : 'none' }} />
                                </button>

                                <button
                                    onClick={() => handleChat(t('whatsapp.support'))}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.85rem 1rem',
                                        borderRadius: '12px',
                                        border: '1px solid #e9ecef',
                                        backgroundColor: '#f8f9fa',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        textAlign: i18n.language === 'ar' ? 'right' : 'left',
                                        width: '100%'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e9ecef'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                >
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('whatsapp.support')}</span>
                                    <Send size={14} color="#25D366" style={{ transform: i18n.language === 'ar' ? 'scaleX(-1)' : 'none' }} />
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.7rem', color: '#adb5bd', borderTop: '1px solid #f8f9fa' }}>
                            Powered by {settings.powered_by}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Float Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: isMobile ? '55px' : '65px',
                    height: isMobile ? '55px' : '65px',
                    borderRadius: '50%',
                    backgroundColor: '#25D366',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 30px rgba(37, 211, 102, 0.5)',
                    border: 'none',
                    cursor: 'pointer',
                    pointerEvents: 'auto' // CRITICAL FIX
                }}
            >
                {isOpen ? <X size={isMobile ? 24 : 30} /> : <MessageCircle size={isMobile ? 28 : 34} />}
            </motion.button>
        </div>
    );
};

export default WhatsAppWidget;
