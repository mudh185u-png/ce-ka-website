import React, { useState, useEffect, useCallback } from 'react';
import { useProducts, type Order } from '../../context/ProductContext';
import { Search, Filter, Clock, Truck, Check, X, FileText, ChevronLeft } from 'lucide-react';
import Invoice from '../Invoice';

const OrdersManager: React.FC = () => {
    const { getAllOrders, updateOrderStatus } = useProducts();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [viewingInvoice, setViewingInvoice] = useState(false);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllOrders();
            setOrders(data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    }, [getAllOrders]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleStatusUpdate = async (orderId: number, newStatus: Order['status']) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            fetchOrders();
        } catch (err) {
            console.error('Status update error:', err);
            alert('Durum güncellenirken hata oluştu.');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            (order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toString().includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: Order['status']) => {
        const styles: Record<string, { bg: string, color: string, icon: React.ReactNode, label: string }> = {
            pending: { bg: '#fff7e6', color: '#fa8c16', icon: <Clock size={14} />, label: 'Beklemede' },
            processing: { bg: '#e6f7ff', color: '#1890ff', icon: <Clock size={14} />, label: 'Hazırlanıyor' },
            shipped: { bg: '#f9f0ff', color: '#722ed1', icon: <Truck size={14} />, label: 'Kargoda' },
            delivered: { bg: '#f6ffed', color: '#52c41a', icon: <Check size={14} />, label: 'Teslim Edildi' },
            cancelled: { bg: '#fff1f0', color: '#f5222d', icon: <X size={14} />, label: 'İptal Edildi' }
        };

        const style = styles[status] || styles.pending;

        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: style.bg,
                color: style.color,
                border: `1px solid ${style.color}30`
            }}>
                {style.icon}
                {style.label}
            </span>
        );
    };

    if (viewingInvoice && selectedOrder) {
        return (
            <div style={{ padding: '2rem' }}>
                <button
                    onClick={() => setViewingInvoice(false)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        marginBottom: '2rem',
                        fontSize: '1rem',
                        fontWeight: 500
                    }}
                >
                    <ChevronLeft size={20} /> Geri Dön
                </button>
                <Invoice order={selectedOrder} />
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Sipariş Yönetimi</h1>
                    <p style={{ color: '#666', marginTop: '0.4rem' }}>Mağazanızdaki tüm siparişleri buradan takip edin ve yönetin.</p>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                backgroundColor: 'white',
                padding: '1.2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                flexWrap: 'wrap'
            }}>
                <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                    <Search size={18} color="#bfbfbf" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Müşteri adı, e-posta veya sipariş no ile ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.8rem 1rem 0.8rem 2.8rem',
                            borderRadius: '8px',
                            border: '1px solid #d9d9d9',
                            fontSize: '0.95rem',
                            outline: 'none'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Filter size={18} color="#595959" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '0.8rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid #d9d9d9',
                            outline: 'none',
                            backgroundColor: 'white',
                            fontSize: '0.95rem',
                            minWidth: '160px'
                        }}
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value="pending">Beklemede</option>
                        <option value="processing">Hazırlanıyor</option>
                        <option value="shipped">Kargoda</option>
                        <option value="delivered">Teslim Edildi</option>
                        <option value="cancelled">İptal Edildi</option>
                    </select>
                </div>
                <button
                    onClick={fetchOrders}
                    style={{
                        padding: '0.8rem 1.2rem',
                        borderRadius: '8px',
                        border: '1px solid #1890ff',
                        backgroundColor: 'white',
                        color: '#1890ff',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                    }}
                >
                    Tazele
                </button>
            </div>

            {/* Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                        <tr>
                            <th style={{ padding: '1.2rem', fontWeight: 600, color: '#262626' }}>No</th>
                            <th style={{ padding: '1.2rem', fontWeight: 600, color: '#262626' }}>Müşteri</th>
                            <th style={{ padding: '1.2rem', fontWeight: 600, color: '#262626' }}>Tarih</th>
                            <th style={{ padding: '1.2rem', fontWeight: 600, color: '#262626' }}>Tutar</th>
                            <th style={{ padding: '1.2rem', fontWeight: 600, color: '#262626' }}>Ödeme</th>
                            <th style={{ padding: '1.2rem', fontWeight: 600, color: '#262626' }}>Durum</th>
                            <th style={{ padding: '1.2rem', fontWeight: 600, color: '#262626', textAlign: 'right' }}>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                            <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fafafa'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <td style={{ padding: '1.2rem', fontWeight: 700, color: '#1890ff' }}>#{order.id.toString().padStart(5, '0')}</td>
                                <td style={{ padding: '1.2rem' }}>
                                    <div style={{ fontWeight: 600, color: '#262626' }}>{order.customer_name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#8c8c8c' }}>{order.customer_phone}</div>
                                </td>
                                <td style={{ padding: '1.2rem', color: '#595959', fontSize: '0.9rem' }}>
                                    {new Date(order.created_at).toLocaleDateString('tr-TR')}
                                    <div style={{ fontSize: '0.75rem', color: '#bfbfbf' }}>{new Date(order.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td style={{ padding: '1.2rem', fontWeight: 700, color: '#262626' }}>{order.total_amount.toLocaleString('tr-TR')} ₺</td>
                                <td style={{ padding: '1.2rem', color: '#595959', fontSize: '0.9rem' }}>Kapıda Ödeme</td>
                                <td style={{ padding: '1.2rem' }}>{getStatusBadge(order.status)}</td>
                                <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button
                                            title="Faturayı Görüntüle"
                                            onClick={() => { setSelectedOrder(order); setViewingInvoice(true); }}
                                            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d9d9d9', backgroundColor: 'white', cursor: 'pointer', color: '#595959' }}
                                        >
                                            <FileText size={16} />
                                        </button>
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value as any)}
                                                style={{
                                                    padding: '0.5rem 0.8rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid #1890ff',
                                                    backgroundColor: 'white',
                                                    color: '#1890ff',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    outline: 'none'
                                                }}
                                            >
                                                <option value="pending">⏳ Beklemede</option>
                                                <option value="processing">⚙️ Hazırlanıyor</option>
                                                <option value="shipped">🚚 Kargoda</option>
                                                <option value="delivered">✅ Teslim Edildi</option>
                                                <option value="cancelled">❌ İptal Et</option>
                                            </select>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} style={{ padding: '4rem', textAlign: 'center', color: '#bfbfbf' }}>
                                    <div style={{ marginBottom: '1rem' }}><Search size={48} style={{ opacity: 0.2 }} /></div>
                                    {searchTerm || statusFilter !== 'all' ? 'Aranan kriterlere uygun sipariş bulunamadı.' : 'Henüz hiç sipariş bulunmuyor.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {loading && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #1890ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            )}
        </div>
    );
};

export default OrdersManager;
