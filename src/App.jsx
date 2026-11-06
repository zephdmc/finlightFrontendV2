import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuth } from './context/AuthContext';
import { queryClient } from './config/queryClient';
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
import PaymentCallback from './components/payment/PaymentCallback';
import Organizations from './components/dashboard/UperAdminOrganizations';
import Signup from './pages/Signup';
import OrganizationSettings from './pages/OrganizationSettings';
import BankChangeRequest from './pages/BankChangeRequest';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import PaymentVerify from './pages/PaymentVerify';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import MakePaymentPage from './pages/MakePaymentPage';
import AdminHistoryPage from './pages/AdminHistoryPage';
import FineManagementPage from './pages/FineManagementPage';
import PaymentTypeManagementPage from './pages/PaymentTypeManagementPage';
import FinancialTransparency from './pages/FinancialTransparency';
import DuesDashboard from './pages/DuesDashboard';
import DeleteAccount from './pages/DeleteAccount';

// Main App component wrapped with QueryClientProvider
function AppContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Security: Clear sensitive data on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('tempData');
      sessionStorage.removeItem('paymentInProgress');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Clear React Query cache on logout (when user changes)
  useEffect(() => {
    if (!isAuthenticated && user === null) {
      // Clear all cached data when user logs out
      queryClient.clear();
    }
  }, [isAuthenticated, user]);
  useEffect(() => {
    const backHandler = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        navigate(-1);
      } else {
        CapacitorApp.exitApp();
      }
    });
    return () => backHandler.remove();
  }, [navigate]);

  // Get the appropriate dashboard based on user role
  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'super-admin' || user.role === 'super_admin') return '/admin/organizations';
    if (user.role === 'admin') return '/admin-dashboard';
    return '/dashboard';
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            color: '#fff',
            zIndex: 9999,
            fontSize: '10px',
            padding: '8px 18px',
            borderRadius: '7px',
            background: "rgba(41, 68, 245, 0.85)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.16)",


          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              background: '#10b981',
              backdropFilter: "blur(10px)",
              color: '#fff',
              fontSize: '10px',
              padding: '8px 18px',
              borderRadius: '7px',
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.16)",

            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              fontSize: '10px',
              padding: '8px 10px',
              borderRadius: '7px',
              backdropFilter: "blur(10px)",
              color: "#fff",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.16)",

            },
          },
        }}
      />

      <Routes>
        {/* Public Routes - Everyone can access */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/learn-more" element={<LearnMore />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />


        {/* PAYSTACK CALLBACK - MUST BE PUBLIC */}
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/payment-verify" element={<PaymentVerify />} />
        {/* Super Admin Only Routes */}
        <Route element={<PrivateRoute roleRequired="super-admin" />}>
          <Route path="/admin/organizations" element={<Organizations />} />
        </Route>

        {/* Admin Only Routes - NO profile here */}
        <Route element={<PrivateRoute roleRequired="admin" />}>
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="/members/*" element={<MembersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/organization-settings" element={<OrganizationSettings />} />
          <Route path="/bank-change-request" element={<BankChangeRequest />} />
          <Route path="/admin-history" element={<AdminHistoryPage />} />
          <Route path="/fine-management" element={<FineManagementPage />} />
          <Route path="/contribution-management" element={<PaymentTypeManagementPage />} />
        </Route>

        {/* Member Only Routes - NO profile here either */}
        <Route element={<PrivateRoute roleRequired="member" />}>
          <Route path="/dashboard" element={<MemberDashboardPage />} />
          <Route path="/dashboard1" element={<MemberDashboard />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/payment-history" element={<PaymentHistoryPage />} />
          <Route path="/make-payment" element={<MakePaymentPage />} />
          <Route path="/financial-transparency" element={<FinancialTransparency />} />
          <Route path="/member/dues" element={<DuesDashboard />} />
        </Route>

        {/* ===== PROFILE ROUTE - Separate for both admin and member ===== */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfileSettings />
            </PrivateRoute>
          }
        />

        {/* ===== PAYMENTS ROUTE - Separate for both admin and member ===== */}
        <Route
          path="/payments"
          element={
            <PrivateRoute>
              <PaymentsPage />
            </PrivateRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to={getDashboardPath()} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

// Main App with QueryClientProvider wrapper
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      {/* React Query DevTools - only in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />}
    </QueryClientProvider>
  );
}

export default App;