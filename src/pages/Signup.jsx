// Signup.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Shield, Mail, Lock, User, Building, ArrowLeft, CheckCircle, Loader2, Server, Network, Database, UserPlus, X, Home, Users, TrendingUp, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { warmupBackend } from '../services/api';


const PasswordRule = ({ passed, label }) => (
  <li className={`flex items-center gap-1 transition-colors duration-200 ${passed ? 'text-green-400' : 'text-gray-500'
    }`}>
    {passed ? (
      <CheckCircle className="h-3 w-3 flex-shrink-0" />
    ) : (
      <X className="h-3 w-3 flex-shrink-0" />
    )}
    <span>{label}</span>
  </li>
);



const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityStage, setSecurityStage] = useState(0);
  const [securityMessage, setSecurityMessage] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Terms & Conditions state
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);


  useEffect(() => {
    warmupBackend();
  }, []);

  const [formData, setFormData] = useState({
    orgName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: ''
  });


  // Password requirement checks
  const passwordChecks = {
    length: formData.adminPassword.length >= 8,
    uppercase: /[A-Z]/.test(formData.adminPassword),
    lowercase: /[a-z]/.test(formData.adminPassword),
    number: /\d/.test(formData.adminPassword),
  };

  const allPasswordChecksPassed = Object.values(passwordChecks).every(Boolean);

  // Carousel slides with background images
  const carouselSlides = [
    {
      icon: Building,
      title: 'Create Your Organization',
      description: 'Set up your association or community group in minutes',
      gradient: 'from-blue-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
      overlayColor: 'from-black/70 via-black/50 to-black/70'
    },
    {
      icon: Users,
      title: 'Add Members',
      description: 'Invite and manage members with ease',
      gradient: 'from-blue-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop',
      overlayColor: 'from-black/70 via-black/50 to-black/70'
    },
    {
      icon: Wallet,
      title: 'Start Collecting Dues',
      description: 'Begin collecting contributions and tracking payments instantly',
      gradient: 'from-blue-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      overlayColor: 'from-black/70 via-black/50 to-black/70'
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Community',
      description: 'Scale your organization with powerful financial tools',
      gradient: 'from-blue-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
      overlayColor: 'from-black/70 via-black/50 to-black/70'
    }
  ];

  const securityStages = [
    {
      icon: UserPlus,
      title: "Initializing Organization Setup",
      message: "Preparing secure workspace for your association...",
      duration: 8000,
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Server,
      title: "Creating Secure Account",
      message: "Setting up encrypted organization profile...",
      duration: 10000,
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: Database,
      title: "Configuring Financial Systems",
      message: "Building contribution & member management modules...",
      duration: 12000,
      color: "from-indigo-500 to-purple-600"
    },
    {
      icon: Network,
      title: "Establishing Connections",
      message: "Connecting payment gateways and notification systems...",
      duration: 9000,
      color: "from-purple-500 to-blue-600"
    },
    {
      icon: Shield,
      title: "Finalizing Security",
      message: "Applying bank-grade encryption and compliance checks...",
      duration: 9000,
      color: "from-green-500 to-emerald-600"
    }
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    if (isMobile) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isMobile]);

  useEffect(() => {
    if (!showSecurityModal) return;

    let stageIndex = 0;
    setSecurityStage(0);
    setSecurityMessage(securityStages[0].title);

    const runStage = () => {
      if (stageIndex < securityStages.length - 1) {
        stageIndex++;
        setSecurityStage(stageIndex);
        setSecurityMessage(securityStages[stageIndex].title);
        setTimeout(runStage, securityStages[stageIndex].duration);
      }
    };

    setTimeout(runStage, securityStages[0].duration);

    return () => { };
  }, [showSecurityModal]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTermsChange = (e) => {
    setAcceptedTerms(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptedTerms) {
      toast.error('You must agree to the Terms and Conditions');
      return;
    }

    if (formData.adminPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.adminPassword.length < 8) {
      toast.error('Password must be at least 8 characters, with uppercase, lowercase, and a number');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.adminPassword)) {
      toast.error('Password must contain uppercase, lowercase, and a number');
      return;
    }

    setLoading(true);
    setShowSecurityModal(true);
    setSecurityStage(0);
    setSecurityMessage(securityStages[0].title);

    try {
      const response = await api.post('/auth/signup', {
        orgName: formData.orgName,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      await login(formData.adminEmail, formData.adminPassword);

      await new Promise(resolve => setTimeout(resolve, 1800));

      setShowSecurityModal(false);
      toast.success('Organization created successfully! Welcome aboard.');
    } catch (error) {
      let msg = 'Login failed. Please try again.';

      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        msg = 'Server is waking up. Please wait 30â€“60 seconds and try again.';
      } else if (!error.response) {
        msg = 'Cannot reach the server. Please check your internet connection.';
      } else {
        const data = error.response.data;
        if (data?.message) msg = data.message;
        else if (Array.isArray(data?.errors) && data.errors.length > 0) {
          msg = data.errors.map(e => e.msg).join(' ');
        } else if (error.response.status === 401) {
          msg = 'Invalid email or password.';
        } else if (error.response.status === 429) {
          msg = 'Too many login attempts. Please try again later.';
        } else if (error.response.status >= 500) {
          msg = 'Server error. Please try again in a moment.';
        }
      }

      toast.error(msg, { duration: 8000 });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const currentStage = securityStages[securityStage] || securityStages[0];
  const CurrentIcon = currentStage.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, rgba(237, 238, 239, 0.85), rgba(246, 247, 248, 0.94))',
    }}>
      {/* Main Container - Desktop View */}
      <div className="w-full max-w-6xl">
        {/* Centered Logo/Brand Section - Desktop Only */}
        {!isMobile && (
          <div className="text-center mb-6">
            {/* Back to Home Button */}
            <button
              onClick={handleBackToHome}
              className="mb-4 flex items-left gap-2 text-gray-400 hover:text-blue-400 transition-colors group "
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Back to Home</span>
            </button>

            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#012a7b] to-[#2683e9] shadow-[0_0_0_8px_rgba(38,131,233,0.15),0_0_0_16px_rgba(38,131,233,0.08)] cursor-pointer hover:scale-105 transition-transform relative p-1" onClick={handleBackToHome}>
              <div className="absolute top-2 left-3 w-5 h-2.5 bg-white/35 rounded-lg rotate-[-20deg] z-10" />
              <img
                src="/icon-192x192.png"
                alt="Finlight Logo"
                className="w-full h-full object-contain rounded-xl z-10"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
              Finlight
            </h1>
            <p className="text-gray-400 text-sm mt-1">Secure Financial Management</p>
          </div>
        )}

        {/* Mobile Logo Section */}
        {isMobile && (
          <div className="text-center mb-6">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group justify-center mb-4"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Back to Home</span>
            </button>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#012a7b] to-[#2683e9] shadow-[0_0_0_8px_rgba(38,131,233,0.15),0_0_0_16px_rgba(38,131,233,0.08)] cursor-pointer hover:scale-105 transition-transform relative p-1" onClick={handleBackToHome}>
              <div className="absolute top-2 left-3 w-5 h-2.5 bg-white/35 rounded-lg rotate-[-20deg] z-10" />
              <img
                src="/icon-192x192.png"
                alt="Finlight Logo"
                className="w-full h-full object-contain rounded-xl z-10"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
              Finlight
            </h1>
            <p className="text-gray-400 text-sm mt-1">Secure Financial Management</p>
          </div>
        )}

        {/* Desktop: Form + Carousel Side by Side */}
        <div className={`${isMobile ? '' : 'grid grid-cols-2 gap-6 m-6 p-4 bg-gradient-to-br from-gray-100/95 to-gray-100/95 backdrop-blur-sm rounded-3xl shadow-sm border border-blue-300 overflow-hidden material-card'} `}>
          {/* Left Side - Signup Form */}
          <div className={`${isMobile ? 'w-full' : ''}`}>
            <div className="bg-gradient-to-br from-gray-100/95 to-gray-100/95 backdrop-blur-sm rounded-3xl shadow-sm border border-blue-300 overflow-hidden material-card">
              <div className="p-4 md:p-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Create Your Organization</h2>
                  <p className="text-gray-400 text-xs mt-1">Start managing your association finances</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Organization Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Organization Name
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        name="orgName"
                        value={formData.orgName}
                        onChange={handleChange}
                        placeholder="e.g., AGFMA"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-blue-300/50 border border-blue-700 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Your Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        name="adminName"
                        value={formData.adminName}
                        onChange={handleChange}
                        placeholder="Full name"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-blue-300/50 border border-blue-700 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="email"
                        name="adminEmail"
                        value={formData.adminEmail}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-blue-300/50 border border-blue-700 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  {/* Password */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="password"
                        name="adminPassword"
                        value={formData.adminPassword}
                        onChange={handleChange}
                        placeholder="At least 8 characters"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-blue-300/50 border border-blue-700 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        required
                      />
                    </div>

                    {/* Live password requirements */}
                    {formData.adminPassword.length > 0 && (
                      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                        <PasswordRule passed={passwordChecks.length} label="8+ characters" />
                        <PasswordRule passed={passwordChecks.uppercase} label="Uppercase letter" />
                        <PasswordRule passed={passwordChecks.lowercase} label="Lowercase letter" />
                        <PasswordRule passed={passwordChecks.number} label="Number" />
                      </ul>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-blue-300/50 border border-blue-700 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptedTerms}
                      onChange={handleTermsChange}
                      className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer flex-shrink-0"
                    />
                    <label htmlFor="terms" className="text-xs text-gray-400 select-none">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer transition-colors"
                      >
                        Terms and Conditions
                      </button>
                      {' '}and{' '}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer transition-colors"
                      >
                        Privacy Policy
                      </button>.
                    </label>
                  </div>

                  {/* Signup Button */}
                  <button
                    type="submit"
                    disabled={loading || !acceptedTerms || !allPasswordChecksPassed}
                    className="relative w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden group"
                  >
                    {loading ? (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse"></div>
                        <div className="relative z-10 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Creating Organization...</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Create Organization & Sign Up
                      </>
                    )}
                  </button>
                </form>

                {/* Login Link */}
                <div className="text-center mt-4">
                  <p className="text-xs text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-500 hover:text-blue-300 font-medium transition-colors hover:underline">
                      Login
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Note - Mobile Only */}
            {isMobile && (
              <div className="text-center mt-4 space-y-2">
                <p className="text-xs text-gray-400">Version 2.0.0 | Powered by Zephcore Digital Enterprise</p>
              </div>
            )}
          </div>

          {/* Right Side - Carousel with Background Images (Desktop Only) */}
          {!isMobile && (
            <div className="relative overflow-hidden rounded-3xl material-card">
              {/* Carousel Slides with Background Images */}
              {carouselSlides.map((slide, index) => {
                const Icon = slide.icon;
                const isActive = index === currentSlide;

                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                      }`}
                    style={{
                      transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                      backgroundImage: `url(${slide.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {/* Dark Overlay with Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${slide.overlayColor} backdrop-blur-[2px]`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
                      <div className={`absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br ${slide.gradient} opacity-10 blur-3xl`}></div>
                      <div className={`absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr ${slide.gradient} opacity-10 blur-3xl`}></div>
                    </div>

                    {/* Content */}
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <div className="text-center max-w-sm mx-auto relative z-10">
                        {/* Icon with Glow */}
                        <div className="relative inline-block mb-6">
                          <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} rounded-2xl blur-2xl opacity-30 animate-pulse`}></div>
                          <div className={`relative w-24 h-24 mx-auto bg-gradient-to-r ${slide.gradient} rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 transform hover:scale-105 transition-transform duration-500`}>
                            <Icon className="h-12 w-12 text-white" />
                          </div>
                        </div>

                        {/* Text Content */}
                        <h3 className="text-2xl font-bold text-white mb-2 animate-fadeInUp">
                          {slide.title}
                        </h3>
                        <p className="text-gray-200 text-sm leading-relaxed animate-fadeInUp animation-delay-200">
                          {slide.description}
                        </p>

                        {/* Decorative Line */}
                        <div className={`w-16 h-0.5 mx-auto mt-4 bg-gradient-to-r ${slide.gradient} rounded-full`}></div>

                        {/* Slide Indicators */}
                        <div className="flex justify-center gap-2 mt-6">
                          {carouselSlides.map((_, dotIndex) => (
                            <button
                              key={dotIndex}
                              onClick={() => setCurrentSlide(dotIndex)}
                              className={`h-1.5 rounded-full transition-all duration-300 ${dotIndex === currentSlide
                                ? 'w-6 bg-gradient-to-r from-blue-500 to-blue-600'
                                : 'w-1.5 bg-white/30 hover:bg-white/50'
                                }`}
                            />
                          ))}
                        </div>

                        {/* Slide counter */}
                        <p className="text-white/40 text-xs mt-3">
                          {currentSlide + 1} / {carouselSlides.length}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Bottom decorative gradient border */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>

              {/* Top decorative gradient border */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
            </div>
          )}
        </div>

        {/* Footer Note - Desktop Only */}
        {!isMobile && (
          <div className="text-center mt-4 space-y-1">
            <p className="text-xs text-gray-100">Version 2.0.0 | Powered by Zephcore Digital Enterprise</p>
          </div>
        )}
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-gray-800 animate-slideUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-blue-600 to-blue-700">
              <h2 className="text-xl font-bold text-white">Terms & Conditions</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-gray-300">
              <h3 className="text-lg font-bold text-blue-400">1. Introduction</h3>
              <p className="leading-relaxed">
                Welcome to <strong className="text-blue-300">Finlight</strong> â€“ a product of Zephcore Digital Enterprise, a comprehensive financial management platform for associations and organizations.
                By creating an organization and using our service, you agree to the following terms and conditions.
                Please read them carefully.
              </p>

              <h3 className="text-lg font-bold text-blue-400">2. Acceptance of Terms</h3>
              <p className="leading-relaxed">
                By checking the box and clicking "Create Organization & Sign Up", you acknowledge that you have read, understood,
                and agree to be bound by these Terms and Conditions, our Privacy Policy, and any future amendments.
                If you do not agree, you must not use the Service.
              </p>

              <h3 className="text-lg font-bold text-blue-400">3. Description of Service</h3>
              <p className="leading-relaxed">
                Finlight provides a secure platform for organizations to manage members, collect dues/levies,
                track payments, generate reports, and integrate with payment gateways (Flutterwave).
                The Service is offered on a subscription or perâ€‘use basis as described on our website.
              </p>

              <h3 className="text-lg font-bold text-blue-400">4. User Accounts and Security</h3>
              <ul className="list-disc pl-5 space-y-1 leading-relaxed">
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>You agree to notify us immediately of any unauthorized use of your account.</li>
                <li>You are liable for all activities that occur under your account.</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
              </ul>

              <h3 className="text-lg font-bold text-blue-400">5. Data Protection and Privacy</h3>
              <p className="leading-relaxed">
                We collect and process personal data (names, emails, payment information) solely to provide the Service.
                We implement industryâ€‘standard security measures (SSL encryption, secure servers) to protect your data.
                We will never sell or share your data with third parties except as required to process payments
                (e.g., Flutterwave) or as compelled by law. For full details, see our <strong className="text-blue-300">Privacy Policy</strong>.
              </p>

              <h3 className="text-lg font-bold text-blue-400">6. Payment Processing</h3>
              <p className="leading-relaxed">
                All financial transactions are processed by our integrated payment partner (Flutterwave).
                You acknowledge that we are not liable for any issues arising from thirdâ€‘party payment processors,
                including transaction failures, delays, or additional fees charged by the processor.
              </p>

              <h3 className="text-lg font-bold text-blue-400">7. Acceptable Use</h3>
              <ul className="list-disc pl-5 space-y-1 leading-relaxed">
                <li>You must not use the Service for any unlawful or fraudulent purpose.</li>
                <li>You must not attempt to gain unauthorized access to our systems or other users' data.</li>
                <li>You must not use the Service to store or distribute malware, viruses, or harmful code.</li>
                <li>You must not engage in any activity that could disrupt the Service (e.g., DDoS attacks).</li>
              </ul>

              <h3 className="text-lg font-bold text-blue-400">8. Intellectual Property</h3>
              <p className="leading-relaxed">
                All content, trademarks, and software used in the Service are the property of Finlight or its licensors.
                You may not copy, modify, distribute, or reverseâ€‘engineer any part of the Service without explicit permission.
              </p>

              <h3 className="text-lg font-bold text-blue-400">9. Limitation of Liability</h3>
              <p className="leading-relaxed">
                To the maximum extent permitted by law, Finlight shall not be liable for any indirect, incidental,
                or consequential damages arising from your use of the Service, including but not limited to
                loss of revenue, data, or business interruption. Our total liability shall not exceed the total fees
                paid by you in the preceding 12 months.
              </p>

              <h3 className="text-lg font-bold text-blue-400">10. Termination</h3>
              <p className="leading-relaxed">
                You may cancel your organization at any time. We reserve the right to suspend or terminate your account
                if you breach these terms. Upon termination, we will delete or anonymize your data within 30 days,
                unless retention is required by law.
              </p>

              <h3 className="text-lg font-bold text-blue-400">11. Changes to Terms</h3>
              <p className="leading-relaxed">
                We may update these Terms from time to time. We will notify you of any material changes via email
                or through the dashboard. Continued use after the effective date constitutes acceptance of the new terms.
              </p>

              <h3 className="text-lg font-bold text-blue-400">12. Governing Law</h3>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of Nigeria.
                Any disputes shall be resolved exclusively in the courts of Owerri, Nigeria.
              </p>

              <h3 className="text-lg font-bold text-blue-400">13. Contact Information</h3>
              <p className="leading-relaxed">
                If you have any questions or concerns about these Terms, please contact us at:<br />
                <strong className="text-blue-300">Email:</strong> Zephcoredigital@Zephcoredigital.ng<br />
                <strong className="text-blue-300">Address:</strong> Finlight HQ, Owerri, Nigeria.
              </p>

              <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-300 text-xs">
                <p className="font-bold">ðŸ“ Last Updated: June 2026</p>
                <p className="mt-1">By continuing, you acknowledge that you have read and agree to these Terms and Conditions.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Verification Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl shadow-blue-500/10 border border-gray-800 animate-slideUp">
            {/* Header with animated gradient */}
            <div className={`bg-gradient-to-r ${currentStage.color} p-6 text-white text-center`}>
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full animate-ping"></div>
                </div>
                <div className="relative z-10 inline-flex items-center justify-center w-16 h-16 bg-white/30 rounded-full backdrop-blur-sm">
                  <CurrentIcon className="h-8 w-8 animate-bounce" />
                </div>
              </div>
              <h3 className="text-xl font-bold mt-4">{currentStage.title}</h3>
              <p className="text-sm text-white/80 mt-1">{securityMessage}</p>
            </div>

            {/* Progress Steps */}
            <div className="p-6">
              <div className="space-y-3">
                {securityStages.map((stage, idx) => {
                  const StageIcon = stage.icon;
                  const isCompleted = idx < securityStage;
                  const isCurrent = idx === securityStage;

                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-green-500' :
                        isCurrent ? 'bg-blue-500 animate-pulse' :
                          'bg-gray-700'
                        }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-white" />
                        ) : (
                          <StageIcon className={`h-4 w-4 ${isCurrent ? 'text-white' : 'text-gray-500'}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isCompleted ? 'text-green-400' :
                          isCurrent ? 'text-blue-400' :
                            'text-gray-500'
                          }`}>
                          {stage.title}
                        </p>
                        <p className="text-xs text-gray-600">{stage.message}</p>
                      </div>
                      {isCurrent && (
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Security Tips */}
              <div className="mt-6 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-blue-400">Security Notice</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Your connection is secured with 256-bit SSL encryption.
                      Please wait while we complete security verification.
                    </p>
                  </div>
                </div>
              </div>

              {/* Estimated time remaining */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 animate-pulse">
                  {securityStage < securityStages.length - 1 ?
                    `Estimated security check: ${Math.ceil((securityStages.length - securityStage - 1) * 8)} seconds` :
                    'Finalizing secure connection...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .material-card {
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
          transition: box-shadow 0.3s ease;
        }

        .material-card:hover {
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.3),
            0 10px 10px -5px rgba(0, 0, 0, 0.04),
            0 0 0 1px rgba(6, 182, 212, 0.1) inset;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
          opacity: 0;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }

        .animate-bounce {
          animation: bounce 0.5s ease-in-out infinite;
        }

        .animate-ping {
          animation: ping 1.5s ease-in-out infinite;
        }

        .delay-100 {
          animation-delay: 100ms;
        }

        .delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </div>
  );
};

export default Signup;