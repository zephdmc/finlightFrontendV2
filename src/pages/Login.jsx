// import { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { Eye, EyeOff, Mail, Lock, LogIn, Shield, ArrowLeft, Home, LockKeyhole, Server, Network, Database, CheckCircle, Loader2, UserPlus } from 'lucide-react';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
//   const [securityStage, setSecurityStage] = useState(0);
//   const [securityMessage, setSecurityMessage] = useState('');
//   const [showSecurityModal, setShowSecurityModal] = useState(false);
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   // Security stages configuration
//   const securityStages = [
//     {
//       icon: Shield,
//       title: "Initializing Security Protocol",
//       message: "Establishing secure connection...",
//       duration: 8000,
//       color: "from-blue-500 to-blue-600"
//     },
//     {
//       icon: Network,
//       title: "Validating Device Security",
//       message: "Checking device integrity and security certificates...",
//       duration: 10000,
//       color: "from-blue-500 to-blue-600"
//     },
//     {
//       icon: Server,
//       title: "Verifying Server Response",
//       message: "Awaiting secure server handshake...",
//       duration: 15000,
//       color: "from-indigo-500 to-blue-600"
//     },
//     {
//       icon: Database,
//       title: "Authenticating Credentials",
//       message: "Validating user credentials with secure database...",
//       duration: 12000,
//       color: "from-purple-500 to-indigo-600"
//     },
//     {
//       icon: LockKeyhole,
//       title: "Finalizing Secure Login",
//       message: "Completing security verification...",
//       duration: 5000,
//       color: "from-green-500 to-emerald-600"
//     }
//   ];

//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth < 768);
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     // Load saved email if remember me was checked
//     const savedEmail = localStorage.getItem('rememberedEmail');
//     if (savedEmail) {
//       setEmail(savedEmail);
//       setRememberMe(true);
//     }
//   }, []);

//   // Handle security stage progression
//   useEffect(() => {
//     if (!showSecurityModal) return;

//     let stageIndex = 0;
//     setSecurityStage(0);
//     setSecurityMessage(securityStages[0].title);

//     const interval = setInterval(() => {
//       stageIndex++;
//       if (stageIndex < securityStages.length) {
//         setSecurityStage(stageIndex);
//         setSecurityMessage(securityStages[stageIndex].title);
//       } else {
//         clearInterval(interval);
//       }
//     }, 8000);

//     return () => clearInterval(interval);
//   }, [showSecurityModal]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!email || !password) {
//       setError('Please enter both email and password');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setShowSecurityModal(true);
//     setSecurityStage(0);
//     setSecurityMessage(securityStages[0].title);

//     const startTime = Date.now();

//     try {
//       const result = await login(email, password);

//       const elapsedTime = Date.now() - startTime;

//       if (elapsedTime < 5000) {
//         await new Promise(resolve => setTimeout(resolve, 5000 - elapsedTime));
//       }

//       setShowSecurityModal(false);

//       if (result && result.success) {
//         if (rememberMe) {
//           localStorage.setItem('rememberedEmail', email);
//         } else {
//           localStorage.removeItem('rememberedEmail');
//         }

//         // Role-based redirection
//         const userRole = result.user?.role;
//         if (userRole === 'super-admin' || userRole === 'super_admin') {
//           navigate('/admin/organizations', { replace: true });
//         } else if (userRole === 'admin') {
//           navigate('/admin-dashboard', { replace: true });
//         } else {
//           navigate('/dashboard', { replace: true });
//         }
//       } else {
//         setError(result?.error || 'Login failed');
//         setShowSecurityModal(false);
//       }
//     } catch (err) {
//       console.error('Login error:', err);
//       setError(err.response?.data?.message || 'An unexpected error occurred');
//       setShowSecurityModal(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBackToHome = () => {
//     navigate('/');
//   };



//   // Get current security stage data
//   const currentStage = securityStages[securityStage] || securityStages[0];
//   const CurrentIcon = currentStage.icon;

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
//       <div className="w-full max-w-md">
//         {/* Back to Home Button */}
//         <button
//           onClick={handleBackToHome}
//           className="mb-4 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors group"
//         >
//           <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
//           <span className="text-sm">Back to Home</span>
//         </button>

