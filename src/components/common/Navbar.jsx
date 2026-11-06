import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Trash2, AlertTriangle, X, CheckCircle, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api'; // or wherever your axios instance is
import { useAuth } from '../../context/AuthContext';
import NotificationBell from "../notifications/NotificationBell";
import {
  Home,
  Users,
  CreditCard,
  BarChart3,
  LogOut,
  Menu,
  User,
  Settings,
  Wallet,
  ChevronRight,
  Bell,
  Shield,
  UserCircle,
  Building  // âœ… ADD THIS IMPORT
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMemberDeleteModal, setShowMemberDeleteModal] = useState(false);

  const [showAdminDeleteModal, setShowAdminDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1); // 1=warning, 2=confirm code, 3=reason
  const [typedWord, setTypedWord] = useState('');
  const [wordError, setWordError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [orgEmail, setOrgEmail] = useState('');

  const handleBackToHome = () => {
    navigate(isAdmin ? '/admin-dashboard' : '/dashboard');
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = isAdmin ? [
    { name: 'Dashboard', href: '/admin-dashboard', icon: Home },
    { name: 'Members', href: '/members', icon: Users },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Account', href: '/account', icon: Wallet }
  ] : [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Payments', href: '/payments', icon: CreditCard }
  ];

  const isActive = (path) => location.pathname === path;


  // Mask email: first 3 + *** + last 3
  const maskEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (name.length <= 6) return `${name.slice(0, 2)}***@${domain}`;
    return `${name.slice(0, 3)}***${name.slice(-3)}@${domain}`;
  };

  // Admin: Step 1 → Step 2 (send code)
  const handleAdminStep1 = async () => {
    if (typedWord.trim() !== 'Delete Our account') {
      setWordError('Please type exactly: Delete Our account');
      return;
    }
    setWordError('');
    setIsSendingCode(true);

    try {
      const response = await api.post('/organizations/request-delete-code');
      setOrgEmail(response.data.email || user?.email || '');
      setDeleteStep(2);
      toast.success('Verification code sent to organization email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send code. Try again.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Admin: Resend code
  const handleResendCode = async () => {
    setIsSendingCode(true);
    try {
      await api.post('/organizations/request-delete-code');
      toast.success('New code sent to organization email');
    } catch (error) {
      toast.error('Failed to resend code. Try again.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Admin: Final delete
  const handleAdminDelete = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }
    if (!deleteReason.trim()) {
      toast.error('Please provide a reason for deleting the account');
      return;
    }

    setIsDeleting(true);
    try {
      await api.post('/organizations/delete-account', {
        code: verificationCode,
        reason: deleteReason,
      });

      toast.success('Organization account deleted successfully');
      setShowAdminDeleteModal(false);
      logout();
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Deletion failed. Check your code.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Close admin modal and reset
  const closeAdminModal = () => {
    setShowAdminDeleteModal(false);
    setDeleteStep(1);
    setTypedWord('');
    setWordError('');
    setVerificationCode('');
    setDeleteReason('');
    setOrgEmail('');
  };

  // Member: Show contact admin popup
  const openMemberDeleteModal = () => {
    setShowMemberDeleteModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const getUserInitial = () => {
    return user?.name?.charAt(0).toUpperCase() || 'U';
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return { text: 'Admin', color: 'bg-blue-100 text-blue-700' };
    }
    return { text: 'Member', color: 'bg-blue-100 text-blue-700' };
  };

  const roleBadge = getRoleBadge();

  // FIXED: Profile link should go to profile settings, NOT members page
  const getProfileLink = () => {
    return '/profile';  // Simple - members go to profile settings
  };

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled && !isMobile
        ? 'bg-white shadow-xl'
        : 'bg-white '
        }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-14 md:h-16 items-center">
            {/* Logo */}
            <Link
              to={isAdmin ? '/admin-dashboard' : '/dashboard'}
              className="flex items-center gap-2 group"
            >
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-[#2683e9] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                {/* <span className="text-white font-bold text-base">F</span> */}


                <div className={`
                inline-flex items-center justify-center
                ${scrolled && !isMobile
                    ? ` rounded-2xl bg-gradient-to-br from-[#2683e9] to-[#2683e9] shadow-[0_0_0_8px_rgba(38,131,233,0.15),0_0_0_16px_rgba(38,131,233,0.08)] cursor-pointer hover:scale-105 transition-transform relative p-1 w-20 h-20`
                    : 'bg-white shadow-xl'  // Desktop scrolled: solid white with stronger shadow
                  // Everything else: solid white with normal shadow
                  }`} onClick={handleBackToHome}>
                  <div className="absolute top-2 left-3 w-5 h-2.5 bg-blue/35 rounded-lg rotate-[-20deg] z-10" />
                  <img
                    src="/icon-192x192.png"
                    alt="Finlight Logo"
                    className="w-full h-full object-contain  z-10"
                  />
                </div>


              </div>
              <div>
                <span className="font-bold text-blue-600 text-base">FinLight</span>
                <p className="text-xs text-gray-500 hidden lg:block">Association</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active
                      ? 'bg-gradient-to-r from-blue-600 to-[#2683e9] text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-gray-500'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center gap-4">
              {/* Notification Bell */}
              <NotificationBell />

              {/* User Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-600 to-[#2683e9] flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {getUserInitial()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium text-gray-800">{user?.name?.split(' ')[0]}</p>
                    <p className="text-xs text-gray-500">{isAdmin ? 'Administrator' : 'Member'}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:rotate-90 hidden lg:block" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-100">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-[#2683e9] flex items-center justify-center text-white font-semibold text-base">
                        {getUserInitial()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${roleBadge.color}`}>
                          {roleBadge.text}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    {/* My Profile Link */}
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <UserCircle className="h-4 w-4" />
                      <span className="text-sm">My Profile</span>
                    </Link>
                    <Link
                      to="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Wallet className="h-4 w-4" />
                      <span className="text-sm">Account</span>
                    </Link>
                    {/* Delete Account - Different for Admin vs Member */}
                    <button
                      onClick={() => {
                        if (isAdmin) {
                          setShowAdminDeleteModal(true);
                        } else {
                          openMemberDeleteModal();
                        }
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-sm">Delete Account</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <div className="md:hidden py-2 h-9 w-9 text-gray-600 flex items-center gap-3">
                <NotificationBell />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-600 to-[#2683e9] flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {getUserInitial()}
                  </div>
                  // <Menu className="h-6 w-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu - Slide from top */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-14 bg-white z-40 animate-slide-down">
            {/* Mobile Top Bar */}
            <div className="flex items-center justify-between px-2 py-1 border-b">
              <div className="font-semibold text-blue-600 text-xs">Smart Finance, <i className="text-blue-900 text-xs">Strong Community</i></div>
              {/*
              <div className="flex items-center gap-3">
                <NotificationBell />
              </div> */}
            </div>
            <div className="flex flex-col h-full">
              {/* User Profile Section */}
              <div className="p-4 bg-gradient-to-r from-blue-600 to-[#2683e9] mx-4 mt-4 rounded-2xl text-white">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl">
                    {getUserInitial()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-base">{user?.name}</p>
                    <p className="text-xs text-blue-100">{user?.email}</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-white/20`}>
                      {roleBadge.text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Links
              <div className="flex-1 p-4 space-y-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">Menu</p>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                        ? 'bg-gradient-to-r from-blue-600 to-[#2683e9]-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                      <span className="font-medium">{item.name}</span>
                      {active && <ChevronRight className="h-4 w-4 ml-auto" />}
                    </Link>
                  );
                })}
              </div> */}

              {/* Bottom Actions */}
              <div className="p-4 border-t border-gray-100 space-y-2">
                {/* My Profile Link for Mobile */}
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <UserCircle className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">My Profile</span>
                </Link>

                {/* Organization Settings - Admin Only
                {isAdmin && (
                  <Link
                    to="/organization-settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Building className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">Organization Settings</span>
                  </Link>
                )} */}

                {/* Bank Change Request - Admin Only */}
                {isAdmin && (
                  <Link
                    to="/bank-change-request"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">Request Bank Change</span>
                  </Link>
                )}
                {/* Delete Account - Mobile */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (isAdmin) {
                      setShowAdminDeleteModal(true);
                    } else {
                      openMemberDeleteModal();
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="font-medium">Delete Account</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>

              {/* Version Info */}
              <div className="p-4 text-center">
                <p className="text-xs text-gray-400">Version 2.0.0</p>
              </div>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
      {/* ==================== MEMBER DELETE MODAL ==================== */}
      {showMemberDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowMemberDeleteModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Contact Your Admin</h3>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Member accounts are managed by your organization's administrator. You cannot delete your account directly.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-gray-800 mb-2">What will be deleted:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your name</li>
                <li>• Your email address</li>
                <li>• Your user ID</li>
                <li>• Your phone number</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                <strong>Note:</strong> Transaction history will be retained for legal and compliance purposes.
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>To delete your account:</strong> Contact your organization admin and request account deletion.
              </p>
            </div>

            <button
              onClick={() => setShowMemberDeleteModal(false)}
              className="w-full bg-gray-900 text-white py-2.5 rounded-xl font-medium hover:bg-gray-800 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ==================== ADMIN DELETE MODAL ==================== */}
      {showAdminDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeAdminModal}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            {/* STEP 1: Warning + Type Word */}
            {deleteStep === 1 && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Organization</h3>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-red-800 font-medium mb-2">
                    ⚠️ This action is permanent and cannot be undone.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">What will be deleted:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Organization profile and settings</li>
                    <li>• All member profiles (names, emails, IDs, phones)</li>
                    <li>• All login credentials</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-3">
                    <strong>What is kept:</strong> All transaction history and financial records will be retained for legal and compliance purposes.
                  </p>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-bold text-red-600">Delete Our account</span> to confirm:
                </label>
                <input
                  type="text"
                  value={typedWord}
                  onChange={(e) => {
                    setTypedWord(e.target.value);
                    setWordError('');
                  }}
                  placeholder="Delete Our account"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent mb-2"
                />
                {wordError && <p className="text-xs text-red-600 mb-2">{wordError}</p>}

                <button
                  onClick={handleAdminStep1}
                  disabled={isSendingCode}
                  className="w-full bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isSendingCode ? 'Sending Code...' : 'Next'}
                </button>
              </>
            )}

            {/* STEP 2: Enter Code + Reason */}
            {deleteStep === 2 && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Verify & Confirm</h3>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    A verification code has been sent to:
                  </p>
                  <p className="text-sm font-bold text-blue-900 mt-1">
                    {maskEmail(orgEmail || user?.email)}
                  </p>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent mb-2"
                />
                <button
                  onClick={handleResendCode}
                  disabled={isSendingCode}
                  className="text-xs text-blue-600 hover:underline mb-4 disabled:opacity-50"
                >
                  {isSendingCode ? 'Sending...' : "Didn't get the code? Resend"}
                </button>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for deletion <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Please tell us why you are deleting this account..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                />

                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-xs text-red-800">
                    <strong>Final Warning:</strong> This will permanently delete the organization and all member profiles. Transaction history will be kept for legal compliance.
                  </p>
                </div>

                <button
                  onClick={handleAdminDelete}
                  disabled={isDeleting || !verificationCode.trim() || !deleteReason.trim()}
                  className="w-full bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Organization Permanently'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;