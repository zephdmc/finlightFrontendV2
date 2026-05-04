import { useEffect } from 'react';
import { useSecurity } from '../../context/SecurityContext';

const SecurityAudit = () => {
  const { isSessionActive } = useSecurity();

  useEffect(() => {
    // Log security events
    const logSecurityEvent = (event, details) => {
      console.log(`[SECURITY] ${event}:`, details);
      // In production, send to server for logging
    };

    // Check for HTTPS
    if (window.location.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
      logSecurityEvent('INSECURE_CONNECTION', 'Application running over HTTP');
    }

    // Check for localStorage security
    try {
      const testKey = '__security_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (e) {
      logSecurityEvent('STORAGE_ERROR', 'Unable to access localStorage');
    }

    // Monitor for suspicious activity
    const detectDevTools = () => {
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        logSecurityEvent('DEV_TOOLS_DETECTED', 'Developer tools may be open');
      }
    };

    setInterval(detectDevTools, 5000);

  }, []);

  return null;
};

export default SecurityAudit;