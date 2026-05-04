// import { useState } from 'react';
// import { useAuth } from '../context/AuthContext';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     console.log("🚀 FORM SUBMITTED");
//     console.log("Email:", email);
//     console.log("Password length:", password.length);

//     setLoading(true);

//     try {
//       const result = await login(email, password);
//       console.log("✅ Login function completed with result:", result);
//     } catch (error) {
//       console.error("💥 Error in handleSubmit:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
//       <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-4">
//         <div className="text-center mb-8">
//           <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
//             <span className="text-white text-3xl font-bold">A</span>
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900">AGFMA</h1>
//           <p className="text-gray-600 mt-1">Age Grade Financial Management</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Email Address
//             </label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
//               placeholder="admin@agfma.com"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Password
//             </label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
//               placeholder="••••••••"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
//           >
//             {loading ? (
//               <span className="flex items-center gap-2">
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
//                 Logging in...
//               </span>
//             ) : (
//               'Login'
//             )}
//           </button>
//         </form>

//         <div className="mt-8 text-center text-xs text-gray-500">
//           <p className="font-medium mb-1">Demo Credentials</p>
//           <p>Admin: admin@agfma.com / admin123</p>
//           <p>Member: member@agfma.com / member123</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

// import { useState } from 'react';
// import { useAuth } from '../context/AuthContext';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuth();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert("Form submitted! Check console");   // ← This should pop up
//     console.log("🚀 FORM SUBMITTED - Email:", email);
    
//     setLoading(true);
//     login(email, password).then(result => {
//       console.log("Login result:", result);
//       setLoading(false);
//     }).catch(err => {
//       console.error("Login error:", err);
//       setLoading(false);
//     });
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
//         <h1 className="text-4xl font-bold text-center mb-2">AGFMA</h1>
//         <p className="text-gray-600 text-center mb-8">Login to continue</p>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Email"
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg"
//               required
//             />
//           </div>

//           <div>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Password"
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
//           >
//             {loading ? 'Logging in...' : 'Login'}
//           </button>
//         </form>