//         {/* Logo/Brand Section */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4 cursor-pointer hover:scale-105 transition-transform" onClick={handleBackToHome}>
//             <Shield className="h-8 w-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//             FinLight
//           </h1>
//           <p className="text-gray-500 text-sm mt-2">Association of Great Financial Managers</p>
//         </div>

//         {/* Login Card */}
//         <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
//           <div className="p-6 md:p-8">
//             <div className="text-center mb-6">
//               <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
//               <p className="text-gray-500 text-sm mt-1">Login to your account</p>
//             </div>

//             {error && (
//               <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 animate-shake">
//                 <div className="h-4 w-4 bg-red-500 rounded-full mt-0.5 flex-shrink-0"></div>
//                 <p className="text-red-700 text-sm flex-1">{error}</p>
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-5">
//               {/* Email Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Enter your email"
//                     className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                     required
//                   />
//                 </div>
//               </div>

//               {/* Password Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Enter your password"
//                     className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                   </button>
//                 </div>
//               </div>

//               {/* Remember Me & Forgot Password */}
//               <div className="flex items-center justify-between">
//                 <label className="flex items-center gap-2 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={rememberMe}
//                     onChange={(e) => setRememberMe(e.target.checked)}
//                     className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                   />
//                   <span className="text-sm text-gray-600">Remember me</span>
//                 </label>
//                 <button
//                   type="button"
//                   className="text-sm text-blue-600 hover:text-blue-700 font-medium"
//                   onClick={() => navigate('/forgot-password')}
//                 >
//                   Forgot Password?
//                 </button>
//               </div>

//               {/* Login Button */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md overflow-hidden group"
//               >
//                 {loading ? (
//                   <>
//                     <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse"></div>
//                     <div className="relative z-10 flex items-center gap-2">
//                       <Loader2 className="h-5 w-5 animate-spin" />
//                       <span>Initiating Secure Login...</span>
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <LogIn className="h-5 w-5" />
//                     Login
//                   </>
//                 )}
//               </button>
//             </form>

//             {/* Divider */}
//             <div className="relative my-6">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-200"></div>
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="px-4 bg-white text-gray-500">New to FinLight?</span>
//               </div>
//             </div>

//             {/* Sign Up Button */}
//             <Link
//               to="/signup"
//               className="w-full flex items-center justify-center gap-2 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all"
//             >
//               <UserPlus className="h-5 w-5" />
//               Create Organization Account
//             </Link>

//             {/* Footer Note */}
//             <div className="mt-6 text-center">
//               <p className="text-xs text-gray-400">
//                 Secure login powered by FinLight
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Additional Navigation Links */}
//         <div className="text-center mt-6 space-y-2">
//           <p className="text-xs text-gray-400">
//             <button
//               onClick={handleBackToHome}
//               className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
//             >
//               <Home className="h-3 w-3" />
//               Back to Home
//             </button>
//           </p>
//           <p className="text-xs text-gray-400">Version 2.0.0</p>
//           <p className="text-xs text-gray-700"> Powered by Zephcore Digital Enterprise .</p>
//         </div>
//       </div>

//       {/* Security Verification Modal */}
//       {showSecurityModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
//           <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl animate-slideUp">
//             {/* Header with animated gradient */}
//             <div className={`bg-gradient-to-r ${currentStage.color} p-6 text-white text-center`}>
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <div className="w-20 h-20 bg-white/20 rounded-full animate-ping"></div>
//                 </div>
//                 <div className="relative z-10 inline-flex items-center justify-center w-16 h-16 bg-white/30 rounded-full backdrop-blur-sm">
//                   <CurrentIcon className="h-8 w-8 animate-bounce" />
//                 </div>
//               </div>
//               <h3 className="text-xl font-bold mt-4">{currentStage.title}</h3>
//               <p className="text-sm text-white/80 mt-1">{securityMessage}</p>
//             </div>

