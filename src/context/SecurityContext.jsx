import React, { createContext, useContext, useEffect, useState } from 'react';
import { SessionManager, addCSPHeaders } from '../config/security';

const SecurityContext = createContext();

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within SecurityProvider');
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  const [sessionManager] = useState(() => new SessionManager(30));
  const [isSessionActive, setIsSessionActive] = useState(true);

  useEffect(() => {
    // Add CSP headers
    addCSPHeaders();
    
    // Setup session timeout
    const resetSession = () => {
      sessionManager.resetTimer();
      setIsSessionActive(true);
    };
    
    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsSessionActive(false);
      window.location.href = '/login';
    };
    
    sessionManager.addListener(logout);
    
    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetSession);
    });
    
    sessionManager.startTimer();
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetSession);
      });
      sessionManager.clearTimer();
    };
  }, [sessionManager]);

  return (
    <SecurityContext.Provider value={{ isSessionActive, sessionManager }}>
      {children}
    </SecurityContext.Provider>
  );
};