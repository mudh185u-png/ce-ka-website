import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts, type Order } from '../../context/ProductContext';
import { Package, TrendingUp, Users, ArrowUpRight, DollarSign } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { products, getAllOrders } = useProducts();
    const [orders, setOrders] = React.useState<Order[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getAllOrders();
                setOrders(data);
            } catch (err) {
                console.error('Error fetching dashboard orders:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [getAllOrders]);

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

    const StatCard = ({ title, value, subtext, icon, color }: { title: string, value: string | number, subtext: string, icon: React.ReactNode, color: string }) => (
        <div style={{
            backgroundColor: 'white',
            padding: '1.2rem',
            borderRadius: '4px',
            border: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start'
        }}>
            <div>
                <p style={{ color: '#8c8c8c', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
                <div style={{ fontSize: '1.8rem', fontWeight: 600, color: '#262626', lineHeight: 1.2 }}>{value}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                    <ArrowUpRight size={14} color="#52c41a" />
                    <span style={{ color: '#52c41a' }}>{subtext}</span>
                    <span style={{ color: '#bfbfbf' }}>geçen aya göre</span>
                </div>
            </div>
            <div style={{
                padding: '0.8rem',
                borderRadius: '50%',
                backgroundColor: `${color}15`,
                color: color
            }}>
                {icon}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '2rem', backgroundColor: '#f0f2f5', minHeight: '100%' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#262626', margin: 0 }}>Genel Bakış</h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', color: '#8c8c8c', marginTop: '0.3rem' }}>
                    <span>Anasayfa</span>
                    <span>/</span>
                    <span>Dashboard</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    title="Toplam Ürün"
                    value={products.length}
                    subtext="+12%"
                    icon={<Package size={24} />}
                    color="#1890ff"
                />
                <StatCard
                    title="Aktif Siparişler"
                    value={activeOrders}
                    subtext="+5%"
                    icon={<TrendingUp size={24} />}
                    color="#52c41a"
                />
                <StatCard
                    title="Toplam Ciro"
                    value={`${totalRevenue.toLocaleString('tr-TR')} ₺`}
                    subtext="+18%"
                    icon={<DollarSign size={24} />}
                    color="#fa8c16"
                />
                <StatCard
                    title="Toplam Sipariş"
                    value={orders.length}
                    subtext="+2.4%"
                    icon={<Users size={24} />}
                    color="#722ed1"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Recent Orders Table */}
                <div style={{ backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '4px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#262626' }}>Son Siparişler</h4>
                        <Link to="/admin/orders" style={{ textDecoration: 'none', color: '#1890ff', fontSize: '0.85rem' }}>Tümünü Gör</Link>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead style={{ backgroundColor: '#fafafa' }}>
                            <tr>
                                <th style={{ padding: '0.8rem', borderBottom: '1px solid #f0f0f0', color: '#595959', fontWeight: 600 }}>Müşteri</th>
                                <th style={{ padding: '0.8rem', borderBottom: '1px solid #f0f0f0', color: '#595959', fontWeight: 600 }}>Tarih</th>
                                <th style={{ padding: '0.8rem', borderBottom: '1px solid #f0f0f0', color: '#595959', fontWeight: 600 }}>Durum</th>
                                <th style={{ padding: '0.8rem', borderBottom: '1px solid #f0f0f0', color: '#595959', fontWeight: 600, textAlign: 'right' }}>Tutar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.slice(0, 5).map(order => (
                                <tr key={order.id}>
                                    <td style={{ padding: '0.8rem', borderBottom: '1px solid #f0f0f0' }}>
                                        <div style={{ fontWeight: 500, color: '#262626' }}>{order.customer_name}</div>
                                    </td>
                                    <td style={{ padding: '0.8rem', borderBottom: '1px solid #f0f0f0', color: '#595959' }}>
                                        {new Date(order.created_at).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td style={{ padding: '0.8rem', borderBottom: '1px solid #f0f0f0' }}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            backgroundColor: order.status === 'pending' ? '#fff7e6' :
                                                order.status === 'processing' ? '#e6f7ff' :
                                                    order.status === 'shipped' ? '#f9f0ff' :
                                                        order.status === 'delivered' ? '#f6ffed' : '#fff1f0',
                                            color: order.status === 'pending' ? '#fa8c16' :
                                                order.status === 'processing' ? '#1890ff' :
                                                    order.status === 'shipped' ? '#722ed1' :
                                                        order.status === 'delivered' ? '#52c41a' : '#f5222d',
                                            border: `1px solid ${order.status === 'pending' ? '#ffd591' :
                                                order.status === 'processing' ? '#91d5ff' :
                                                    order.status === 'shipped' ? '#d3adf7' :
                                                        order.status === 'delivered' ? '#b7eb8f' : '#ffa39e'
                                                }`
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.8rem', borderBottom: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 600 }}>
                                        {order.total_amount.toLocaleString('tr-TR')} ₺
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#bfbfbf' }}>Henüz sipariş bulunmuyor.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* System Activity */}
                <div style={{ backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '4px', padding: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 1.5rem', fontSize: '1rem', color: '#262626' }}>Sistem Aktivitesi</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        {[
                            { text: 'Yeni ürün eklendi: Lüks Baza', time: '2 dakika önce', color: '#52c41a' },
                            { text: 'Fiyat güncellemesi: Kapitone', time: '1 saat önce', color: '#1890ff' },
                            { text: 'Yedekleme tamamlandı', time: '3 saat önce', color: '#722ed1' },
                            { text: 'Sistem güvenliği tarandı', time: '5 saat önce', color: '#fa8c16' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ paddingTop: '0.3rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#262626' }}>{item.text}</p>
                                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#bfbfbf' }}>{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