//             {/* Progress Steps */}
//             <div className="p-6">
//               <div className="space-y-3">
//                 {securityStages.map((stage, idx) => {
//                   const StageIcon = stage.icon;
//                   const isCompleted = idx < securityStage;
//                   const isCurrent = idx === securityStage;
//                   const isPending = idx > securityStage;

//                   return (
//                     <div key={idx} className="flex items-center gap-3">
//                       <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-green-500' :
//                         isCurrent ? 'bg-blue-500 animate-pulse' :
//                           'bg-gray-200'
//                         }`}>
//                         {isCompleted ? (
//                           <CheckCircle className="h-4 w-4 text-white" />
//                         ) : (
//                           <StageIcon className={`h-4 w-4 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
//                         )}
//                       </div>
//                       <div className="flex-1">
//                         <p className={`text-sm font-medium ${isCompleted ? 'text-green-600' :
//                           isCurrent ? 'text-blue-600' :
//                             'text-gray-400'
//                           }`}>
//                           {stage.title}
//                         </p>
//                         <p className="text-xs text-gray-400">{stage.message}</p>
//                       </div>
//                       {isCurrent && (
//                         <div className="flex items-center gap-1">
//                           <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
//                           <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100"></div>
//                           <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200"></div>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Security Tips */}
//               <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-200">
//                 <div className="flex items-start gap-2">
//                   <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
//                   <div>
//                     <p className="text-xs font-medium text-blue-800">Security Notice</p>
//                     <p className="text-xs text-blue-600 mt-0.5">
//                       Your connection is secured with 256-bit SSL encryption.
//                       Please wait while we complete security verification.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Estimated time remaining */}
//               <div className="mt-4 text-center">
//                 <p className="text-xs text-gray-400 animate-pulse">
//                   {securityStage < securityStages.length - 1 ?
//                     `Estimated security check: ${Math.ceil((securityStages.length - securityStage - 1) * 8)} seconds` :
//                     'Finalizing secure connection...'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Global styles */}
//       <style>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }

//         @keyframes slideUp {
//           from {
//             transform: translateY(30px);
//             opacity: 0;
//           }
//           to {
//             transform: translateY(0);
//             opacity: 1;
//           }
//         }

//         @keyframes shake {
//           0%, 100% { transform: translateX(0); }
//           25% { transform: translateX(-5px); }
//           75% { transform: translateX(5px); }
//         }

//         @keyframes bounce {
//           0%, 100% { transform: translateY(0); }
//           50% { transform: translateY(-10px); }
//         }

//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }

//         .animate-slideUp {
//           animation: slideUp 0.4s ease-out;
//         }

//         .animate-shake {
//           animation: shake 0.3s ease-in-out;
//         }

//         .animate-bounce {
//           animation: bounce 0.5s ease-in-out infinite;
//         }

//         .delay-100 {
//           animation-delay: 100ms;
//         }

