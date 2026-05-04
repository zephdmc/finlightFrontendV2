import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

import Login from './pages/Login';
import PrivateRoute from './components/common/PrivateRoute';
import ProfileSettings from './pages/ProfileSettings';
import AdminDashboardPage from './components/dashboard/AdminDashboard';
import MemberDashboardPage from './pages/MemberDashboardPage';
import MemberDashboard from './components/dashboard/MemberDashboard';
import PaymentsPage from './pages/PaymentsPage';
import MembersPage from './pages/MembersPage';
import ReportsPage from './pages/ReportsPage';
import AccountPage from './pages/AccountPage';
import Register from './pages/Register';
import MemberDetails from './components/members/MemberDetails';
import MemberForm from './components/members/MemberForm';
import LandingPage from './pages/LandingPage';
import LearnMore from './pages/LearnMore';
import TermsAndConditions from './pages/termsandcondition';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy.';
import PaystackCallback from './components/payment/PaystackCallback'; // Add this import


// Remove SecurityAudit import
// import SecurityAudit from './components/common/SecurityAudit';

function App() {
  // Security: Clear sensitive data on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear sensitive data from memory
      sessionStorage.removeItem('tempData');
      sessionStorage.removeItem('paymentInProgress');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Security: Prevent navigation from non-authenticated states
  useEffect(() => {
    const token = localStorage.getItem('token');
    const protectedPaths = ['/dashboard', '/payments', '/members', '/reports', '/account'];
    const currentPath = window.location.pathname;
    
    if (!token && protectedPaths.some(path => currentPath.startsWith(path))) {
      window.location.href = '/login';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Removed SecurityAudit component */}
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            zIndex: 9999,
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/learn-more" element={<LearnMore />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
          {/* PAYSTACK CALLBACK - MUST BE PUBLIC */}
          <Route path="/payment/callback" element={<PaystackCallback />} />
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />


        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<MemberDashboardPage />} />
          <Route path="/dashboard1" element={<MemberDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/members/:id" element={<MemberDetails />} />
          <Route path="/members/edit/:id" element={<MemberForm isEdit={true} />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

        {/* 404 - Catch all undefined routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;