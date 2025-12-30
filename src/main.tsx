import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import './i18n'
import App from './App.tsx'
import { ProductProvider } from './context/ProductContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { ToastProvider } from './components/Toast.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <ProductProvider>
          <WishlistProvider>
            <CartProvider>
              <HelmetProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </HelmetProvider>
            </CartProvider>
          </WishlistProvider>
        </ProductProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)
