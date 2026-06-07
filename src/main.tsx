import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { getFirebaseAnalytics } from './firebase/config';
import './index.css';
import App from './App';

// Initialize analytics (non-blocking)
getFirebaseAnalytics();

const rootElement = document.getElementById('root')!;

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <CartProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