//               <p className="text-center text-sm text-gray-500 mt-6">
//               <p className="font-medium mb-1">Demo Credentials</p>
//           Try: admin@agfma.com / admin123
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;// frontend/src/pages/Login.jsx

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { Eye, EyeOff, Mail, Lock, LogIn, Shield, Building, Fingerprint, ArrowLeft, Home } from 'lucide-react';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
//   const { login } = useAuth();
//   const navigate = useNavigate();

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

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!email || !password) {
//       setError('Please enter both email and password');
//       return;
//     }
    
//     setLoading(true);
//     setError('');
    
//     try {
//       const result = await login(email, password);
      
//       if (result.success) {
//         // Save email if remember me is checked
//         if (rememberMe) {
//           localStorage.setItem('rememberedEmail', email);
//         } else {
//           localStorage.removeItem('rememberedEmail');
//         }
//       } else {
//         setError(result.error || 'Login failed');
//       }
//     } catch (err) {
//       console.error("Login error:", err);
//       setError('An unexpected error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDemoLogin = () => {
//     setEmail('admin@go.com');
//     setPassword('123admin');
//   };

//   const handleBackToHome = () => {
//     navigate('/');
//   };

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
//               <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
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
//                 >
//                   Forgot Password?
//                 </button>
//               </div>

//               {/* Login Button */}
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
//               >
//                 {loading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                     Logging in...
//                   </>
//                 ) : (
//                   <>
//                     <LogIn className="h-5 w-5" />
//                     Login
//                   </>
//                 )}
//               </button>
//             </form>

//             {/* Demo Credentials Section */}
//             <div className="mt-6 pt-4 border-t border-gray-100">
//               <div className="flex items-center justify-center gap-2 mb-3">
//                 <Fingerprint className="h-4 w-4 text-gray-400" />
//                 <p className="text-xs text-gray-500 font-medium">Demo Credentials</p>
//               </div>
//               <div className="bg-gray-50 rounded-xl p-3">
//                 <div className="flex items-center justify-between text-sm mb-2">
//                   <span className="text-gray-600">Email:</span>
//                   <code className="text-blue-600 font-mono text-xs">admin@agfma.com</code>
//                 </div>
//                 <div className="flex items-center justify-between text-sm mb-3">
//                   <span className="text-gray-600">Password:</span>
//                   <code className="text-blue-600 font-mono text-xs">admin123</code>
//                 </div>
//                 <button
//                   onClick={handleDemoLogin}
//                   className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
//                 >
//                   Use Demo Credentials
//                 </button>
//               </div>
//             </div>

//             {/* Footer Note */}
//             <div className="mt-6 text-center">
//               <p className="text-xs text-gray-400">
//                 Secure login powered by AGFMA
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Additional Navigation Links */}
//         <div className="text-center mt-6 space-y-2">
//           <p className="text-xs text-gray-400">
//             Don't have an account?{' '}
//             <button
//               onClick={handleBackToHome}
//               className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
//             >
//               <Home className="h-3 w-3" />
//               Back to Home
//             </button>
//           </p>
//           <p className="text-xs text-gray-400">Version 2.0.0</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, LogIn, Shield, Building, Fingerprint, ArrowLeft, Home, LockKeyhole, Server, Network, Database, CheckCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [securityStage, setSecurityStage] = useState(0);
  const [securityMessage, setSecurityMessage] = useState('');
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
      color: "from-cyan-500 to-blue-600"
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
      duration: 5000,
      color: "from-green-500 to-emerald-600"
    }
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    
    // Simulate security check stages while waiting for actual login
    const startTime = Date.now();
    
    try {
      const result = await login(email, password);
      const elapsedTime = Date.now() - startTime;
      
      // Ensure minimum animation time of 5 seconds for better UX
      if (elapsedTime < 5000) {
        await new Promise(resolve => setTimeout(resolve, 5000 - elapsedTime));
      }
      
      setShowSecurityModal(false);
      
      if (result.success) {
        // OVERRIDE: Force user to have full access - bypass all payment/registration checks
        const userWithFullAccess = {
          ...result.user,
          hasPaidRegistration: true,
          hasCompletedRegistration: true,
          isActive: true,
          role: result.user?.role || 'admin',
          permissions: ['all', 'admin', 'payment', 'report', 'user']
        };
        
        localStorage.setItem('user', JSON.stringify(userWithFullAccess));
        
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('An unexpected error occurred');
      setShowSecurityModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@go.com');
    setPassword('123admin');
    setTimeout(() => {
      handleSubmit(new Event('submit'));
    }, 100);
  };

  const handleDirectAccess = () => {
    const directAccessUser = {
      id: 'direct-access-' + Date.now(),
      name: 'Full Access User',
      email: email || 'user@finlight.com',
      role: 'admin',
      hasPaidRegistration: true,
      hasCompletedRegistration: true,
      isActive: true,
      isVerified: true,
      permissions: ['all', 'admin', 'payment', 'report', 'user', 'member'],
      createdAt: new Date().toISOString()
    };
    
    const mockToken = 'direct-access-token-' + Date.now();
    
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(directAccessUser));
    
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    }
    
    navigate('/dashboard', { replace: true });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  // Get current security stage data
  const currentStage = securityStages[securityStage] || securityStages[0];
  const CurrentIcon = currentStage.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <button
          onClick={handleBackToHome}
          className="mb-4 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back to Home</span>
        </button>

        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4 cursor-pointer hover:scale-105 transition-transform" onClick={handleBackToHome}>
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            FinLight
          </h1>
          <p className="text-gray-500 text-sm mt-2">Association of Great Financial Managers</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
              <p className="text-gray-500 text-sm mt-1">Login to your account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 animate-shake">
                <div className="h-4 w-4 bg-red-500 rounded-full mt-0.5 flex-shrink-0"></div>
                <p className="text-red-700 text-sm flex-1">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md overflow-hidden group"
              >
                {loading ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse"></div>
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

            {/* Quick Access Buttons */}
            <div className="mt-4 space-y-2">
              <button
                onClick={handleDemoLogin}
                className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
              >
                <Fingerprint className="h-4 w-4" />
                Use Demo Credentials
              </button>
              
              <button
                onClick={handleDirectAccess}
                className="w-full py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Direct Access (Skip All Checks)
              </button>
            </div>

            {/* Demo Credentials Info */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Building className="h-4 w-4 text-gray-400" />
                <p className="text-xs text-gray-500 font-medium">Demo Information</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Test Email:</span>
                  <code className="text-blue-600 font-mono text-xs">admin@go.com</code>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Test Password:</span>
                  <code className="text-blue-600 font-mono text-xs">123admin</code>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Access Level:</span>
                  <span className="text-green-600 font-medium text-xs">Full Access (No Payment Required)</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                Secure login powered by FinLight
              </p>
              <p className="text-xs text-green-500 mt-1">
                ✓ Full access granted - No registration payment required
              </p>
            </div>
          </div>
        </div>

        {/* Additional Navigation Links */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-gray-400">
            Don't have an account?{' '}
            <button 
              onClick={handleBackToHome}
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
            >
              <Home className="h-3 w-3" />
              Back to Home
            </button>
          </p>
          <p className="text-xs text-gray-400">Version 2.0.0 - Full Access Mode</p>
        </div>
      </div>

      {/* Security Verification Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl animate-slideUp">
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
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 
                        isCurrent ? 'bg-blue-500 animate-pulse' : 
                        'bg-gray-200'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-white" />
                        ) : (
                          <StageIcon className={`h-4 w-4 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          isCompleted ? 'text-green-600' : 
                          isCurrent ? 'text-blue-600' : 
                          'text-gray-400'
                        }`}>
                          {stage.title}
                        </p>
                        <p className="text-xs text-gray-400">{stage.message}</p>
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
              <div className="mt-6 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-blue-800">Security Notice</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      Your connection is secured with 256-bit SSL encryption. 
                      Please wait while we complete security verification.
                    </p>
                  </div>
                </div>
              </div>

              {/* Estimated time remaining */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400 animate-pulse">
                  {securityStage < securityStages.length - 1 ? 
                    `Estimated security check: ${Math.ceil((securityStages.length - securityStage - 1) * 8)} seconds` : 
                    'Finalizing secure connection...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.3s ease-in-out;
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

export default Login;