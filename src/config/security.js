import DOMPurify from 'dompurify';

// Configure DOMPurify for XSS prevention
export const configureDOMPurify = () => {
  // Allow safe attributes and tags
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    // Remove dangerous attributes
    const dangerousAttrs = ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'];
    dangerousAttrs.forEach(attr => {
      if (node.hasAttribute(attr)) {
        node.removeAttribute(attr);
      }
    });
  });

  return DOMPurify;
};

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [], // No attributes allowed
      KEEP_CONTENT: true
    });
  }
  return input;
};

// Sanitize HTML content (for rich text)
export const sanitizeHTML = (html) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['class'],
  });
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const isStrongPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Rate limiting for API calls
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = new Map();
  }

  isAllowed(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Remove old requests
    const validRequests = userRequests.filter(time => now - time < this.timeWindow);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  clearExpired() {
    const now = Date.now();
    for (const [key, times] of this.requests.entries()) {
      const validTimes = times.filter(time => now - time < this.timeWindow);
      if (validTimes.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimes);
      }
    }
  }
}

export const apiRateLimiter = new RateLimiter(10, 60000); // 10 requests per minute

// Session timeout management
export class SessionManager {
  constructor(timeoutMinutes = 30) {
    this.timeoutMinutes = timeoutMinutes;
    this.timeoutId = null;
    this.listeners = [];
  }

  startTimer() {
    this.clearTimer();
    this.timeoutId = setTimeout(() => {
      this.onTimeout();
    }, this.timeoutMinutes * 60 * 1000);
  }

  clearTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  resetTimer() {
    this.startTimer();
  }

  onTimeout() {
    this.listeners.forEach(listener => listener());
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }
}

// Content Security Policy (CSP) meta tags
export const addCSPHeaders = () => {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.paystack.com https://js.paystack.co https://www.google.com https://www.gstatic.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com data:;
    img-src 'self' data: https:;
    connect-src 'self' https://api.paystack.co https://finlightmanager.web.app https://*.paystack.com https://finlight-backend.onrender.com wss:;
    frame-src https://checkout.paystack.com https://www.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim();
  
  // Remove existing CSP meta tag if present
  const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingCSP) {
    existingCSP.remove();
  }
  
  document.head.appendChild(meta);
};