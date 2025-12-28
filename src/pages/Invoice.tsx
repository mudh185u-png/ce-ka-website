import React from 'react';
import type { Order } from '../context/ProductContext';
import { useTranslation } from 'react-i18next';
import { Download, Printer } from 'lucide-react';

interface InvoiceProps {
    order: Order;
}

const Invoice: React.FC<InvoiceProps> = ({ order }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [invoiceSettings, setInvoiceSettings] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchInvoiceSettings = async () => {
            const { data } = await (window as any).supabase
                .from('site_settings')
                .select('*')
                .eq('key', 'invoice_settings')
                .single();
            if (data) setInvoiceSettings(data.value);
        };
        fetchInvoiceSettings();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '3rem', backgroundColor: 'white', border: '1px solid #eee', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            {/* Action Bar (Hidden on print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', border: '1px solid #eee', borderRadius: '6px', background: '#f8fafc', cursor: 'pointer' }}>
                    <Printer size={16} /> {t('invoice.print', { defaultValue: 'Yazdır' })}
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', border: '1px solid #eee', borderRadius: '6px', background: '#f8fafc', cursor: 'pointer' }}>
                    <Download size={16} /> {t('invoice.download', { defaultValue: 'PDF İndir' })}
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', borderBottom: '2px solid #1e293b', paddingBottom: '1.5rem', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#1e293b', fontWeight: 800 }}>{t('invoice.title', { defaultValue: 'FATURA' })}</h1>
                    <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>#{order.id.toString().padStart(6, '0')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    {invoiceSettings?.logo_url ? (
                        <img src={invoiceSettings.logo_url} alt="Logo" style={{ height: '60px', marginBottom: '0.5rem', objectFit: 'contain' }} />
                    ) : (
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{invoiceSettings?.company_name || 'Ce Ka Baza'}</h2>
                    )}
                    <p style={{ margin: '0.2rem 0', color: '#64748b', fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{invoiceSettings?.company_address || 'Istanbul, Turkey'}</p>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{invoiceSettings?.company_email || 'info@cekabaza.com'}</p>
                    {invoiceSettings?.tax_info && <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>{invoiceSettings.tax_info}</p>}
                </div>
            </div>

            {/* Billing Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem', textAlign: isRTL ? 'right' : 'left' }}>
                <div>
                    <h4 style={{ margin: '0 0 0.8rem', textTransform: 'uppercase', color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '0.05em' }}>MÜŞTERİ BİLGİLERİ</h4>
                    <p style={{ margin: '0 0 0.3rem', fontWeight: 700, fontSize: '1.1rem' }}>{order.customer_name}</p>
                    <p style={{ margin: '0 0 0.3rem', color: '#475569' }}>{order.customer_phone}</p>
                    <p style={{ margin: '0 0 0.3rem', color: '#475569' }}>{order.customer_email}</p>
                    <p style={{ margin: 0, color: '#475569', maxWidth: '300px' }}>{order.customer_address}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h4 style={{ margin: '0 0 0.8rem', textTransform: 'uppercase', color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '0.05em' }}>SİPARİŞ DETAYLARI</h4>
                    <p style={{ margin: '0 0 0.3rem' }}><b>Tarih:</b> {new Date(order.created_at).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')}</p>
                    <p style={{ margin: 0 }}><b>Ödeme:</b> Kapıda Ödeme</p>
                </div>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3rem' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: isRTL ? 'right' : 'left', color: '#64748b', fontSize: '0.85rem' }}>
                        <th style={{ padding: '0.8rem 0', fontWeight: 600 }}>AÇIKLAMA</th>
                        <th style={{ padding: '0.8rem 0', fontWeight: 600 }}>KOD (SKU)</th>
                        <th style={{ padding: '0.8rem 0', fontWeight: 600, textAlign: 'center' }}>ADET</th>
                        <th style={{ padding: '0.8rem 0', fontWeight: 600, textAlign: 'right' }}>FİYAT</th>
                        <th style={{ padding: '0.8rem 0', fontWeight: 600, textAlign: 'right' }}>TOPLAM</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items?.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem' }}>
                            <td style={{ padding: '1.2rem 0' }}>
                                <p style={{ margin: 0, fontWeight: 600 }}>{item.product_title[i18n.language as keyof typeof item.product_title] || item.product_title.tr}</p>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.4rem' }}>
                                    {item.variant_size && <div style={{ marginBottom: '0.1rem' }}>Beden/Boyut: {item.variant_size}</div>}
                                    {item.fabric && <div style={{ marginBottom: '0.1rem' }}>Kumaş: {item.fabric}</div>}
                                    {item.leg && <div>Ayak: {item.leg}</div>}
                                </div>
                            </td>
                            <td style={{ padding: '1.2rem 0', fontFamily: 'monospace', color: '#64748b' }}>{item.product_sku || '-'}</td>
                            <td style={{ padding: '1.2rem 0', textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ padding: '1.2rem 0', textAlign: 'right' }}>{item.unit_price.toLocaleString()} ₺</td>
                            <td style={{ padding: '1.2rem 0', textAlign: 'right', fontWeight: 600 }}>{(item.unit_price * item.quantity).toLocaleString()} ₺</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '250px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                        <span style={{ color: '#64748b' }}>Ara Toplam</span>
                        <span>{order.total_amount.toLocaleString()} ₺</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                        <span style={{ color: '#64748b' }}>KDV (%20)</span>
                        <span>Dahil</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #1e293b', fontWeight: 800, fontSize: '1.25rem' }}>
                        <span>TOPLAM</span>
                        <span>{order.total_amount.toLocaleString()} ₺</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                <p style={{ margin: 0 }}>{invoiceSettings?.footer_text || 'Bizi tercih ettiğiniz için teşekkür ederiz!'}</p>
                <p style={{ margin: '0.2rem 0 0' }}>Fatura oluşturma tarihi: {new Date().toLocaleDateString()}</p>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; }
                    div { box-shadow: none !important; border: none !important; margin: 0 !important; padding: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default Invoice;
