import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { SecurityProvider } from './context/SecurityContext';
import { ErrorBoundary } from './components/common/ErrorAlert';
import SecurityErrorBoundary from './components/common/SecurityErrorBoundary';
import './index.css';

/**
 * Main entry point for the AGFMA frontend application
 */

// Security: Prevent React DevTools in production
if (import.meta.env.PROD) {
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
    for (let prop in window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      if (prop === 'renderers') {
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] = new Map();
      } else {
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] = 
          typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] === 'function' 
            ? () => {} 
            : null;
      }
    }
  }
}

// Security: Prevent prototype pollution - REMOVED because it breaks Recharts library
// Object.freeze(Object.prototype);  // COMMENTED OUT - Causes issues with Recharts

// Alternative: More targeted prototype protection that doesn't break libraries
const protectPrototype = () => {
  // Only protect against adding new properties, but don't freeze completely
  if (!Object.isFrozen(Object.prototype)) {
    // Use Object.seal instead of freeze - allows existing properties to be modified
    // but prevents adding new properties
    Object.seal(Object.prototype);
  }
};

// Call the milder protection instead
protectPrototype();

// Security: Clear sensitive data on page load
const clearSensitiveData = () => {
  sessionStorage.removeItem('tempData');
  sessionStorage.removeItem('paymentInProgress');
  sessionStorage.removeItem('lastActivity');
};

// Security: Check for suspicious URL parameters
const checkForSuspiciousParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /onclick=/i,
    /alert\(/i,
    /eval\(/i,
  ];
  
  for (const [key, value] of urlParams.entries()) {
    if (value && suspiciousPatterns.some(pattern => pattern.test(value))) {
      urlParams.delete(key);
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      if (window.location.search !== urlParams.toString()) {
        window.history.replaceState({}, '', newUrl);
      }
      return true;
    }
  }
  return false;
};

// Configure error reporting
const handleError = (error, errorInfo) => {
  if (error?.message?.includes('security') || error?.message?.includes('CSP')) {
    return;
  }
  
  console.error('Application Error:', error, errorInfo);
};

// Initialize security
clearSensitiveData();
checkForSuspiciousParams();

// Render the application with future flags to silence React Router warnings
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SecurityErrorBoundary>
      <ErrorBoundary onError={handleError}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <SecurityProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </SecurityProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </SecurityErrorBoundary>
  </React.StrictMode>
);