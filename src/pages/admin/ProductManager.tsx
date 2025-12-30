import React, { useState } from 'react';
import { useProducts, type Product } from '../../context/ProductContext';
import { Plus, Edit2, Trash2, X, Save, UploadCloud, Search, Loader2 } from 'lucide-react';
import { supabase } from '../../supabase';
import { useToast } from '../../components/Toast';

const ProductManager: React.FC = () => {
    const { products, addProduct, deleteProduct, updateProduct, loading } = useProducts();
    const { showToast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Omit<Product, 'id'>>({
        images: [],
        price: 0,
        category: 'baza',
        title: { tr: '', ar: '', en: '' },
        description: { tr: '', ar: '', en: '' },
        variants: [],
        fabrics: [],
        legs: [],
        discountPrice: null,
        badge: null,
        sku: ''
    });

    const resetForm = () => {
        setFormData({
            images: [],
            price: 0,
            category: 'baza',
            title: { tr: '', ar: '', en: '' },
            description: { tr: '', ar: '', en: '' },
            discountPrice: null,
            badge: null,
            sku: '',
            variants: [],
            fabrics: [],
            legs: []
        });
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const newImages: string[] = [];

        for (const file of Array.from(files)) {
            const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(fileName, file);

            if (error) {
                console.error('Upload error:', error);
                showToast('Görsel yüklenirken hata oluştu: ' + error.message, 'error');
            } else if (data) {
                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(data.path);
                newImages.push(publicUrl);
            }
        }

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
        }));
        setUploading(false);
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Ensure arrays are properly formatted before saving
            const dataToSave = {
                ...formData,
                variants: formData.variants && formData.variants.length > 0 ? formData.variants : [],
                fabrics: formData.fabrics && formData.fabrics.length > 0 ? formData.fabrics : [],
                legs: formData.legs && formData.legs.length > 0 ? formData.legs : []
            };

            if (editingId) {
                await updateProduct(editingId, dataToSave);
                showToast('Ürün başarıyla güncellendi', 'success');
            } else {
                await addProduct(dataToSave);
                showToast('Ürün başarıyla eklendi', 'success');
            }
            resetForm();
        } catch (error) {
            console.error('Error saving product:', error);
            showToast('İşlem sırasında bir hata oluştu.', 'error');
        }
    };

    const handleEdit = (product: Product) => {
        setEditingId(product.id);

        // Ensure arrays are properly formatted
        const variants = product.variants ? (Array.isArray(product.variants) ? product.variants : []) : [];
        const fabrics = product.fabrics ? (Array.isArray(product.fabrics) ? product.fabrics : []) : [];
        const legs = product.legs ? (Array.isArray(product.legs) ? product.legs : []) : [];

        setFormData({
            images: product.images || [],
            price: product.price,
            category: product.category,
            title: { ...product.title },
            description: { ...product.description },
            discountPrice: product.discountPrice ?? null,
            badge: product.badge ?? null,
            sku: product.sku || '',
            variants,
            fabrics,
            legs
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
            try {
                await deleteProduct(id);
                showToast('Ürün başarıyla silindi', 'success');
            } catch {
                showToast('Ürün silinirken bir hata oluştu', 'error');
            }
        }
    };

    // ... (Styles same as before)
    const inputStyle = {
        width: '100%',
        padding: '0.6rem 0.8rem',
        border: '1px solid #d9d9d9',
        borderRadius: '4px',
        fontSize: '0.9rem',
        backgroundColor: '#fff',
        transition: 'all 0.2s',
        outline: 'none'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.3rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: '#262626'
    };

    if (loading) return <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" /></div>;

    return (
        <div style={{ padding: '2rem', height: '100%', position: 'relative', backgroundColor: '#f0f2f5' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                marginBottom: '1.5rem',
                backgroundColor: 'white',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                gap: isMobile ? '1rem' : '0'
            }}>
                <div>
                    <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', color: '#262626', margin: 0 }}>Ürün Yönetimi</h2>
                    <p style={{ fontSize: '0.8rem', color: '#8c8c8c', margin: '0.2rem 0 0' }}>Tüm ürünlerinizi yönetin.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} color="#bfbfbf" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input type="text" placeholder="Ara..." style={{ padding: '0.5rem 0.5rem 0.5rem 2rem', border: '1px solid #d9d9d9', borderRadius: '4px', fontSize: '0.9rem', width: isMobile ? '100%' : '200px' }} />
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsFormOpen(true); }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: isMobile ? '0.7rem' : '0.5rem 1rem',
                            backgroundColor: '#1890ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}
                    >
                        <Plus size={16} />
                        Yeni Ekle
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div style={{ backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '8px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', minWidth: isMobile ? '600px' : 'auto' }}>
                    <thead style={{ backgroundColor: '#fafafa' }}>
                        <tr style={{ color: '#262626' }}>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>Görsel</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>Ürün Adı (TR)</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>Kategori</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>SKU / Kod</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0', fontWeight: 600 }}>Fiyat</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #f0f0f0', fontWeight: 600, textAlign: 'right' }}>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#fafafa'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}>
                                <td style={{ padding: '0.8rem 1rem' }}>
                                    <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                                        <img src={p.images?.[0] || 'https://via.placeholder.com/40'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        {(p.images?.length || 0) > 1 && (
                                            <div style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '8px', padding: '0 2px' }}>+{p.images.length - 1}</div>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '0.8rem 1rem', color: '#262626' }}>{p.title?.tr}</td>
                                <td style={{ padding: '0.8rem 1rem' }}>
                                    <span style={{
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        backgroundColor: '#f0faff',
                                        color: '#096dd9',
                                        border: '1px solid #bae7ff',
                                        fontSize: '0.8rem',
                                        textTransform: 'uppercase'
                                    }}>
                                    </span>
                                </td>
                                <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace', color: '#595959' }}>{p.sku || '-'}</td>
                                <td style={{ padding: '0.8rem 1rem', fontFamily: 'monospace', fontWeight: 600 }}>{p.price.toLocaleString('tr-TR')} ₺</td>
                                <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                                    <button
                                        onClick={() => handleEdit(p)}
                                        style={{ marginRight: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#1890ff' }}
                                        title="Düzenle"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4f' }}
                                        title="Sil"
                                        disabled={uploading}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Slide-over Form Overlay */}
            {isFormOpen && (
                <>
                    <div onClick={() => setIsFormOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 90 }} />
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: isMobile ? '100%' : '600px',
                        backgroundColor: 'white',
                        boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
                        zIndex: 100,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Drawer Header */}
                        <div style={{ padding: '1.2rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#262626' }}>{editingId ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h3>
                            <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
                            <form id="productForm" onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <label style={labelStyle}>Kategori</label>
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value as Product['category'] })}
                                            style={inputStyle}
                                        >
                                            <option value="yatak">Yatak (Mattress)</option>
                                            <option value="baza">Baza (Base)</option>
                                            <option value="baslik">Başlık (Headboard)</option>
                                            <option value="set">Set (Bundle)</option>
                                            <option value="tekstil">Ev Tekstili (Textile)</option>
                                            <option value="bebek">Bebek (Baby)</option>
                                            <option value="outlet">Outlet</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Ürün Kodu (SKU)</label>
                                        <input
                                            type="text"
                                            placeholder="Örn: BAZA-101"
                                            value={formData.sku || ''}
                                            onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <label style={labelStyle}>Etiket / Rozet</label>
                                        <select
                                            value={formData.badge || ''}
                                            onChange={e => setFormData({ ...formData, badge: e.target.value ? e.target.value as Product['badge'] : null })}
                                            style={inputStyle}
                                        >
                                            <option value="">Yok</option>
                                            <option value="new">Yeni (New)</option>
                                            <option value="sale">İndirim (Sale)</option>
                                            <option value="bestseller">Çok Satan (Best Seller)</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{
                                    marginBottom: '1.5rem',
                                    padding: '1.2rem',
                                    backgroundColor: '#fff1f0',
                                    borderRadius: '8px',
                                    border: '1px solid #ffa39e'
                                }}>
                                    <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#cf1322', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ padding: '4px', backgroundColor: '#cf1322', borderRadius: '4px', color: 'white', display: 'flex' }}>%</div>
                                        Fiyat ve İndirim Yönetimi
                                    </h4>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                                        <div>
                                            <label style={labelStyle}>Normal Fiyat (TL)</label>
                                            <input
                                                type="number"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                                style={{ ...inputStyle, border: '1px solid #ffa39e' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>İndirimli Fiyat (TL)</label>
                                            <input
                                                type="number"
                                                placeholder="İndirim yok"
                                                value={formData.discountPrice ?? ''}
                                                onChange={e => {
                                                    const val = e.target.value ? Number(e.target.value) : null;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        discountPrice: val,
                                                        badge: val && val < prev.price ? 'sale' : prev.badge
                                                    }));
                                                }}
                                                style={{ ...inputStyle, border: '1px solid #cf1322', fontWeight: 600, color: '#cf1322' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                        {[10, 15, 20, 30, 50].map(pct => (
                                            <button
                                                key={pct}
                                                type="button"
                                                onClick={() => {
                                                    const discount = Math.round(formData.price * (1 - pct / 100));
                                                    setFormData(prev => ({ ...prev, discountPrice: discount, badge: 'sale' }));
                                                }}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    backgroundColor: 'white',
                                                    border: '1px solid #cf1322',
                                                    color: '#cf1322',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={e => { e.currentTarget.style.backgroundColor = '#cf1322'; e.currentTarget.style.color = 'white'; }}
                                                onMouseOut={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#cf1322'; }}
                                            >
                                                -%{pct}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, discountPrice: null, badge: prev.badge === 'sale' ? null : prev.badge }))}
                                            style={{
                                                padding: '0.4rem 0.8rem',
                                                backgroundColor: 'white',
                                                border: '1px solid #d9d9d9',
                                                color: '#595959',
                                                borderRadius: '4px',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Sıfırla
                                        </button>
                                    </div>

                                    {formData.discountPrice && formData.discountPrice < formData.price && (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.8rem',
                                            backgroundColor: 'white',
                                            borderRadius: '6px',
                                            border: '1px dashed #cf1322'
                                        }}>
                                            <span style={{ fontSize: '0.85rem', color: '#595959' }}>Müşteri Kazancı:</span>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ color: '#cf1322', fontWeight: 700, fontSize: '1rem' }}>
                                                    {Math.round((1 - formData.discountPrice / formData.price) * 100)}% İndirim
                                                </div>
                                                <div style={{ color: '#8c8c8c', fontSize: '0.75rem' }}>
                                                    {(formData.price - formData.discountPrice).toLocaleString()} TL Kar
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={labelStyle}>Ürün Görselleri</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
                                                <img src={img} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'white', borderRadius: '50%', border: '1px solid #d9d9d9', cursor: 'pointer', padding: '2px', display: 'flex' }}
                                                >
                                                    <X size={12} color="#ff4d4f" />
                                                </button>
                                            </div>
                                        ))}

                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            border: '1px dashed #d9d9d9',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            backgroundColor: '#fafafa',
                                            opacity: uploading ? 0.5 : 1
                                        }}
                                            onClick={() => !uploading && document.getElementById('fileInput')?.click()}
                                        >
                                            {uploading ? <Loader2 className="animate-spin" size={20} color="#1890ff" /> : <UploadCloud size={20} color="#1890ff" />}
                                            <span style={{ fontSize: '0.7rem', color: '#1890ff', marginTop: '0.2rem' }}>{uploading ? '...' : 'Yükle'}</span>
                                        </div>
                                    </div>

                                    <input
                                        id="fileInput"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                        disabled={uploading}
                                    />
                                </div>

                                {/* Variants Section */}
                                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                                    <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#262626' }}>Varyasyonlar & Seçenekler</h4>

                                    {/* Sizes */}
                                    <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                                        <label style={labelStyle}>Boyut Seçenekleri & Özel Fiyatlar</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <input
                                                id="sizeInput"
                                                placeholder="Örn: 90x190"
                                                style={{ ...inputStyle, flex: 2 }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        document.getElementById('addSizeBtn')?.click();
                                                    }
                                                }}
                                            />
                                            <input
                                                id="sizePriceInput"
                                                type="number"
                                                placeholder="Fiyat"
                                                style={{ ...inputStyle, flex: 1 }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        document.getElementById('addSizeBtn')?.click();
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                id="addSizeBtn"
                                                onClick={() => {
                                                    const sizeInput = document.getElementById('sizeInput') as HTMLInputElement;
                                                    const priceInput = document.getElementById('sizePriceInput') as HTMLInputElement;

                                                    // Ensure values exist and price is valid number
                                                    if (sizeInput.value && priceInput.value) {
                                                        const price = parseFloat(priceInput.value);
                                                        if (!isNaN(price) && price >= 0) {
                                                            const newVariant = {
                                                                size: sizeInput.value.trim(),
                                                                price: Number(price)
                                                            };
                                                            setFormData(prev => {
                                                                const currentVariants = Array.isArray(prev.variants) ? prev.variants : [];
                                                                const updatedVariants = [...currentVariants, newVariant];
                                                                console.log('Adding variant:', newVariant);
                                                                console.log('Updated variants:', updatedVariants);
                                                                return {
                                                                    ...prev,
                                                                    variants: updatedVariants
                                                                };
                                                            });
                                                            sizeInput.value = '';
                                                            priceInput.value = '';
                                                            sizeInput.focus();
                                                        } else {
                                                            alert('Lütfen geçerli bir fiyat giriniz.');
                                                        }
                                                    } else {
                                                        alert('Lütfen boyut ve fiyat giriniz.');
                                                    }
                                                }}
                                                style={{ backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 1rem' }}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', minHeight: '40px' }}>
                                            {(formData?.variants && Array.isArray(formData.variants) && formData.variants.length > 0) ? (
                                                formData.variants.map((v, idx) => {
                                                    // Ensure variant has required properties
                                                    if (!v || typeof v !== 'object' || !v.size || v.price === undefined) {
                                                        return null;
                                                    }
                                                    return (
                                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '0.4rem 0.8rem', border: '1px solid #e6e6e6', borderRadius: '4px' }}>
                                                            <span style={{ fontSize: '0.85rem' }}><b>{String(v.size)}</b> - {Number(v.price).toLocaleString('tr-TR')} TL</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData(prev => ({
                                                                    ...prev,
                                                                    variants: (prev.variants || []).filter((_, i) => i !== idx)
                                                                }))}
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d4f' }}
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <span style={{ fontSize: '0.8rem', color: '#8c8c8c' }}>Henüz boyut eklenmedi.</span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        {/* Fabrics */}
                                        <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                                            <label style={labelStyle}>Kumaş / Renk Seçenekleri</label>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <input
                                                    id="fabricInput"
                                                    placeholder="Örn: Dokuma - Koyu Gri-14208"
                                                    style={inputStyle}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const input = e.target as HTMLInputElement;
                                                            if (input.value.trim()) {
                                                                const newFabric = input.value.trim();
                                                                setFormData(prev => {
                                                                    const currentFabrics = prev.fabrics || [];
                                                                    return {
                                                                        ...prev,
                                                                        fabrics: [...currentFabrics, newFabric]
                                                                    };
                                                                });
                                                                input.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    id="addFabricBtn"
                                                    onClick={() => {
                                                        const input = document.getElementById('fabricInput') as HTMLInputElement;
                                                        if (input.value.trim()) {
                                                            const newFabric = input.value.trim();
                                                            setFormData(prev => {
                                                                const currentFabrics = prev.fabrics || [];
                                                                const updatedFabrics = [...currentFabrics, newFabric];
                                                                return {
                                                                    ...prev,
                                                                    fabrics: updatedFabrics
                                                                };
                                                            });
                                                            input.value = '';
                                                            input.focus();
                                                        }
                                                    }}
                                                    style={{ backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 0.8rem' }}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', minHeight: '30px' }}>
                                                {(formData?.fabrics && formData.fabrics.length > 0) ? (
                                                    formData.fabrics.map((f, idx) => (
                                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'white', padding: '0.2rem 0.5rem', border: '1px solid #e6e6e6', borderRadius: '12px', fontSize: '0.8rem' }}>
                                                            {f}
                                                            <X
                                                                size={12}
                                                                style={{ cursor: 'pointer', color: '#ff4d4f' }}
                                                                onClick={() => setFormData(prev => ({
                                                                    ...prev,
                                                                    fabrics: (prev.fabrics || []).filter((_, i) => i !== idx)
                                                                }))}
                                                            />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span style={{ fontSize: '0.8rem', color: '#8c8c8c' }}>Henüz kumaş eklenmedi.</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Legs */}
                                        <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                                            <label style={labelStyle}>Ayak Seçenekleri</label>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <input
                                                    id="legInput"
                                                    placeholder="Örn: Plastik - Antrasit"
                                                    style={inputStyle}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const input = e.target as HTMLInputElement;
                                                            if (input.value.trim()) {
                                                                const newLeg = input.value.trim();
                                                                setFormData(prev => {
                                                                    const currentLegs = prev.legs || [];
                                                                    return {
                                                                        ...prev,
                                                                        legs: [...currentLegs, newLeg]
                                                                    };
                                                                });
                                                                input.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    id="addLegBtn"
                                                    onClick={() => {
                                                        const input = document.getElementById('legInput') as HTMLInputElement;
                                                        if (input.value.trim()) {
                                                            const newLeg = input.value.trim();
                                                            setFormData(prev => {
                                                                const currentLegs = prev.legs || [];
                                                                const updatedLegs = [...currentLegs, newLeg];
                                                                return {
                                                                    ...prev,
                                                                    legs: updatedLegs
                                                                };
                                                            });
                                                            input.value = '';
                                                            input.focus();
                                                        }
                                                    }}
                                                    style={{ backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 0.8rem' }}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', minHeight: '30px' }}>
                                                {(formData?.legs && formData.legs.length > 0) ? (
                                                    formData.legs.map((l, idx) => (
                                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'white', padding: '0.2rem 0.5rem', border: '1px solid #e6e6e6', borderRadius: '12px', fontSize: '0.8rem' }}>
                                                            {l}
                                                            <X
                                                                size={12}
                                                                style={{ cursor: 'pointer', color: '#ff4d4f' }}
                                                                onClick={() => setFormData(prev => ({
                                                                    ...prev,
                                                                    legs: (prev.legs || []).filter((_, i) => i !== idx)
                                                                }))}
                                                            />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span style={{ fontSize: '0.8rem', color: '#8c8c8c' }}>Henüz ayak seçeneği eklenmedi.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#262626' }}>Ürün Detayları (Çoklu Dil)</h4>

                                    <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                                            <img src="https://flagcdn.com/w20/tr.png" alt="TR" style={{ width: '20px' }} />
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Türkçe</span>
                                        </div>
                                        <input placeholder="Ürün Başlığı" value={formData.title.tr} onChange={e => setFormData({ ...formData, title: { ...formData.title, tr: e.target.value } })} style={{ ...inputStyle, marginBottom: '0.5rem' }} />
                                        <textarea placeholder="Açıklama" value={formData.description.tr} onChange={e => setFormData({ ...formData, description: { ...formData.description, tr: e.target.value } })} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
                                    </div>

                                    {/* ... Other languages ... */}
                                    <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                                            <img src="https://flagcdn.com/w20/sa.png" alt="AR" style={{ width: '20px' }} />
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Arapça (RTL)</span>
                                        </div>
                                        <input dir="rtl" placeholder="العنوان" value={formData.title.ar} onChange={e => setFormData({ ...formData, title: { ...formData.title, ar: e.target.value } })} style={{ ...inputStyle, marginBottom: '0.5rem' }} />
                                        <textarea dir="rtl" placeholder="الوصف" value={formData.description.ar} onChange={e => setFormData({ ...formData, description: { ...formData.description, ar: e.target.value } })} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
                                    </div>

                                    <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                                            <img src="https://flagcdn.com/w20/us.png" alt="EN" style={{ width: '20px' }} />
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>İngilizce</span>
                                        </div>
                                        <input placeholder="Product Title" value={formData.title.en} onChange={e => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })} style={{ ...inputStyle, marginBottom: '0.5rem' }} />
                                        <textarea placeholder="Description" value={formData.description.en} onChange={e => setFormData({ ...formData, description: { ...formData.description, en: e.target.value } })} style={{ ...inputStyle, height: '80px', resize: 'vertical' }} />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Drawer Footer */}
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: 'white' }}>
                            <button onClick={() => setIsFormOpen(false)} style={{ padding: '0.6rem 1.5rem', border: '1px solid #d9d9d9', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '0.9rem' }} disabled={uploading}>İptal</button>
                            <button type="submit" form="productForm" style={{ padding: '0.6rem 1.5rem', border: 'none', borderRadius: '4px', background: '#1890ff', color: 'white', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }} disabled={uploading}>
                                {uploading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                {editingId ? 'Güncelle' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductManager;
