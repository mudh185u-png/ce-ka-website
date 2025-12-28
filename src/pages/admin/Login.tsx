import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Key, AlertCircle, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useProducts();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const { error } = await login(email, password);

        if (error) {
            setError('Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin.');
            setIsLoading(false);
        } else {
            navigate('/admin/dashboard');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1e1e1e 0%, #111 100%)',
            fontFamily: "'Inter', sans-serif"
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    padding: '3rem',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    width: '100%',
                    maxWidth: '400px',
                    color: 'white'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        margin: '0 auto 1rem',
                        backgroundColor: 'rgba(212, 175, 55, 0.2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Lock color="#d4af37" size={30} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 600, margin: 0, color: '#f0f0f0' }}>Admin Girişi</h2>
                    <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.5rem' }}>Yönetici paneline erişim</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                    {error && (
                        <div style={{
                            padding: '0.8rem',
                            backgroundColor: 'rgba(255, 77, 79, 0.1)',
                            border: '1px solid #ff4d4f',
                            borderRadius: '8px',
                            color: '#ff4d4f',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div style={{ position: 'relative' }}>
                        <User size={18} color="#666" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="email"
                            placeholder="E-posta"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 2.5rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Key size={18} color="#666" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="password"
                            placeholder="Şifre"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 2.5rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#d4af37',
                            color: '#1a1a1a',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                            transition: 'transform 0.2s',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseOver={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(1.02)')}
                        onMouseOut={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Giriş Yap'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