//         .delay-200 {
//           animation-delay: 200ms;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Login;

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, LogIn, Shield, ArrowLeft, Home, LockKeyhole, Server, Network, Database, CheckCircle, Loader2, UserPlus, ChevronRight, Smartphone, TrendingUp, Wallet, Users } from 'lucide-react';
import { warmupBackend } from '../services/api';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [securityStage, setSecurityStage] = useState(0);
  const [securityMessage, setSecurityMessage] = useState('');
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    warmupBackend();
  }, []);
  // Carousel slides with background images
  const carouselSlides = [
    {
      icon: Wallet,
      title: 'Smart Financial Management',
      description: 'Track contributions, manage dues, and monitor expenses effortlessly',
      gradient: 'from-blue-500 to-blue-600',
      // Replace with your actual image URLs
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
      overlayColor: 'from-black/70 via-black/50 to-black/70'
    },
    {
      icon: Users,
      title: 'Member Management',
      description: 'Manage member profiles, roles, and permissions with ease',
      gradient: 'from-blue-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop',
      overlayColor: 'from-black/70 via-black/50 to-black/70'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      description: 'Get detailed reports and insights into your financial health',
      gradient: 'from-blue-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      overlayColor: 'from-black/70 via-black/50 to-black/70'
    },
    {
      icon: Shield,
      title: 'Bank-grade Security',
      description: 'Your data is protected with 256-bit SSL encryption',
      gradient: 'from-blue-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
      overlayColor: 'from-black/70 via-black/50 to-black/70'
    }
  ];

  // Security stages configuration
  const securityStages = [
    {
      icon: Shield,
      title: "Initializing Security Protocol",
      message: "Establishing secure connection...",
      duration: 8000,
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Network,
      title: "Validating Device Security",
      message: "Checking device integrity and security certificates...",
      duration: 10000,
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Server,
      title: "Verifying Server Response",
      message: "Awaiting secure server handshake...",
      duration: 15000,
      color: "from-indigo-500 to-blue-600"
    },
    {
      icon: Database,
      title: "Authenticating Credentials",
      message: "Validating user credentials with secure database...",
      duration: 12000,
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: LockKeyhole,
      title: "Finalizing Secure Login",
      message: "Completing security verification...",
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
    // Load saved email if remember me was checked
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle security stage progression
  useEffect(() => {
    if (!showSecurityModal) return;

    let stageIndex = 0;
    setSecurityStage(0);
    setSecurityMessage(securityStages[0].title);

    const interval = setInterval(() => {
      stageIndex++;
      if (stageIndex < securityStages.length) {
        setSecurityStage(stageIndex);
        setSecurityMessage(securityStages[stageIndex].title);
      } else {
        clearInterval(interval);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [showSecurityModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');
    setShowSecurityModal(true);
    setSecurityStage(0);
    setSecurityMessage(securityStages[0].title);

    const startTime = Date.now();

    try {
      const result = await login(email, password);

      const elapsedTime = Date.now() - startTime;

      if (elapsedTime < 5000) {
        await new Promise(resolve => setTimeout(resolve, 5000 - elapsedTime));
      }

      setShowSecurityModal(false);

      if (result && result.success) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        const userRole = result.user?.role;
        if (userRole === 'super-admin' || userRole === 'super_admin') {
          navigate('/admin/organizations', { replace: true });
        } else if (userRole === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setError(result?.error || 'Login failed');
        setShowSecurityModal(false);
      }
    } catch (err) {
      console.error('Login error:', err);

      let msg = 'Login failed. Please try again.';

      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        msg = 'Server is waking up. Please wait 30â€“60 seconds and try again.';
      } else if (!err.response) {
        msg = 'Cannot reach the server. Please check your internet connection.';
      } else {
        const data = err.response.data;
        if (data?.message) msg = data.message;
        else if (Array.isArray(data?.errors) && data.errors.length > 0) {
          msg = data.errors.map((e) => e.message || e.msg).join(' ');
        } else if (err.response.status === 401) {
          msg = 'Invalid email or password.';
        } else if (err.response.status === 429) {
          msg = 'Too many login attempts. Please try again later.';
        }
      }

      setError(msg);
      setShowSecurityModal(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black" style={{
      background: 'linear-gradient(135deg, rgba(242, 244, 247, 0.85), rgba(247, 249, 254, 0.94))',
    }}>
      <div className="flex min-h-screen">
        {/* Left Side - Login Form (Desktop & Mobile) */}
        <div className={`${isMobile ? 'w-full' : 'w-1/2'} flex items-center justify-center p-4 md:p-8 relative z-10`}>
          <div className="w-full max-w-md">
            {/* Back to Home Button */}
            <button
              onClick={handleBackToHome}
              className="mb-4 flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Back to Home</span>
            </button>

            {/* Logo/Brand Section */}
            <div className="text-center mb-8">

              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#012a7b] to-[#2683e9] shadow-[0_0_0_8px_rgba(38,131,233,0.15),0_0_0_16px_rgba(38,131,233,0.08)] mb-4 cursor-pointer hover:scale-105 transition-transform relative p-1" onClick={handleBackToHome}>
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
              <p className="text-gray-400 text-sm mt-2">Secure Financial Management</p>
            </div>

            {/* Login Card */}
            <div className="bg-gradient-to-br from-gray-100/95 to-gray/95 backdrop-blur-sm rounded-3xl shadow-sm border border-blue-800 overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                  <p className="text-gray-400 text-sm mt-1">Login to your account</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 animate-shake">
                    <div className="h-4 w-4 bg-red-500 rounded-full mt-0.5 flex-shrink-0"></div>
                    <p className="text-red-400 text-sm flex-1">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-4 py-3 bg-blue-300/50 border border-blue-700 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-12 py-3 bg-blue-300/50 border border-blue-700 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-400">Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      onClick={() => navigate('/forgot-password')}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="relative w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden group"
                  >
                    {loading ? (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse"></div>
                        <div className="relative z-10 flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Initiating Secure Login...</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5" />
                        Login
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-gradient-to-br from-gray-900/95 to-black/95 text-gray-500">New to Finlight?</span>
                  </div>
                </div>

                {/* Sign Up Button */}
                <Link
                  to="/signup"
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-blue-500/50 text-blue-400 rounded-xl font-semibold hover:bg-blue-500/10 hover:border-blue-500 transition-all"
                >
                  <UserPlus className="h-5 w-5" />
                  Create Organization Account
                </Link>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center mt-6 space-y-2">
              <p className="text-xs text-gray-500">
                <button
                  onClick={handleBackToHome}
                  className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <Home className="h-3 w-3" />
                  Back to Home
                </button>
              </p>
              <p className="text-xs text-gray-100">Version 2.0.0</p>
              <p className="text-xs text-gray-200"> Powered by Zephcore Digital Enterprise</p>
            </div>
          </div>
        </div>

        {/* Right Side - Carousel with Background Images (Desktop Only) */}
        {!isMobile && (
          <div className="w-1/2 relative overflow-hidden">
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
                    {/* Additional gradient accents */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
                    <div className={`absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br ${slide.gradient} opacity-10 blur-3xl`}></div>
                    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr ${slide.gradient} opacity-10 blur-3xl"></div>
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-center max-w-md mx-auto relative z-10">
                      {/* Icon with Glow */}
                      <div className="relative inline-block mb-8">
                        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} rounded-3xl blur-2xl opacity-30 animate-pulse`}></div>
                        <div className={`relative w-32 h-32 mx-auto bg-gradient-to-r ${slide.gradient} rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 transform hover:scale-105 transition-transform duration-500`}>
                          <Icon className="h-16 w-16 text-white" />
                        </div>
                      </div>

                      {/* Text Content */}
                      <h3 className="text-3xl font-bold text-white mb-4 animate-fadeInUp">
                        {slide.title}
                      </h3>
                      <p className="text-gray-200 text-lg leading-relaxed animate-fadeInUp animation-delay-200">
                        {slide.description}
                      </p>

                      {/* Decorative Line */}
                      <div className={`w-20 h-1 mx-auto mt-6 bg-gradient-to-r ${slide.gradient} rounded-full`}></div>

                      {/* Slide Indicators */}
                      <div className="flex justify-center gap-2 mt-8">
                        {carouselSlides.map((_, dotIndex) => (
                          <button
                            key={dotIndex}
                            onClick={() => setCurrentSlide(dotIndex)}
                            className={`h-2 rounded-full transition-all duration-300 ${dotIndex === currentSlide
                              ? 'w-8 bg-gradient-to-r from-blue-500 to-blue-600'
                              : 'w-2 bg-white/30 hover:bg-white/50'
                              }`}
                          />
                        ))}
                      </div>

                      {/* Slide counter */}
                      <p className="text-white/50 text-sm mt-4">
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
                  const isPending = idx > securityStage;

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
                    <p className="text-xs font-medium text-gray-200">Security Notice</p>
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

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
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

        .animate-shake {
          animation: shake 0.3s ease-in-out;
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

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};

export default Login;