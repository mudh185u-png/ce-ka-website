import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { LayoutDashboard, ShoppingBag, LogOut, Settings, Bell, Search, ShoppingCart, Menu, X } from 'lucide-react';

const AdminLayout: React.FC = () => {
    const { logout } = useProducts();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const navItemStyle = ({ isActive }: { isActive: boolean }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        padding: '0.8rem 1.2rem',
        color: isActive ? '#fff' : '#a6adb4',
        textDecoration: 'none',
        backgroundColor: isActive ? '#1890ff' : 'transparent',
        transition: 'all 0.2s',
        fontSize: '0.9rem',
        fontWeight: 500,
        borderRadius: '4px',
        marginBottom: '0.3rem'
    });

    const navItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Genel Bakış' },
        { path: '/admin/products', icon: <ShoppingBag size={18} />, label: 'Ürün Yönetimi' },
        { path: '/admin/orders', icon: <ShoppingCart size={18} />, label: 'Siparişler' },
    ];

    const systemNavItems = [
        { path: '/admin/settings', icon: <Settings size={18} />, label: 'Ayarlar' },
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f2f5', fontFamily: '"Inter", sans-serif', position: 'relative' }}>
            {/* Sidebar Overlay for Mobile */}
            {isMobile && isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 1001
                    }}
                />
            )}

            {/* Sidebar */}
            <aside style={{
                width: '240px',
                backgroundColor: '#001529',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
                position: isMobile ? 'fixed' : 'relative',
                left: isMobile ? (isSidebarOpen ? 0 : '-240px') : 0,
                top: 0,
                bottom: 0,
                zIndex: 1002,
                transition: 'left 0.3s ease'
            }}>
                <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', backgroundColor: '#002140' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '4px', backgroundColor: '#1890ff', marginRight: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>C</div>
                        <h1 style={{ color: 'white', fontSize: '1.2rem', margin: 0, fontWeight: 700, letterSpacing: '0.5px' }}>CE & KA</h1>
                    </div>
                    {isMobile && (
                        <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                <nav style={{ flex: 1, padding: '1.5rem 0.8rem' }}>
                    <div style={{ padding: '0 0.8rem 0.6rem', fontSize: '0.7rem', color: '#5c6b7f', fontWeight: 'bold', textTransform: 'uppercase' }}>Ana Menü</div>
                    {navItems.map(item => (
                        <NavLink key={item.path} to={item.path} style={navItemStyle} onClick={() => isMobile && setIsSidebarOpen(false)}>
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}

                    <div style={{ padding: '1.5rem 0.8rem 0.6rem', fontSize: '0.7rem', color: '#5c6b7f', fontWeight: 'bold', textTransform: 'uppercase' }}>Sistem</div>
                    {systemNavItems.map(item => (
                        <NavLink key={item.path} to={item.path} style={navItemStyle} onClick={() => isMobile && setIsSidebarOpen(false)}>
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid #ffffff1a' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            width: '100%',
                            background: '#ffffff1a',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#ff7875',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            padding: '0.8rem',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#ffffff2a'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#ffffff1a'}
                    >
                        <LogOut size={18} />
                        Güvenli Çıkış
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Top Header */}
                <header style={{ height: '64px', backgroundColor: 'white', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '0 1rem' : '0 2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {isMobile && (
                            <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer' }}>
                                <Menu size={24} />
                            </button>
                        )}
                        {!isMobile && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8c8c8c' }}>
                                <Search size={18} />
                                <span style={{ fontSize: '0.9rem' }}>Arama yapmak için yazın...</span>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.8rem' : '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Bell size={20} color="#595959" style={{ cursor: 'pointer' }} />
                            <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '16px', height: '16px', backgroundColor: '#ff4d4f', borderRadius: '50%', fontSize: '10px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e6f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1890ff', fontWeight: 'bold' }}>{isMobile ? '' : 'M'}</div>
                            {!isMobile && <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#262626' }}>Mud H.</span>}
                        </div>
                    </div>
                </header>

                {/* Content Outlet */}
                <main style={{ flex: 1, overflowY: 'auto' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
