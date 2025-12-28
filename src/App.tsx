import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ProductManager from './pages/admin/ProductManager';
import OrdersManager from './pages/admin/OrdersManager';
import Settings from './pages/admin/Settings';
import AdminLayout from './pages/admin/AdminLayout';
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
  );
}

export default App;
