// AuthContext.jsx - Multi‑tenant version (fixed)
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

      // Only set registration flags if the backend doesn't send them (temporary)
      if (userData) {
        if (userData.hasPaidRegistration === undefined) userData.hasPaidRegistration = true;
        if (userData.hasCompletedRegistration === undefined) userData.hasCompletedRegistration = true;
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

      // Ensure organizationId is present (backend should provide it)
      if (!userData.organizationId) {
        console.warn('Login response missing organizationId – multi‑tenancy may not work correctly');
      }

      // Do NOT force role to 'admin' – keep the backend's role
      // Add temporary flags only if missing
      userData = {
        ...userData,
        hasPaidRegistration: userData.hasPaidRegistration ?? true,
        hasCompletedRegistration: userData.hasCompletedRegistration ?? true,
        isActive: userData.isActive ?? true,
        // role is kept as is from backend
      };

      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);

      toast.success('Login successful!');

      // 🧭 Navigate based on role
      if (userData.role === 'super-admin') {
        navigate('/super-admin/dashboard');
      } else if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);

      let msg = 'Login failed. Please try again.';

      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        msg = 'Server is waking up. Please wait 30–60 seconds and try again.';
      } else if (!error.response) {
        msg = 'Cannot reach the server. Please check your internet connection.';
      } else {
        const data = error.response.data;
        const status = error.response.status;

        if (data?.message) {
          msg = data.message;
        } else if (Array.isArray(data?.errors) && data.errors.length > 0) {
          // ValidationMiddleware returns { errors: [{ field, message }] }
          msg = data.errors.map((e) => e.message || e.msg).join(' ');
        } else if (status === 401) {
          msg = 'Invalid email or password.';
        } else if (status === 429) {
          msg = 'Too many login attempts. Please try again later.';
        } else if (status >= 500) {
          msg = 'Server error. Please try again in a moment.';
        }
      }

      toast.error(msg, { duration: 6000 });
      return { success: false, error: msg };   // ← also return the message
    }
  };

  // Admin only registration – creates new members under the same organization
  const registerMember = async (userData) => {
    try {
      // The backend will automatically assign the organization of the logged‑in admin.
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
    isSuperAdmin: user?.role === 'super-admin',  // match backend role string
    hasPaidRegistration: user?.hasPaidRegistration ?? true,
    hasCompletedRegistration: user?.hasCompletedRegistration ?? true,
    organizationId: user?.organizationId,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};