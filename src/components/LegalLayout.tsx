import React, { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LegalLayoutProps {
    title: string;
    children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ title, children }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1, backgroundColor: '#f9fafb', padding: '4rem 1rem' }}>
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    backgroundColor: '#fff',
                    padding: '3rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        marginBottom: '2rem',
                        fontFamily: "'Playfair Display', serif",
                        color: '#111',
                        textAlign: 'center'
                    }}>
                        {title}
                    </h1>
                    <div style={{
                        lineHeight: '1.8',
                        color: '#4b5563',
                        fontSize: '1.1rem'
                    }}>
                        {children}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default LegalLayout;
