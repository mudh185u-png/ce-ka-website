import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase';
import { Save, Video, Upload, CheckCircle, AlertCircle, Info, Phone, ShoppingCart, FileText, MessageCircle, Star, ShieldCheck } from 'lucide-react';

interface LocalizedText {
    tr: string;
    ar: string;
    en: string;
}

interface Review {
    id: string;
    product_id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
    status: 'pending' | 'approved' | 'rejected';
    products?: { title: LocalizedText };
}

interface WhatsAppSettings {
    enabled: boolean;
    phone_number: string;
    title: LocalizedText;
    welcome_message: LocalizedText;
    online_text: LocalizedText;
    powered_by: string;
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
    whatsapp_widget: WhatsAppSettings;
}

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'contact' | 'products' | 'invoice' | 'whatsapp' | 'admins' | 'reviews'>('hero');
    const [settings, setSettings] = useState<SiteSettings>({
        // ... (existing defaults)
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
        },
        whatsapp_widget: {
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
        }
    });

    const [admins, setAdmins] = useState<string[]>([]);
    const [allReviews, setAllReviews] = useState<Review[]>([]);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Safe helper to get localized text
    const getVal = (obj: unknown, key: string, lang: 'tr' | 'ar' | 'en') => {
        if (!obj || typeof obj !== 'object') return '';
        const val = (obj as Record<string, unknown>)[key] as LocalizedText | undefined;
        return val?.[lang] || '';
    };

    const fetchAdmins = async () => {
        try {
            const { data, error } = await supabase.from('admin_emails').select('email');
            if (error) throw error;
            if (data) setAdmins(data.map(a => a.email));
        } catch (err) {
            console.error('Error fetching admins:', err);
        }
    };

    const addAdmin = async () => {
        if (!newAdminEmail) return;
        try {
            const { error } = await supabase.from('admin_emails').insert({ email: newAdminEmail.trim() });
            if (error) throw error;
            setNewAdminEmail('');
            fetchAdmins();
            setMessage({ text: 'Yönetici başarıyla eklendi.', type: 'success' });
        } catch (err) {
            const error = err as Error;
            setMessage({ text: error.message || 'Hata oluştu.', type: 'error' });
        }
    };

    const removeAdmin = async (email: string) => {
        try {
            const { error } = await supabase.from('admin_emails').delete().eq('email', email);
            if (error) throw error;
            fetchAdmins();
            setMessage({ text: 'Yönetici kaldırıldı.', type: 'success' });
        } catch (err) {
            const error = err as Error;
            setMessage({ text: error.message || 'Hata oluştu.', type: 'error' });
        }
    };

    const fetchAllReviews = async () => {
        try {
            console.log("Checking admin status for reviews fetch...");
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            console.log("Current User:", currentUser?.email);

            if (!currentUser) {
                console.warn("No user logged in during reviews fetch.");
                return;
            }

            const { data, error } = await supabase
                .from('product_reviews')
                .select('*, products(title)')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase fetch error:', error);
                setMessage({ text: `Hata: ${error.message} (Admin yetkinizi kontrol edin)`, type: 'error' });
                return;
            }

            console.log("Successfully fetched reviews:", data?.length);
            if (data) setAllReviews(data);
        } catch (err) {
            const error = err as Error;
            console.error('Catch Error in FetchReviews:', error);
            setMessage({ text: error.message || 'Yorumlar yüklenirken bir hata oluştu.', type: 'error' });
        }
    };

    const updateReviewStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('product_reviews')
                .update({ status })
                .eq('id', id);
            if (error) throw error;
            fetchAllReviews();
            setMessage({ text: 'Yorum durumu güncellendi.', type: 'success' });
        } catch (err) {
            const error = err as Error;
            setMessage({ text: error.message || 'Hata oluştu.', type: 'error' });
        }
    };

    const deleteReview = async (id: string) => {
        if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
        try {
            const { error } = await supabase
                .from('product_reviews')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchAllReviews();
            setMessage({ text: 'Yorum silindi.', type: 'success' });
        } catch (err) {
            const error = err as Error;
            setMessage({ text: error.message || 'Hata oluştu.', type: 'error' });
        }
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
                    data.forEach((item: { key: string; value: unknown }) => {
                        const key = item.key as keyof SiteSettings;
                        if (key in next) {
                            if (typeof item.value === 'object' && item.value !== null) {
                                (next[key] as Record<string, unknown>) = {
                                    ...(next[key] as Record<string, unknown>),
                                    ...(item.value as Record<string, unknown>)
                                };
                            } else {
                                (next as any)[key] = item.value; // Still need one cast for dynamic key assignment in loop
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
        if (activeTab === 'reviews') {
            fetchAllReviews();
        } else if (activeTab === 'admins') {
            fetchAdmins();
        }
    }, [fetchSettings, activeTab]);

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
                const settingsKeyTyped = settingsKey as keyof SiteSettings;
                const section = next[settingsKeyTyped];

                if (section && typeof section === 'object') {
                    const updatedSection = { ...section } as Record<string, unknown>;
                    if (nestedKey) {
                        updatedSection[nestedKey] = publicUrl;
                    } else {
                        updatedSection.url = publicUrl;
                    }
                    (next as any)[settingsKeyTyped] = updatedSection;
                }
                return next;
            });

            setMessage({ text: 'Dosya başarıyla yüklendi! Lütfen "Kaydet" butonuna tıklayarak değişiklikleri kalıcı hale getirin.', type: 'success' });
        } catch (err) {
            const error = err as Error;
            console.error('Upload Error:', error);
            setMessage({ text: `Yükleme hatası: ${error.message || 'Bilinmeyen hata'}`, type: 'error' });
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
            const failedResult = results.find(r => r.error);
            if (failedResult && failedResult.error) {
                throw new Error(`Ayarlar kaydedilirken hata oluştu: ${failedResult.error.message}`);
            }

            setMessage({ text: 'Ayarlar başarıyla kaydedildi.', type: 'success' });
        } catch (err) {
            const error = err as Error;
            console.error('Error saving settings:', error);
            setMessage({ text: error.message || 'Ayarlar kaydedilirken bir hata oluştu.', type: 'error' });
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
        padding: isMobile ? '0.8rem 1rem' : '1rem 2rem',
        cursor: 'pointer',
        borderBottom: active ? '3px solid #1a1a1a' : '3px solid transparent',
        color: active ? '#1a1a1a' : '#8c8c8c',
        fontWeight: active ? 600 : 500,
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        whiteSpace: 'nowrap'
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
        <div style={{ padding: isMobile ? '1rem' : '2rem', maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
                <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.2rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.5rem' }}>Site Ayarları</h1>
                <p style={{ color: '#666', fontSize: isMobile ? '0.95rem' : '1.1rem' }}>Sitenizin genel içerik ve iletişim bilgilerini buradan yönetin.</p>
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

            <div style={{ backgroundColor: 'white', borderRadius: isMobile ? '12px' : '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #eef0f2', overflow: 'hidden' }}>
                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid #eee',
                    backgroundColor: '#fafafa',
                    padding: isMobile ? '0 0.5rem' : '0 1.5rem',
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                }}>
                    <div style={tabStyle(activeTab === 'hero')} onClick={() => setActiveTab('hero')}><Video size={18} /> Ana Sayfa</div>
                    <div style={tabStyle(activeTab === 'about')} onClick={() => setActiveTab('about')}><Info size={18} /> Kurumsal</div>
                    <div style={tabStyle(activeTab === 'contact')} onClick={() => setActiveTab('contact')}><Phone size={18} /> İletişim</div>
                    <div style={tabStyle(activeTab === 'products')} onClick={() => setActiveTab('products')}><ShoppingCart size={18} /> Ürün Bilgileri</div>
                    <div style={tabStyle(activeTab === 'invoice')} onClick={() => setActiveTab('invoice')}><FileText size={18} /> Fatura Ayarları</div>
                    <div style={tabStyle(activeTab === 'whatsapp')} onClick={() => setActiveTab('whatsapp')}><MessageCircle size={18} /> WhatsApp & Araçlar</div>
                    <div style={tabStyle(activeTab === 'reviews')} onClick={() => setActiveTab('reviews')}><Star size={18} /> Değerlendirmeler</div>
                    <div style={tabStyle(activeTab === 'admins')} onClick={() => setActiveTab('admins')}><CheckCircle size={18} /> Yöneticiler</div>
                </div>

                <div style={{ padding: isMobile ? '1.5rem 1rem' : '2.5rem' }}>
                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Star size={24} /> Ürün Değerlendirmeleri
                                </h2>
                                <button onClick={fetchAllReviews} style={{ padding: '0.6rem 1rem', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                    Yenile
                                </button>
                            </div>

                            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                                        <tr>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', fontSize: '0.85rem', color: '#666' }}>Ürün / Müşteri</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', fontSize: '0.85rem', color: '#666' }}>Değerlendirme</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #eee', fontSize: '0.85rem', color: '#666' }}>Durum</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #eee', fontSize: '0.85rem', color: '#666' }}>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allReviews.map((review) => (
                                            <tr key={review.id}>
                                                <td style={{ padding: '1.2rem 1rem', borderBottom: '1px solid #f0f0f0' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                                            {review.products ? review.products.title?.tr : 'Ürün Silinmiş'}
                                                        </span>
                                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{review.user_name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.2rem 1rem', borderBottom: '1px solid #f0f0f0' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                        <div style={{ display: 'flex', gap: '2px' }}>
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={12} fill={i < review.rating ? "#d4af37" : "none"} color={i < review.rating ? "#d4af37" : "#ddd"} />
                                                            ))}
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#444', maxWidth: '300px' }}>{review.comment}</p>
                                                        <span style={{ fontSize: '0.75rem', color: '#999' }}>{new Date(review.created_at).toLocaleDateString('tr-TR')}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.2rem 1rem', borderBottom: '1px solid #f0f0f0' }}>
                                                    <span style={{
                                                        padding: '0.3rem 0.6rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        backgroundColor: review.status === 'approved' ? '#f6ffed' : (review.status === 'rejected' ? '#fff2f0' : '#e6f7ff'),
                                                        color: review.status === 'approved' ? '#52c41a' : (review.status === 'rejected' ? '#ff4d4f' : '#1890ff'),
                                                        border: `1px solid ${review.status === 'approved' ? '#b7eb8f' : (review.status === 'rejected' ? '#ffccc7' : '#91d5ff')}`
                                                    }}>
                                                        {review.status === 'approved' ? 'Yayımlandı' : (review.status === 'rejected' ? 'Reddedildi' : 'Onay Bekliyor')}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.2rem 1rem', borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        {review.status !== 'approved' && (
                                                            <button
                                                                onClick={() => updateReviewStatus(review.id, 'approved')}
                                                                style={{ padding: '0.4rem 0.8rem', backgroundColor: '#52c41a', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                                                            >
                                                                Onayla
                                                            </button>
                                                        )}
                                                        {review.status === 'approved' && (
                                                            <button
                                                                onClick={() => updateReviewStatus(review.id, 'rejected')}
                                                                style={{ padding: '0.4rem 0.8rem', backgroundColor: '#faad14', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                                                            >
                                                                Gizle
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteReview(review.id)}
                                                            style={{ padding: '0.4rem 0.8rem', backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                                                        >
                                                            Sil
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {allReviews.length === 0 && (
                                            <tr>
                                                <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>Henüz değerlendirme bulunmuyor.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Admins Tab */}
                    {activeTab === 'admins' && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <ShieldCheck size={20} /> Yönetici Yetkilendirme
                            </h3>
                            <p style={{ color: '#666', marginBottom: '2rem' }}>Aşağıdaki e-posta adreslerine sahip kullanıcılar site ayarlarını değiştirebilir.</p>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <input
                                    type="email"
                                    value={newAdminEmail}
                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    style={inputStyle}
                                />
                                <button
                                    onClick={addAdmin}
                                    style={{ backgroundColor: '#1a1a1a', color: 'white', border: 'none', padding: '0 2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Ekle
                                </button>
                            </div>

                            <div style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
                                {admins.map((email, idx) => (
                                    <div key={email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: idx === admins.length - 1 ? 'none' : '1px solid #eee', backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                                        <span style={{ fontWeight: 500 }}>{email}</span>
                                        <button
                                            onClick={() => removeAdmin(email)}
                                            style={{ color: '#ff4d4f', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            Kaldır
                                        </button>
                                    </div>
                                ))}
                                {admins.length === 0 && (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#8c8c8c' }}>Henüz yönetici eklenmemiş.</div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Hero Tab */}
                    {activeTab === 'hero' && (
                        <div>
                            <div style={{ ...fieldGroupStyle, border: '2px solid #D4AF37', backgroundColor: '#fffdf5' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#856404' }}>
                                    <Info size={20} /> Banner Metinleri
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1rem' : '2rem' }}>
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
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.5rem' : '2.5rem', marginTop: '2rem' }}>
                                <div>
                                    <label style={labelStyle}>Ana Sayfa Videosu</label>
                                    <div style={{ border: '2px dashed #d9d9d9', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', backgroundColor: '#fafafa', position: 'relative' }}>
                                        <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'content', 'hero', 'hero_video')} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                                        <Upload size={24} color="#8c8c8c" style={{ marginBottom: '0.5rem' }} />
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>{uploading ? 'Yükleniyor...' : 'Video Yükle'}</p>
                                    </div>
                                    <input type="text" value={settings.hero_video.url} onChange={(e) => setSettings({ ...settings, hero_video: { ...settings.hero_video, url: e.target.value } })} style={{ ...inputStyle, marginTop: '1rem' }} placeholder="Video URL" />
                                </div>
                                {(!isMobile || settings.hero_video.url) && (
                                    <div>
                                        <label style={labelStyle}>Öنizleme</label>
                                        <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden' }}>
                                            {settings.hero_video.url && <video src={settings.hero_video.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted loop playsInline />}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Invoice Tab */}
                    {activeTab === 'invoice' && (
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <FileText size={20} /> Fatura Özelleştirme
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', gap: isMobile ? '1.5rem' : '3rem' }}>
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
                                    <input type="text" value={settings.invoice_settings.logo_url} onChange={(e) => setSettings({ ...settings, invoice_settings: { ...(settings.invoice_settings || {}), logo_url: e.target.value } })} style={{ ...inputStyle, marginTop: '1rem' }} placeholder="Logo URL" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Şirket Ünvanı</label>
                                        <input type="text" value={settings.invoice_settings.company_name} onChange={(e) => setSettings({ ...settings, invoice_settings: { ...(settings.invoice_settings || {}), company_name: e.target.value } })} style={inputStyle} />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Adres</label>
                                        <textarea value={settings.invoice_settings.company_address} onChange={(e) => setSettings({ ...settings, invoice_settings: { ...(settings.invoice_settings || {}), company_address: e.target.value } })} style={{ ...inputStyle, height: '80px' }} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Telefon</label>
                                        <input type="text" value={settings.invoice_settings.company_phone} onChange={(e) => setSettings({ ...settings, invoice_settings: { ...(settings.invoice_settings || {}), company_phone: e.target.value } })} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>E-posta</label>
                                        <input type="text" value={settings.invoice_settings.company_email} onChange={(e) => setSettings({ ...settings, invoice_settings: { ...(settings.invoice_settings || {}), company_email: e.target.value } })} style={inputStyle} />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Vergi Bilgileri</label>
                                        <input type="text" value={settings.invoice_settings.tax_info} onChange={(e) => setSettings({ ...settings, invoice_settings: { ...(settings.invoice_settings || {}), tax_info: e.target.value } })} style={inputStyle} />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Alt Metin (Teşekkür)</label>
                                        <input type="text" value={settings.invoice_settings.footer_text} onChange={(e) => setSettings({ ...settings, invoice_settings: { ...(settings.invoice_settings || {}), footer_text: e.target.value } })} style={inputStyle} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* About Tab */}
                    {activeTab === 'about' && (
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '350px 1fr', gap: isMobile ? '1.5rem' : '2.5rem' }}>
                            <div>
                                <label style={labelStyle}>Hakkımızda Görseli</label>
                                <div style={{ width: '100%', aspectRatio: isMobile ? '16/9' : '1/1', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
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
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.5rem' : '2.5rem' }}>
                            <div>
                                <label style={labelStyle}>Adres</label>
                                <textarea value={settings.contact_info.address} onChange={(e) => setSettings({ ...settings, contact_info: { ...settings.contact_info, address: e.target.value } })} style={{ ...inputStyle, height: '80px' }} />
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
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
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.5rem' : '3rem' }}>
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
                    {/* WhatsApp & Tools Tab */}
                    {activeTab === 'whatsapp' && (
                        <div>
                            <div style={{ ...fieldGroupStyle, border: '2px solid #25D366', backgroundColor: '#f0fff4' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#128C7E' }}>
                                        <MessageCircle size={20} /> WhatsApp Widget Ayarları
                                    </h3>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                                        <div
                                            onClick={() => setSettings({ ...settings, whatsapp_widget: { ...settings.whatsapp_widget, enabled: !settings.whatsapp_widget.enabled } })}
                                            style={{
                                                width: '50px',
                                                height: '26px',
                                                backgroundColor: settings.whatsapp_widget.enabled ? '#25D366' : '#ccc',
                                                borderRadius: '13px',
                                                position: 'relative',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{
                                                position: 'absolute',
                                                left: settings.whatsapp_widget.enabled ? '26px' : '2px',
                                                top: '2px',
                                                width: '22px',
                                                height: '22px',
                                                backgroundColor: 'white',
                                                borderRadius: '50%',
                                                transition: 'all 0.3s',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }} />
                                        </div>
                                        {settings.whatsapp_widget.enabled ? 'Aktif' : 'Pasif'}
                                    </label>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.5rem' : '2.5rem' }}>
                                    <div>
                                        <label style={labelStyle}>WhatsApp Numarası (Ülke kodu ile, Örn: 90555...)</label>
                                        <input type="text" value={settings.whatsapp_widget.phone_number} onChange={(e) => setSettings({ ...settings, whatsapp_widget: { ...(settings.whatsapp_widget || {}), phone_number: e.target.value } })} style={inputStyle} placeholder="905550000000" />

                                        <label style={{ ...labelStyle, marginTop: '1.5rem' }}>Widget Başlığı</label>
                                        <input type="text" value={getVal(settings.whatsapp_widget, 'title', 'tr')} onChange={(e) => setSettings({ ...settings, whatsapp_widget: { ...settings.whatsapp_widget, title: { ...settings.whatsapp_widget.title, tr: e.target.value } } })} style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder="Türkçe" />
                                        <input dir="rtl" type="text" value={getVal(settings.whatsapp_widget, 'title', 'ar')} onChange={(e) => setSettings({ ...settings, whatsapp_widget: { ...settings.whatsapp_widget, title: { ...settings.whatsapp_widget.title, ar: e.target.value } } })} style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder="العربية" />
                                        <input type="text" value={getVal(settings.whatsapp_widget, 'title', 'en')} onChange={(e) => setSettings({ ...settings, whatsapp_widget: { ...settings.whatsapp_widget, title: { ...settings.whatsapp_widget.title, en: e.target.value } } })} style={inputStyle} placeholder="English" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Karşılama Mesajı</label>
                                        <textarea value={getVal(settings.whatsapp_widget, 'welcome_message', 'tr')} onChange={(e) => setSettings({ ...settings, whatsapp_widget: { ...settings.whatsapp_widget, welcome_message: { ...settings.whatsapp_widget.welcome_message, tr: e.target.value } } })} style={{ ...inputStyle, height: '60px', marginBottom: '0.5rem' }} placeholder="Türkçe" />
                                        <textarea dir="rtl" value={getVal(settings.whatsapp_widget, 'welcome_message', 'ar')} onChange={(e) => setSettings({ ...settings, whatsapp_widget: { ...settings.whatsapp_widget, welcome_message: { ...settings.whatsapp_widget.welcome_message, ar: e.target.value } } })} style={{ ...inputStyle, height: '60px', marginBottom: '0.5rem' }} placeholder="العربية" />
                                        <textarea value={getVal(settings.whatsapp_widget, 'welcome_message', 'en')} onChange={(e) => setSettings({ ...settings, whatsapp_widget: { ...settings.whatsapp_widget, welcome_message: { ...settings.whatsapp_widget.welcome_message, en: e.target.value } } })} style={{ ...inputStyle, height: '60px' }} placeholder="English" />

                                        <label style={{ ...labelStyle, marginTop: '1.5rem' }}>Powered By Yazısı</label>
                                        <input type="text" value={settings.whatsapp_widget.powered_by} onChange={(e) => setSettings({ ...settings, whatsapp_widget: { ...(settings.whatsapp_widget || {}), powered_by: e.target.value } })} style={inputStyle} />
                                    </div>
                                </div>
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
