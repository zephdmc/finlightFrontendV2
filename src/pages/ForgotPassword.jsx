import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader, Lock, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', { email });

      if (response.data.success) {
        setSubmitted(true);
        toast.success('Password reset link sent to your email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setSubmitted(true);
      toast.success('If an account exists with this email, you will receive a reset link');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-800 overflow-hidden material-card">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Check Your Email</h1>
              <p className="text-blue-100 mt-1 text-sm">Password reset link sent</p>
            </div>

            <div className="p-6">
              <p className="text-gray-300 text-sm mb-2 text-center">
                We've sent a password reset link to:
              </p>
              <p className="font-semibold text-blue-400 text-center text-sm mb-4">{email}</p>
              <p className="text-xs text-gray-500 text-center mb-6">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>

              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all text-center"
                >
                  Back to Login
                </Link>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full py-2.5 border border-gray-700 text-gray-300 rounded-xl font-medium text-sm hover:bg-gray-800/50 hover:border-blue-500/50 transition-all"
                >
                  Try another email
                </button>
              </div>

              <div className="text-center mt-4">
                <Link to="/" className="text-xs text-gray-500 hover:text-blue-400 transition-colors inline-flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-xs text-gray-600">Version 2.0.0 | Powered by Zephcore Digital Enterprise</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        <button
          onClick={() => window.location.href = '/'}
          className="mb-4 flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back to Home</span>
        </button>

        {/* Logo/Brand Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#012a7b] to-[#2683e9] shadow-[0_0_0_8px_rgba(38,131,233,0.15),0_0_0_16px_rgba(38,131,233,0.08)] cursor-pointer hover:scale-105 transition-transform relative p-1" onClick={() => window.location.href = '/'}>
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

        {/* Forgot Password Card */}
        <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-800 overflow-hidden material-card">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Forgot Password?</h2>
              <p className="text-gray-400 text-sm mt-1">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2 animate-shake">
                  <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

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
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden group"
              >
                {loading ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse"></div>
                    <div className="relative z-10 flex items-center gap-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Sending...</span>
                    </div>
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors inline-flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" />
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-600">Version 2.0.0 | Powered by Zephcore Digital Enterprise</p>
        </div>
      </div>

      {/* Global styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
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
      `}</style>
    </div>
  );
};

export default ForgotPassword;