// AuthContext.jsx - Fixed version - No registration payment required
import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

if (typeof window !== 'undefined' && !window.process) {
    window.process = { env: {} };
}

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      const userData = data.user || data.data?.user;
      
      // FORCE registration status to true
      if (userData) {
        userData.hasPaidRegistration = true;
        userData.hasCompletedRegistration = true;
      }
      
      setUser(userData);
    } catch (error) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const token = data.token || data.data?.token;
      let userData = data.user || data.data?.user;
  
      if (!token || !userData) {
        throw new Error('Invalid response from server');
      }
  
      // FORCE registration status to true - NO PAYMENT REQUIRED
      userData = {
        ...userData,
        hasPaidRegistration: true,
        hasCompletedRegistration: true,
        isActive: true,
        role: userData?.role || 'admin'
      };
  
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
  
      toast.success('Login successful! Full access granted.');
  
      // DIRECT NAVIGATION TO DASHBOARD - NO REGISTRATION CHECKS
      // Send all users directly to dashboard regardless of role or payment status
      navigate('/dashboard');
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || error.message || 'Login failed');
      return { success: false };
    }
  };

  // Admin only registration - creates new members
  const registerMember = async (userData) => {
    try {
      const { data } = await api.post('/users/register', userData);
      toast.success('Member added successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add member';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    registerMember,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    hasPaidRegistration: true, // Always return true
    hasCompletedRegistration: true // Always return true
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};