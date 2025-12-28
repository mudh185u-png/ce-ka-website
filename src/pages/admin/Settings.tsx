import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase';
import { Save, Video, Upload, CheckCircle, AlertCircle, Info, Phone, ShoppingCart, FileText } from 'lucide-react';

interface LocalizedText {
    tr: string;
    ar: string;
    en: string;
}

interface SiteSettings {
    hero_video: {
        url: string;
        title: LocalizedText;
        subtitle: LocalizedText;
    };
    contact_info: {
        address: string;
        phone: string;
        email: string;
        whatsapp: string;
        map_url: string;
        copyright: string;
    };
    social_links: {
        instagram: string;
        facebook: string;
        twitter: string;
        youtube: string;
    };
    about_us: {
        imageUrl: string;
        title: LocalizedText;
        description: LocalizedText;
    };
    product_settings: {
        delivery: LocalizedText;
        warranty: LocalizedText;
    };
    invoice_settings: {
        logo_url: string;
        company_name: string;
        company_address: string;
        company_phone: string;
        company_email: string;
        tax_info: string;
        footer_text: string;
    };
}

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'contact' | 'products' | 'invoice'>('hero');
    const [settings, setSettings] = useState<SiteSettings>({
        hero_video: {
            url: '',
            title: { tr: '', ar: '', en: '' },
            subtitle: { tr: '', ar: '', en: '' }
        },
        contact_info: { address: '', phone: '', email: '', whatsapp: '', map_url: '', copyright: '' },
        social_links: { instagram: '', facebook: '', twitter: '', youtube: '' },
        about_us: {
            imageUrl: '',
            title: { tr: '', ar: '', en: '' },
            description: { tr: '', ar: '', en: '' }
        },
        product_settings: {
            delivery: { tr: '', ar: '', en: '' },
            warranty: { tr: '', ar: '', en: '' }
        },
        invoice_settings: {
            logo_url: '',
            company_name: 'Ce Ka Baza',
            company_address: '',
            company_phone: '',
            company_email: '',
            tax_info: '',
            footer_text: 'Bizi tercih ettiğiniz için teşekkür ederiz!'
        }
    });

    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Safe helper to get localized text
    const getVal = (obj: any, key: string, lang: 'tr' | 'ar' | 'en') => {
        if (!obj || typeof obj !== 'object') return '';
        const val = obj[key];
        return (val as LocalizedText)?.[lang] || '';
    };

    const fetchSettings = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*');

            if (error) throw error;

            if (data) {
                setSettings(prev => {
                    const next = { ...prev };
                    data.forEach((item: { key: string; value: any }) => {
                        const key = item.key as keyof SiteSettings;
                        if (key in next) {
                            if (typeof item.value === 'object' && item.value !== null) {
                                (next as any)[key] = {
                                    ...(next as any)[key],
                                    ...item.value
                                };
                            } else {
                                (next as any)[key] = item.value;
                            }
                        }
                    });
                    return next;
                });
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, bucket: string, path: string, settingsKey: string, nestedKey?: string) => {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            setUploading(true);
            setMessage(null);

            const fileExt = file.name.split('.').pop();
            const fileName = `${settingsKey}-${nestedKey || ''}-${Date.now()}.${fileExt}`;
            const filePath = `${path}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            setSettings(prev => {
                const next = { ...prev };
                const section = (next as any)[settingsKey];
                if (section && typeof section === 'object') {
                    if (nestedKey) {
                        (section as any)[nestedKey] = publicUrl;
                    } else {
                        (section as any).url = publicUrl;
                    }
                }
                return next;
            });

            setMessage({ text: 'Dosya başarıyla yüklendi! Lütfen "Kaydet" butonuna tıklayarak değişiklikleri kalıcı hale getirin.', type: 'success' });
        } catch (err: any) {
            console.error('Upload Error:', err);
            setMessage({ text: `Yükleme hatası: ${err.message}`, type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const keysToSave = Object.keys(settings) as (keyof SiteSettings)[];
            const promises = keysToSave.map(key => {
                return supabase
                    .from('site_settings')
                    .upsert({
                        key,
                        value: settings[key],
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'key' });
            });

            const results = await Promise.all(promises);
            const firstError = results.find(r => r.error);
            if (firstError) throw firstError.error;

            setMessage({ text: 'Ayarlar başarıyla kaydedildi.', type: 'success' });
        } catch (err) {
            console.error('Error saving settings:', err);
            setMessage({ text: 'Ayarlar kaydedilirken bir hata oluştu.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            <div style={{ margin: '0 auto 1rem', width: '24px', height: '24px', border: '3px solid #eee', borderTopColor: '#1a1a1a', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            Yükleniyor...
        </div>
    );

    const tabStyle = (active: boolean) => ({
        padding: '1rem 2rem',
        cursor: 'pointer',
        borderBottom: active ? '3px solid #1a1a1a' : '3px solid transparent',
        color: active ? '#1a1a1a' : '#8c8c8c',
        fontWeight: active ? 600 : 500,
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem'
    });

    const fieldGroupStyle = {
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '12px',
        border: '1px solid #eee'
    };

    const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#444', fontSize: '0.9rem' };
    const inputStyle = {
        width: '100%',
        padding: '0.8rem',
        borderRadius: '8px',
        border: '1px solid #d9d9d9',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.3s'
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.5rem' }}>Site Ayarları</h1>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>Sitenizin genel içerik ve iletişim bilgilerini buradan yönetin.</p>
            </div>

            {message && (
                <div style={{
                    padding: '1.2rem',
                    marginBottom: '2rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    backgroundColor: message.type === 'success' ? '#f6ffed' : '#fff2f0',
                    border: `1px solid ${message.type === 'success' ? '#b7eb8f' : '#ffccc7'}`,
                    color: message.type === 'success' ? '#52c41a' : '#ff4d4f',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span style={{ fontWeight: 500 }}>{message.text}</span>
                </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #eef0f2', overflow: 'hidden' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #eee', backgroundColor: '#fafafa', padding: '0 1.5rem' }}>
                    <div style={tabStyle(activeTab === 'hero')} onClick={() => setActiveTab('hero')}><Video size={18} /> Ana Sayfa</div>
                    <div style={tabStyle(activeTab === 'about')} onClick={() => setActiveTab('about')}><Info size={18} /> Kurumsal</div>
                    <div style={tabStyle(activeTab === 'contact')} onClick={() => setActiveTab('contact')}><Phone size={18} /> İletişim</div>
                    <div style={tabStyle(activeTab === 'products')} onClick={() => setActiveTab('products')}><ShoppingCart size={18} /> Ürün Bilgileri</div>
                    <div style={tabStyle(activeTab === 'invoice')} onClick={() => setActiveTab('invoice')}><FileText size={18} /> Fatura Ayarları</div>
                </div>

                <div style={{ padding: '2.5rem' }}>
                    {/* Hero Tab */}
                    {activeTab === 'hero' && (
                        <div>
                            <div style={{ ...fieldGroupStyle, border: '2px solid #D4AF37', backgroundColor: '#fffdf5' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#856404' }}>
                                    <Info size={20} /> Banner Metinleri
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div>
                                        <label style={labelStyle}>Ana Başlık</label>
                                        <input type="text" value={getVal(settings.hero_video, 'title', 'tr')} onChange={(e) => setSettings({ ...settings, hero_video: { ...settings.hero_video, title: { ...settings.hero_video.title, tr: e.target.value } } })} style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder="Türkçe" />
                                        <input dir="rtl" type="text" value={getVal(settings.hero_video, 'title', 'ar')} onChange={(e) => setSettings({ ...settings, hero_video: { ...settings.hero_video, title: { ...settings.hero_video.title, ar: e.target.value } } })} style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder="العربية" />
                                        <input type="text" value={getVal(settings.hero_video, 'title', 'en')} onChange={(e) => setSettings({ ...settings, hero_video: { ...settings.hero_video, title: { ...settings.hero_video.title, en: e.target.value } } })} style={inputStyle} placeholder="English" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Alt Başlık</label>
                                        <input type="text" value={getVal(settings.hero_video, 'subtitle', 'tr')} onChange={(e) => setSettings({ ...settings, hero_video: { ...settings.hero_video, subtitle: { ...settings.hero_video.subtitle, tr: e.target.value } } })} style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder="Türkçe" />
                                        <input dir="rtl" type="text" value={getVal(settings.hero_video, 'subtitle', 'ar')} onChange={(e) => setSettings({ ...settings, hero_video: { ...settings.hero_video, subtitle: { ...settings.hero_video.subtitle, ar: e.target.value } } })} style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder="العربية" />
                                        <input type="text" value={getVal(settings.hero_video, 'subtitle', 'en')} onChange={(e) => setSettings({ ...settings, hero_video: { ...settings.hero_video, subtitle: { ...settings.hero_video.subtitle, en: e.target.value } } })} style={inputStyle} placeholder="English" />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginTop: '2rem' }}>
                                <div>
                                    <label style={labelStyle}>Ana Sayfa Videosu</label>
                                    <div style={{ border: '2px dashed #d9d9d9', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', backgroundColor: '#fafafa', position: 'relative' }}>
                                        <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'content', 'hero', 'hero_video')} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                                        <Upload size={24} color="#8c8c8c" style={{ marginBottom: '0.5rem' }} />
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>{uploading ? 'Yükleniyor...' : 'Video Yükle'}</p>
                                    </div>
                                    <input type="text" value={settings.hero_video.url} onChange={(e) => setSettings({ ...settings, hero_video: { ...settings.hero_video, url: e.target.value } })} style={{ ...inputStyle, marginTop: '1rem' }} placeholder="Video URL" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Önizleme</label>
                                    <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden' }}>
                                        {settings.hero_video.url && <video src={settings.hero_video.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop playsInline />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Invoice Tab */}
                    {activeTab === 'invoice' && (
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <FileText size={20} /> Fatura Özelleştirme
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '3rem' }}>
                                <div>
                                    <label style={labelStyle}>Fatura Logosu</label>
                                    <div style={{ width: '100%', aspectRatio: '16/9', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                        {settings.invoice_settings.logo_url ? <img src={settings.invoice_settings.logo_url} alt="Logo" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} /> : <Upload size={32} color="#ccc" />}
                                        <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                                            <label style={{ backgroundColor: '#fff', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 10px 10px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
                                                <Upload size={16} />
                                                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'content', 'invoice', 'invoice_settings', 'logo_url')} style={{ display: 'none' }} />
                                            </label>
                                        </div>
                                    </div>
                                    <input type="text" value={settings.invoice_settings.logo_url} onChange={(e) => setSettings({ ...settings, invoice_settings: { ...settings.invoice_settings, logo_url: e.target.value } })} style={{ ...inputStyle, marginTop: '1rem' }} placeholder="Logo URL" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Şirket Ünvanı</label>
                                        <input type="text" value={settings.invoice_settings.company_name} onChange={(e) => setSettings({ ...settings, invoice_settings: { ...settings.invoice_settings, company_name: e.target.value } })} style={inputStyle} />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Adres</label>
                                        <textarea value={settings.invoice_settings.company_address} onChange={(e) => setSettings({ ...settings, invoice_settings: { ...settings.invoice_settings, company_address: e.target.value } })} style={{ ...inputStyle, height: '80px' }} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Telefon</label>
                                        <input type="text" value={settings.invoice_settings.company_phone} onChange={(e) => setSettings({ ...settings, invoice_settings: { ...settings.invoice_settings, company_phone: e.target.value } })} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>E-posta</label>
                                        <input type="text" value={settings.invoice_settings.company_email} onChange={(e) => setSettings({ ...settings, invoice_settings: { ...settings.invoice_settings, company_email: e.target.value } })} style={inputStyle} />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Vergi Bilgileri</label>
                                        <input type="text" value={settings.invoice_settings.tax_info} onChange={(e) => setSettings({ ...settings, invoice_settings: { ...settings.invoice_settings, tax_info: e.target.value } })} style={inputStyle} />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Alt Metin (Teşekkür)</label>
                                        <input type="text" value={settings.invoice_settings.footer_text} onChange={(e) => setSettings({ ...settings, invoice_settings: { ...settings.invoice_settings, footer_text: e.target.value } })} style={inputStyle} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* About Tab */}
                    {activeTab === 'about' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2.5rem' }}>
                            <div>
                                <label style={labelStyle}>Hakkımızda Görseli</label>
                                <div style={{ width: '100%', aspectRatio: '1/1', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                                    {settings.about_us.imageUrl ? <img src={settings.about_us.imageUrl} alt="About" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Upload size={32} color="#ccc" />}
                                    <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                                        <label style={{ backgroundColor: '#fff', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
                                            <Upload size={16} />
                                            <input type="file" onChange={(e) => handleFileUpload(e, 'content', 'about', 'about_us', 'imageUrl')} style={{ display: 'none' }} />
                                        </label>
                                    </div>
                                </div>
                                <input type="text" value={settings.about_us.imageUrl} onChange={(e) => setSettings({ ...settings, about_us: { ...settings.about_us, imageUrl: e.target.value } })} style={{ ...inputStyle, marginTop: '1rem' }} />
                            </div>
                            <div>
                                <div style={fieldGroupStyle}>
                                    <label style={labelStyle}>Başlık (TR)</label>
                                    <input type="text" value={settings.about_us.title.tr} onChange={(e) => setSettings({ ...settings, about_us: { ...settings.about_us, title: { ...settings.about_us.title, tr: e.target.value } } })} style={inputStyle} />
                                    <label style={{ ...labelStyle, marginTop: '1rem' }}>Açıklama (TR)</label>
                                    <textarea value={settings.about_us.description.tr} onChange={(e) => setSettings({ ...settings, about_us: { ...settings.about_us, description: { ...settings.about_us.description, tr: e.target.value } } })} style={{ ...inputStyle, height: '100px' }} />
                                </div>
                                <div style={fieldGroupStyle}>
                                    <label style={labelStyle}>Başlık (AR)</label>
                                    <input dir="rtl" type="text" value={settings.about_us.title.ar} onChange={(e) => setSettings({ ...settings, about_us: { ...settings.about_us, title: { ...settings.about_us.title, ar: e.target.value } } })} style={inputStyle} />
                                    <label style={{ ...labelStyle, marginTop: '1rem' }}>Açıklama (AR)</label>
                                    <textarea dir="rtl" value={settings.about_us.description.ar} onChange={(e) => setSettings({ ...settings, about_us: { ...settings.about_us, description: { ...settings.about_us.description, ar: e.target.value } } })} style={{ ...inputStyle, height: '100px' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Tab */}
                    {activeTab === 'contact' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                            <div>
                                <label style={labelStyle}>Adres</label>
                                <textarea value={settings.contact_info.address} onChange={(e) => setSettings({ ...settings, contact_info: { ...settings.contact_info, address: e.target.value } })} style={{ ...inputStyle, height: '80px' }} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>Telefon</label>
                                        <input type="text" value={settings.contact_info.phone} onChange={(e) => setSettings({ ...settings, contact_info: { ...settings.contact_info, phone: e.target.value } })} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>WhatsApp</label>
                                        <input type="text" value={settings.contact_info.whatsapp} onChange={(e) => setSettings({ ...settings, contact_info: { ...settings.contact_info, whatsapp: e.target.value } })} style={inputStyle} />
                                    </div>
                                </div>
                                <label style={{ ...labelStyle, marginTop: '1rem' }}>E-posta</label>
                                <input type="email" value={settings.contact_info.email} onChange={(e) => setSettings({ ...settings, contact_info: { ...settings.contact_info, email: e.target.value } })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Instagram</label>
                                <input type="text" value={settings.social_links.instagram} onChange={(e) => setSettings({ ...settings, social_links: { ...settings.social_links, instagram: e.target.value } })} style={inputStyle} />
                                <label style={{ ...labelStyle, marginTop: '1rem' }}>Facebook</label>
                                <input type="text" value={settings.social_links.facebook} onChange={(e) => setSettings({ ...settings, social_links: { ...settings.social_links, facebook: e.target.value } })} style={inputStyle} />
                                <label style={{ ...labelStyle, marginTop: '1rem' }}>Google Maps URL</label>
                                <input type="text" value={settings.contact_info.map_url} onChange={(e) => setSettings({ ...settings, contact_info: { ...settings.contact_info, map_url: e.target.value } })} style={inputStyle} />
                            </div>
                        </div>
                    )}

                    {/* Products Tab */}
                    {activeTab === 'products' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                            <div>
                                <h4 style={{ marginBottom: '1rem' }}>Teslimat Bilgisi</h4>
                                <input type="text" value={settings.product_settings.delivery.tr} onChange={(e) => setSettings({ ...settings, product_settings: { ...settings.product_settings, delivery: { ...settings.product_settings.delivery, tr: e.target.value } } })} style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder="Türkçe" />
                                <input dir="rtl" type="text" value={settings.product_settings.delivery.ar} onChange={(e) => setSettings({ ...settings, product_settings: { ...settings.product_settings, delivery: { ...settings.product_settings.delivery, ar: e.target.value } } })} style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder="العربية" />
                                <input type="text" value={settings.product_settings.delivery.en} onChange={(e) => setSettings({ ...settings, product_settings: { ...settings.product_settings, delivery: { ...settings.product_settings.delivery, en: e.target.value } } })} style={inputStyle} placeholder="English" />
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '1rem' }}>Garanti Bilgisi</h4>
                                <input type="text" value={settings.product_settings.warranty.tr} onChange={(e) => setSettings({ ...settings, product_settings: { ...settings.product_settings, warranty: { ...settings.product_settings.warranty, tr: e.target.value } } })} style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder="Türkçe" />
                                <input dir="rtl" type="text" value={settings.product_settings.warranty.ar} onChange={(e) => setSettings({ ...settings, product_settings: { ...settings.product_settings, warranty: { ...settings.product_settings.warranty, ar: e.target.value } } })} style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder="العربية" />
                                <input type="text" value={settings.product_settings.warranty.en} onChange={(e) => setSettings({ ...settings, product_settings: { ...settings.product_settings, warranty: { ...settings.product_settings.warranty, en: e.target.value } } })} style={inputStyle} placeholder="English" />
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ padding: '1.5rem 2.5rem', backgroundColor: '#fafafa', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={handleSave} disabled={saving || uploading} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', backgroundColor: '#1a1a1a', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
                        <Save size={18} /> {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
