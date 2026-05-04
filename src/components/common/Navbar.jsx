import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Users, 
  CreditCard, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  User,
  Settings,
  Wallet,
  ChevronRight,
  Bell,
  Shield,
  UserCircle
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
      return { text: 'Admin', color: 'bg-purple-100 text-purple-700' };
    }
    return { text: 'Member', color: 'bg-blue-100 text-blue-700' };
  };

  const roleBadge = getRoleBadge();

// In Navbar.jsx, update the getProfileLink function:
const getProfileLink = () => {
    if (!user) return '#';
    const userId = user._id || user.id;
    console.log('Profile link - User ID:', userId);
    return `/members/${userId}`;
  };
    
  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-14 md:h-16 items-center">
            {/* Logo */}
            <Link 
              to={isAdmin ? '/admin-dashboard' : '/dashboard'} 
              className="flex items-center gap-2 group"
            >
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <span className="text-white font-bold text-base">F</span>
              </div>
              <div>
              <span className="font-bold text-blue-600 text-base">FinLight</span>
                {/* <span className="font-bold text-gray-800 text-base hidden sm:inline">FinLight</span> */}
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
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
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
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
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-base">
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
                    {/* My Profile Link - goes to member's own details page */}
                    <Link
                      to={getProfileLink()}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <UserCircle className="h-4 w-4" />
                      <span className="text-sm">My Profile</span>
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="text-sm">Profile Settings</span>
                    </Link>
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
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu - Slide from top */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-14 bg-white z-40 animate-slide-down">
            <div className="flex flex-col h-full">
              {/* User Profile Section */}
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 mx-4 mt-4 rounded-2xl text-white">
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

              {/* Navigation Links */}
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        active
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                      <span className="font-medium">{item.name}</span>
                      {active && <ChevronRight className="h-4 w-4 ml-auto" />}
                    </Link>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="p-4 border-t border-gray-100 space-y-2">
                {/* My Profile Link for Mobile */}
                <Link
                  to={getProfileLink()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <UserCircle className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">My Profile</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Settings className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Profile Settings</span>
                </Link>
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
                <p className="text-xs text-gray-400">Version 1.0.0</p>
              </div>
            </div>
          </div>
        )}
      </nav>

      <style jsx>{`
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
    </>
  );
};

export default Navbar;