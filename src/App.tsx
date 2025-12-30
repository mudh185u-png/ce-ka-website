import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import CategoryNav from './components/CategoryNav';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ProductDetails from './pages/ProductDetails';
import CategoryPage from './pages/CategoryPage';
import Auth from './pages/Auth';
import Checkout from './pages/Checkout';
import WhatsAppWidget from './components/WhatsAppWidget';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ProductManager from './pages/admin/ProductManager';
import OrdersManager from './pages/admin/OrdersManager';
import Settings from './pages/admin/Settings';
import AdminLayout from './pages/admin/AdminLayout';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import Terms from './pages/Terms';
import Wishlist from './pages/Wishlist';
import { useProducts } from './context/ProductContext';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useProducts();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

// Public Layout
const PublicLayout = () => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Header />
    <main style={{ flex: 1 }}>
      <Hero />
      <CategoryNav />
      <ProductGrid />
      <About />
      <Contact />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <>
      <Helmet>
        <title>Ce Ka Baza | Baza - Başlık - Yatak</title>
        <meta name="description" content="Ce Ka Baza - Kaliteli baza, başlık ve yatak ürünleri. En uygun fiyatlarla konforlu uykunun adresi." />
        <meta name="keywords" content="Ce Ka Baza, baza, başlık, yatak, mobilya, uyku seti, ce ka" />
        <link rel="canonical" href="https://ceka-baza.netlify.app/" />
        {/* JSON-LD for Local Business SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FurnitureStore",
            "name": "Ce Ka Baza",
            "image": "https://ceka-baza.netlify.app/vite.svg",
            "url": "https://ceka-baza.netlify.app/",
            "telephone": "+905550000000",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Siteler",
              "addressLocality": "Ankara",
              "addressCountry": "TR"
            },
            "priceRange": "$$"
          })}
        </script>
      </Helmet>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />} />
        <Route path="/product/:id" element={
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>
              <ProductDetails />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/category/:id" element={
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>
              <CategoryPage />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/auth" element={
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>
              <Auth />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/checkout" element={
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>
              <Checkout />
            </main>
            <Footer />
          </div>
        } />

        {/* Legal Routes */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/wishlist" element={<Wishlist />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin Panel Protected Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="orders" element={<OrdersManager />} />
          <Route path="settings" element={<Settings />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
      <WhatsAppWidget />
    </>
  );
}

export default App;
