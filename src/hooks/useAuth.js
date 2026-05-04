import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook for accessing authentication context
 * Provides a convenient way to use auth state and methods
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Hook for checking if user has specific role
 */
export const useRole = (requiredRole) => {
  const { user } = useAuth();
  
  if (!user) return false;
  
  if (requiredRole === 'admin') {
    return user.role === 'admin';
  }
  
  if (requiredRole === 'member') {
    return user.role === 'member';
  }
  
  return false;
};

/**
 * Hook for checking if member has paid registration
 */
export const useRegistrationStatus = () => {
  const { user, hasPaidRegistration } = useAuth();
  
  if (!user) return { hasPaid: false, isAdmin: false };
  
  return {
    hasPaid: hasPaidRegistration || user.role === 'admin',
    isAdmin: user.role === 'admin',
    requiresPayment: user.role === 'member' && !hasPaidRegistration
  };
};

export default useAuth;