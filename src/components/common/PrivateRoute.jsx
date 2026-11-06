// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import LoadingSpinner from './LoadingSpinner';

// /**
//  * Private Route Component
//  * Protects routes that require authentication
//  * Handles role-based access and registration payment lock
//  */
// const PrivateRoute = ({ children, roleRequired, requirePayment = true }) => {
//   const { isAuthenticated, loading, user, hasPaidRegistration } = useAuth();

//   if (loading) {
//     return <LoadingSpinner fullScreen />;
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   // Check role-based access
//   if (roleRequired === 'admin' && user?.role !== 'admin') {
//     return <Navigate to="/dashboard" replace />;
//   }

//   // Check role-based access for member routes
//   if (roleRequired === 'member' && user?.role !== 'member') {
//     return <Navigate to="/admin-dashboard" replace />;
//   }

//   // Check registration payment for members
//   if (requirePayment && user?.role === 'member' && !hasPaidRegistration) {
//     return <Navigate to="/payments" replace />;
//   }

//   return children || <Outlet />;
// };

// /**
//  * Route Guard for specific permissions
//  */
// export const PermissionGuard = ({ children, permissions, user }) => {
//   const hasPermission = permissions.some(permission => {
//     if (permission === 'admin' && user?.role === 'admin') return true;
//     if (permission === 'member' && user?.role === 'member') return true;
//     if (permission === 'paid' && user?.hasPaidRegistration) return true;
//     return false;
//   });

//   if (!hasPermission) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// };

// export default PrivateRoute;



// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import LoadingSpinner from './LoadingSpinner';

// const PrivateRoute = () => {
//   const { isAuthenticated, loading, user, hasPaidRegistration } = useAuth();

//   if (loading) {
//     return <LoadingSpinner fullScreen />;
//   }

//   if (!isAuthenticated || !user) {
//     return <Navigate to="/login" replace />;
//   }

//   // Role-based redirects
//   if (user.role === 'admin') {
//     // Admin trying to access member-only route? Redirect to admin dashboard
//     if (window.location.pathname === '/dashboard') {
//       return <Navigate to="/admin-dashboard" replace />;
//     }
//   } else {
//     // Member trying to access admin route
//     if (window.location.pathname.startsWith('/admin')) {
//       return <Navigate to="/dashboard" replace />;
//     }

//     // Check payment for members
//     if (!hasPaidRegistration && window.location.pathname !== '/payments') {
//       return <Navigate to="/payments" replace />;
//     }
//   }

//   return <Outlet />;
// };

// export default PrivateRoute;



import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children, roleRequired }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // SUPER ADMIN - Full access to everything (handle both formats)
  if (user?.role === 'super-admin' || user?.role === 'super_admin') {
    return children || <Outlet />;
  }

  // Check role-based access for non-super-admin users
  if (roleRequired === 'super-admin' && user?.role !== 'super-admin' && user?.role !== 'super_admin') {
    return <Navigate to={user?.role === 'admin' ? '/admin-dashboard' : '/dashboard'} replace />;
  }

  if (roleRequired === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (roleRequired === 'member' && user?.role !== 'member') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // REMOVED: No forced redirect to payments for members without registration
  // Members can access dashboard freely and pay whenever they want
  // The reminder card in the dashboard will handle payment reminders

  return children || <Outlet />;
};

export default PrivateRoute;