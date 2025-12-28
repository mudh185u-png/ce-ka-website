import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import './i18n'
import App from './App.tsx'
import { ProductProvider } from './context/ProductContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { ToastProvider } from './components/Toast.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <ProductProvider>
          <CartProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </CartProvider>
        </ProductProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
)
