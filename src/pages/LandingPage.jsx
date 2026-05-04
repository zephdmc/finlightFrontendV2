import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight,
  ArrowRight, 
  Shield, 
  CreditCard, 
  Users, 
  BarChart3, 
  Bell, 
  Smartphone, 
  Lock,
  CheckCircle,
  TrendingUp,
  Wallet,
  Star,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Check,
  Zap, 
  XCircle
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    userName: '',
    selectedPlan: '',
    whatsappNumber: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    // Prevent body scroll when modal is open
    if (isFormOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      document.body.style.overflow = 'unset';
    };
  }, [isFormOpen]);

  const features = [
    {
      icon: <Shield className={isMobile ? "h-5 w-5" : "h-6 w-6"} />,
      title: 'Secure Transactions',
      description: isMobile ? 'Bank-grade security with encrypted payments' : 'Bank-grade security with encrypted payments and secure authentication',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <CreditCard className={isMobile ? "h-5 w-5" : "h-6 w-6"} />,
      title: 'Easy Payments',
      description: isMobile ? 'Pay dues with just a few clicks' : 'Make dues and contribution payments with just a few clicks',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <Users className={isMobile ? "h-5 w-5" : "h-6 w-6"} />,
      title: 'Member Management',
      description: isMobile ? 'Manage profiles and permissions' : 'Easily manage member profiles, roles, and permissions',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <BarChart3 className={isMobile ? "h-5 w-5" : "h-6 w-6"} />,
      title: 'Financial Reports',
      description: isMobile ? 'Track transparency with reports' : 'Generate detailed reports and track financial transparency',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: <Bell className={isMobile ? "h-5 w-5" : "h-6 w-6"} />,
      title: 'Real-time Alerts',
      description: isMobile ? 'Instant payment notifications' : 'Get instant notifications for payments and updates',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: <Smartphone className={isMobile ? "h-5 w-5" : "h-6 w-6"} />,
      title: 'Mobile Friendly',
      description: isMobile ? 'Access anywhere, anytime' : 'Access from anywhere on any device with responsive design',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  const stats = [
    { value: '500+', label: isMobile ? 'Members' : 'Active Members', icon: <Users className={isMobile ? "h-4 w-4" : "h-5 w-5"} /> },
    { value: '₦10M+', label: isMobile ? 'Processed' : 'Transactions Processed', icon: <Wallet className={isMobile ? "h-4 w-4" : "h-5 w-5"} /> },
    { value: '99.9%', label: 'Uptime', icon: <CheckCircle className={isMobile ? "h-4 w-4" : "h-5 w-5"} /> },
    { value: '24/7', label: 'Support', icon: <Phone className={isMobile ? "h-4 w-4" : "h-5 w-5"} /> }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'FREE',
      originalPrice: null,
      period: '',
      memberSlots: 30,
      features: [
        '24/7 service & support',
        'Startup fee: Free',
        'Updates until version 5.0',
        '2 years backup guarantee'
      ],
      buttonText: 'Get started for free',
      popular: false,
      recommended: false,
      gradient: 'from-gray-800 to-gray-900',
      borderColor: 'border-gray-700',
      textColor: 'text-gray-300',
      buttonGradient: 'from-gray-700 to-gray-800'
    },
    {
      name: 'Growth',
      price: '₦30,000',
      originalPrice: null,
      period: 'one-time + ₦12,000/year',
      memberSlots: 120,
      features: [
        '24/7 service & support',
        'Updates until version 7.0',
        '2 years backup guarantee'
      ],
      buttonText: 'Choose Growth',
      popular: true,
      recommended: false,
      gradient: 'from-blue-900 to-indigo-900',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-300',
      buttonGradient: 'from-blue-600 to-indigo-600'
    },
    {
      name: 'Business',
      price: '₦95,000',
      originalPrice: null,
      period: 'one-time + ₦20,000/year',
      memberSlots: 300,
      features: [
        '24/7 premium service',
        'Custom domain name',
        'Professional landing page',
        'Online Payment',
        '3 years backup guarantee',
        'Built-in online payment'
      ],
      buttonText: 'Go Business',
      popular: false,
      recommended: true,
      gradient: 'from-cyan-600 to-blue-600',
      borderColor: 'border-cyan-400',
      textColor: 'text-cyan-300',
      buttonGradient: 'from-cyan-500 to-blue-500',
      isHighlighted: true
    },
    {
      name: 'Custom',
      price: 'Custom',
      originalPrice: null,
      period: 'Quote',
      memberSlots: 'Unlimited',
      features: [
        'Everything in Business plan',
        '24/7 dedicated support',
        'Unlimited updates forever',
        '5+ years backup guarantee',
        'Custom features & integrations',
        'Priority support'
      ],
      buttonText: 'Get Custom Quote',
      popular: false,
      recommended: false,
      gradient: 'from-purple-900 to-pink-900',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-300',
      buttonGradient: 'from-purple-600 to-pink-600'
    }
  ];

  const testimonials = [
    {
      name: 'John Okonkwo',
      role: 'Financial Secretary',
      content: isMobile ? 'AGFMA transformed how we manage finances. The transparency is unmatched.' : 'AGFMA has transformed how we manage our association\'s finances. The transparency and ease of use are unmatched.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=John+Okonkwo&background=3B82F6&color=fff'
    },
    {
      name: 'Ada Eze',
      role: 'Member',
      content: isMobile ? 'Paying dues has never been easier. Smooth and secure!' : 'Paying my dues has never been easier. The mobile experience is smooth and secure.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Ada+Eze&background=10B981&color=fff'
    },
    {
      name: 'Michael Okafor',
      role: 'Chairman',
      content: isMobile ? 'Complete visibility into our financial status. Highly recommended!' : 'The reporting features give us complete visibility into our financial status. Highly recommended!',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Michael+Okafor&background=8B5CF6&color=fff'
    }
  ];

  // WhatsApp number for receiving form submissions (replace with your number)
  const WHATSAPP_NUMBER = "2347062780839"; // Country code without +

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear status when user starts typing again
    if (submitStatus.message) setSubmitStatus({ type: '', message: '' });
  };

  // Helper function to render logos (full size for main carousel)
const renderLogos = () => {
  const logos = [
    {
      name: 'Paystack',
      color: '#00B3B0',
      bgGradient: 'from-teal-500/20 to-teal-600/10',
      svg: () => (
        <svg viewBox="0 0 200 80" className="h-10 md:h-14 w-auto">
          <rect width="200" height="80" rx="12" fill="#1a1a2e" stroke="#00B3B0" strokeWidth="1" strokeOpacity="0.3"/>
          <text x="100" y="48" textAnchor="middle" fill="#00B3B0" fontSize="20" fontWeight="bold" fontFamily="Arial, sans-serif">Paystack</text>
          <text x="100" y="64" textAnchor="middle" fill="#00B3B0" fontSize="10" opacity="0.7">⚡ Payments</text>
        </svg>
      )
    },
    {
      name: 'Moniepoint',
      color: '#F5821E',
      bgGradient: 'from-orange-500/20 to-orange-600/10',
      svg: () => (
        <svg viewBox="0 0 200 80" className="h-10 md:h-14 w-auto">
          <rect width="200" height="80" rx="12" fill="#1a1a2e" stroke="#F5821E" strokeWidth="1" strokeOpacity="0.3"/>
          <text x="100" y="48" textAnchor="middle" fill="#F5821E" fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif">Moniepoint</text>
          <text x="100" y="64" textAnchor="middle" fill="#F5821E" fontSize="9" opacity="0.7">💰 Business Banking</text>
        </svg>
      )
    },
    {
      name: 'Opay',
      color: '#1A8F5E',
      bgGradient: 'from-green-500/20 to-green-600/10',
      svg: () => (
        <svg viewBox="0 0 200 80" className="h-10 md:h-14 w-auto">
          <rect width="200" height="80" rx="12" fill="#1a1a2e" stroke="#1A8F5E" strokeWidth="1" strokeOpacity="0.3"/>
          <text x="100" y="48" textAnchor="middle" fill="#1A8F5E" fontSize="24" fontWeight="bold" fontFamily="Arial, sans-serif">Opay</text>
          <text x="100" y="64" textAnchor="middle" fill="#1A8F5E" fontSize="9" opacity="0.7">📱 Digital Wallet</text>
        </svg>
      )
    },
    {
      name: 'Flutterwave',
      color: '#F41D7D',
      bgGradient: 'from-pink-500/20 to-pink-600/10',
      svg: () => (
        <svg viewBox="0 0 200 80" className="h-10 md:h-14 w-auto">
          <rect width="200" height="80" rx="12" fill="#1a1a2e" stroke="#F41D7D" strokeWidth="1" strokeOpacity="0.3"/>
          <text x="100" y="48" textAnchor="middle" fill="#F41D7D" fontSize="17" fontWeight="bold" fontFamily="Arial, sans-serif">Flutterwave</text>
          <text x="100" y="64" textAnchor="middle" fill="#F41D7D" fontSize="9" opacity="0.7">🌍 Global Payments</text>
        </svg>
      )
    },
    {
      name: 'Visa',
      color: '#1A1F71',
      bgGradient: 'from-blue-700/20 to-blue-800/10',
      svg: () => (
        <svg viewBox="0 0 200 80" className="h-10 md:h-14 w-auto">
          <rect width="200" height="80" rx="12" fill="#1a1a2e" stroke="#1A1F71" strokeWidth="1" strokeOpacity="0.3"/>
          <rect x="35" y="28" width="60" height="28" rx="6" fill="#1A1F71" opacity="0.8"/>
          <text x="65" y="48" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">VISA</text>
        </svg>
      )
    },
    {
      name: 'Mastercard',
      color: '#EB001B',
      bgGradient: 'from-red-600/20 to-red-700/10',
      svg: () => (
        <svg viewBox="0 0 200 80" className="h-10 md:h-14 w-auto">
          <rect width="200" height="80" rx="12" fill="#1a1a2e" stroke="#EB001B" strokeWidth="1" strokeOpacity="0.3"/>
          <circle cx="80" cy="42" r="14" fill="#EB001B" opacity="0.8"/>
          <circle cx="110" cy="42" r="14" fill="#F79E1B" opacity="0.8"/>
          <text x="118" y="62" fill="#EB001B" fontSize="9" fontWeight="bold">Mastercard</text>
        </svg>
      )
    },
    {
      name: 'Monnify',
      color: '#673AB7',
      bgGradient: 'from-purple-500/20 to-purple-600/10',
      svg: () => (
        <svg viewBox="0 0 200 80" className="h-10 md:h-14 w-auto">
          <rect width="200" height="80" rx="12" fill="#1a1a2e" stroke="#673AB7" strokeWidth="1" strokeOpacity="0.3"/>
          <text x="100" y="48" textAnchor="middle" fill="#673AB7" fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif">Monnify</text>
          <text x="100" y="64" textAnchor="middle" fill="#673AB7" fontSize="9" opacity="0.7">🔒 Bank Transfers</text>
        </svg>
      )
    }
  ];
  
  return logos.map((logo, idx) => (
    <div 
      key={idx}
      className="group relative bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800 hover:border-cyan-500/50 transition-all duration-300 hover:scale-110 cursor-pointer"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${logo.bgGradient} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      {logo.svg()}
    </div>
  ));
};

// Helper function for smaller logos (secondary carousel)
const renderLogosSmall = () => {
  const logos = [
    { name: 'Paystack', color: '#00B3B0' },
    { name: 'Moniepoint', color: '#F5821E' },
    { name: 'Opay', color: '#1A8F5E' },
    { name: 'Flutterwave', color: '#F41D7D' },
    { name: 'Visa', color: '#1A1F71' },
    { name: 'Mastercard', color: '#EB001B' },
    { name: 'Monnify', color: '#673AB7' }
  ];
  
  return logos.map((logo, idx) => (
    <div 
      key={idx}
      className="px-4 py-2 bg-gray-800/30 rounded-full border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105"
    >
      <span className="text-xs md:text-sm font-semibold" style={{ color: logo.color }}>
        {logo.name}
      </span>
    </div>
  ));
};

  const validateForm = () => {
    if (!formData.organizationName.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter your organization name' });
      return false;
    }
    if (!formData.userName.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter your name' });
      return false;
    }
    if (!formData.selectedPlan) {
      setSubmitStatus({ type: 'error', message: 'Please select a plan' });
      return false;
    }
    if (!formData.whatsappNumber.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter your WhatsApp number' });
      return false;
    }
    // Basic WhatsApp number validation (should contain digits only, can include +)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(formData.whatsappNumber.replace(/\s/g, ''))) {
      setSubmitStatus({ type: 'error', message: 'Please enter a valid phone number' });
      return false;
    }
    if (!formData.email.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter your email address' });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus({ type: 'error', message: 'Please enter a valid email address' });
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Format the message for WhatsApp
    const message = `*New Registration from Finlight Landing Page*%0A%0A` +
      `🏢 *Organization Name:* ${formData.organizationName}%0A` +
      `👤 *User Name:* ${formData.userName}%0A` +
      `📋 *Selected Plan:* ${formData.selectedPlan}%0A` +
      `📱 *WhatsApp Number:* ${formData.whatsappNumber}%0A` +
      `📧 *Email:* ${formData.email}%0A%0A` +
      `_Submitted via Finlight Website_`;
    
    // Create WhatsApp link
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    
    try {
      // Open WhatsApp chat with pre-filled message
      window.open(whatsappUrl, '_blank');
      
      // Show success message
      setSubmitStatus({ 
        type: 'success', 
        message: 'Thank you! Redirecting to WhatsApp. Please send the message to complete your registration.' 
      });
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          organizationName: '',
          userName: '',
          selectedPlan: '',
          whatsappNumber: '',
          email: ''
        });
        // Close modal after 3 seconds
        setTimeout(() => {
          setIsFormOpen(false);
          setSubmitStatus({ type: '', message: '' });
        }, 3000);
      }, 2000);
      
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openFormModal = () => {
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setSubmitStatus({ type: '', message: '' });
    // Reset form data if needed (optional)
    // setFormData({ organizationName: '', userName: '', selectedPlan: '', whatsappNumber: '', email: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Finlight
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-gray-300 hover:text-cyan-400 transition-colors">Home</a>
              <a href="#features" className="text-gray-300 hover:text-cyan-400 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-cyan-400 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-300 hover:text-cyan-400 transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-300 hover:text-cyan-400 transition-colors">Contact</a>
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-gray-800 active:bg-gray-700 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-gray-300" /> : <Menu className="h-5 w-5 text-gray-300" />}
            </button>
            
            <button
              onClick={() => { navigate("/login"); }}
              className="hidden md:flex px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all items-center gap-2"
            >
              Login
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-gray-800 space-y-2">
              <a href="#home" className="block py-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</a>
              <a href="#features" className="block py-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#pricing" className="block py-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#testimonials" className="block py-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
              <a href="#contact" className="block py-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="w-full mt-2 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                Login
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className={`${isMobile ? 'flex flex-col' : 'grid md:grid-cols-2'} gap-12 items-center`}>
            <div className="animate-on-scroll" id="hero-text">
              <div className={`inline-flex items-center gap-2 bg-cyan-500/10 rounded-full ${isMobile ? 'px-3 py-1.5 mb-4' : 'px-4 py-2 mb-6'} border border-cyan-500/20`}>
                <Shield className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-cyan-400`} />
                <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-cyan-400 font-medium`}>Secure & Reliable</span>
              </div>
              
              <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl lg:text-6xl'} font-bold text-white ${isMobile ? 'mb-3' : 'mb-6'} leading-tight`}>
                Modern Financial Management for{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {isMobile ? 'Associations' : 'Organizations'}
                </span>
              </h1>
              
              <p className={`${isMobile ? 'text-sm mb-6' : 'text-lg mb-8'} text-gray-400 leading-relaxed`}>
                {isMobile 
                  ? 'Streamline financial operations. Track payments, manage members, and generate reports with ease.'
                  : 'Streamline your community\'s financial operations with our comprehensive platform. Track payments, manage members, and generate reports with ease.'
                }
              </p>
              
              <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-col sm:flex-row gap-4'}`}>
                <button
                  onClick={openFormModal}
                  className={`${isMobile ? 'px-5 py-2.5 text-sm' : 'px-6 py-3 text-base'} bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2`}
                >
                  Get Started
                  <ArrowRight className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
                  }}
                  className={`${isMobile ? 'px-5 py-2.5 text-sm' : 'px-6 py-3 text-base'} bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2`}
                >
                  Login
                  <ArrowRight className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                </button>
                
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className={`${isMobile ? 'px-5 py-2.5 text-sm' : 'px-6 py-3 text-base'} border border-gray-700 text-gray-300 rounded-xl font-semibold hover:border-cyan-500 hover:text-cyan-400 transition-all`}
                >
                  Learn More
                </button>
              </div>
              
              <div className={`flex items-center gap-6 mt-8 pt-4`}>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`${isMobile ? 'w-8 h-8 text-xs' : 'w-10 h-10'} rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 border-2 border-black flex items-center justify-center text-white font-bold`}>
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} fill-yellow-400 text-yellow-400`} />
                    ))}
                  </div>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>Trusted by 500+ members</p>
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative animate-on-scroll" id="hero-image">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl p-6 border border-gray-800">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <Wallet className="h-8 w-8" />
                      <span className="text-sm opacity-90">Account Summary</span>
                    </div>
                    <p className="text-3xl font-bold">₦2,450,000</p>
                    <p className="text-sm opacity-90 mt-1">Total Contributions</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-green-400" />
                        <span className="text-sm text-gray-300">Recent Payment</span>
                      </div>
                      <span className="font-semibold text-white">₦25,000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-cyan-400" />
                        <span className="text-sm text-gray-300">Active Members</span>
                      </div>
                      <span className="font-semibold text-white">342</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`${isMobile ? 'py-10' : 'py-16'} bg-black/50`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-6'}`}>
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`text-center ${isMobile ? 'p-3' : 'p-6'} bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 animate-on-scroll hover:border-cyan-500/50 transition-all`}
                id={`stat-${index}`}
              >
                <div className={`inline-flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-12 h-12'} bg-cyan-500/10 rounded-xl mb-2 text-cyan-400 mx-auto`}>
                  {stat.icon}
                </div>
                <div className={`${isMobile ? 'text-base' : 'text-2xl'} font-bold text-white`}>{stat.value}</div>
                <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500 mt-0.5`}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`${isMobile ? 'py-10' : 'py-20'} px-4`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white mb-4`}>
              Everything you need to manage finances
            </h2>
            <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-400 max-w-2xl mx-auto`}>
              Powerful features designed to simplify financial management for community organizations
            </p>
          </div>
          
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-8'}`}>
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group ${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all animate-on-scroll`}
                id={`feature-${index}`}
              >
                <div className={`bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white ${isMobile ? 'w-10 h-10 mb-3' : 'w-12 h-12 mb-4'}`}>
                  {feature.icon}
                </div>
                <h3 className={`${isMobile ? 'text-base' : 'text-xl'} font-semibold text-white mb-2`}>{feature.title}</h3>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400 leading-relaxed`}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={`${isMobile ? 'py-10' : 'py-20'} px-4 bg-gradient-to-b from-black to-gray-900`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white mb-4`}>
              Simple, Transparent Pricing
            </h2>
            <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-400 max-w-2xl mx-auto`}>
              Choose the perfect plan for your organization's needs
            </p>
            <p className="text-xs text-gray-500 mt-2">All prices in Nigerian Naira (₦)</p>
          </div>
          
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'}`}>
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-6 bg-gradient-to-br ${plan.gradient} border ${plan.borderColor} transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  plan.recommended ? 'ring-2 ring-cyan-400 shadow-xl shadow-cyan-500/20' : ''
                } ${plan.isHighlighted ? 'md:scale-105' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                      🔥 Popular
                    </span>
                  </div>
                )}
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                      ⭐ Recommended
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-cyan-400">{plan.price}</div>
                  {plan.period && <p className="text-xs text-gray-400 mt-1">{plan.period}</p>}
                  <div className="mt-3 inline-block px-3 py-1 bg-white/5 rounded-full">
                    <span className="text-sm text-gray-300">👥 {plan.memberSlots} {typeof plan.memberSlots === 'number' ? 'Members' : 'Members'}</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={openFormModal}
                  className={`w-full py-3 bg-gradient-to-r ${plan.buttonGradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all ${plan.recommended ? 'hover:shadow-cyan-500/25' : ''}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className={`${isMobile ? 'py-10' : 'py-20'} px-4 bg-gradient-to-b from-gray-900 to-black`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white mb-4`}>
              What our members say
            </h2>
            <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-400 max-w-2xl mx-auto`}>
              Join thousands of satisfied users who trust Finlight for their financial management
            </p>
          </div>
          
          <div className={`grid ${isMobile ? 'space-y-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-8'}`}>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br from-gray-900 to-black rounded-2xl ${isMobile ? 'p-4' : 'p-6'} border border-gray-800 hover:border-cyan-500/50 transition-all animate-on-scroll`}
                id={`testimonial-${index}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full`}
                  />
                  <div>
                    <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-white`}>{testimonial.name}</h4>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} fill-yellow-400 text-yellow-400`} />
                  ))}
                </div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-400 leading-relaxed`}>"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`${isMobile ? 'py-10' : 'py-20'} px-4`}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-3xl p-6 md:p-12 text-white">
            <h2 className={`${isMobile ? 'text-xl' : 'text-3xl md:text-4xl'} font-bold mb-3`}>
              Ready to transform your financial management?
            </h2>
            <p className={`${isMobile ? 'text-xs mb-4' : 'text-lg mb-8'} text-cyan-100 max-w-2xl mx-auto`}>
              Join hundreds of communities already using Finlight to streamline their financial operations
            </p>
            <button
              onClick={openFormModal}
              className={`${isMobile ? 'px-5 py-2.5 text-sm' : 'px-8 py-3 text-base'} bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2`}
            >
              Get Started Now
              <ArrowRight className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
            </button>
          </div>
        </div>
      </section>

{/* Integration with Payment Giants Section */}
<section className={`${isMobile ? 'py-10' : 'py-16'} px-4 bg-gradient-to-b from-gray-900 to-black overflow-hidden`}>
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-2 bg-cyan-500/10 rounded-full px-4 py-2 mb-4 border border-cyan-500/20">
        <Zap className="h-4 w-4 text-cyan-400" />
        <span className="text-sm text-cyan-400 font-medium">Trusted Payment Partners</span>
      </div>
      <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold text-white mb-3`}>
        Integration with Payment Giants
      </h2>
      <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-400 max-w-2xl mx-auto`}>
        Seamlessly connect with Africa's leading payment platforms for smooth transactions
      </p>
    </div>

    {/* Animated Carousel / Slider */}
    <div className="relative py-8">
      {/* Gradient Overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none"></div>
      
      {/* Main Slider */}
      <div className="overflow-hidden">
        <div 
          className="flex gap-8 md:gap-12 items-center animate-scroll"
          style={{
            animation: `scroll ${isMobile ? '30s' : '40s'} linear infinite`,
            width: 'max-content'
          }}
        >
          {/* First set of logos */}
          {renderLogos().map((logo, index) => (
            <div key={`logo-1-${index}`} className="flex-shrink-0">
              {logo}
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {renderLogos().map((logo, index) => (
            <div key={`logo-2-${index}`} className="flex-shrink-0">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Slow Version (Reverse Direction) - Optional secondary row */}
    <div className="relative py-4 mt-2 opacity-70">
      <div className="overflow-hidden">
        <div 
          className="flex gap-8 md:gap-12 items-center animate-scroll-reverse"
          style={{
            animation: `scroll-reverse ${isMobile ? '35s' : '45s'} linear infinite`,
            width: 'max-content'
          }}
        >
          {/* First set of logos */}
          {renderLogosSmall().map((logo, index) => (
            <div key={`logo-rev-1-${index}`} className="flex-shrink-0">
              {logo}
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {renderLogosSmall().map((logo, index) => (
            <div key={`logo-rev-2-${index}`} className="flex-shrink-0">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Important Notice */}
    <div className="mt-12 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
        <span className="text-amber-400 font-semibold text-sm">Important Notice</span>
      </div>
      <p className="text-gray-400 text-xs md:text-sm max-w-2xl mx-auto">
        Finlight is not a bank. All funds are processed through our registered partner institutions. 
        Your transactions are secured and protected by our payment partners' robust security infrastructure.
      </p>
    </div>
  </div>

  <style jsx>{`
    @keyframes scroll {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-50%);
      }
    }
    
    @keyframes scroll-reverse {
      0% {
        transform: translateX(-50%);
      }
      100% {
        transform: translateX(0);
      }
    }
    
    .animate-scroll {
      animation: scroll 40s linear infinite;
    }
    
    .animate-scroll-reverse {
      animation: scroll-reverse 45s linear infinite;
    }
    
    .animate-scroll:hover,
    .animate-scroll-reverse:hover {
      animation-play-state: paused;
    }
  `}</style>
</section>

{/* FAQ Section */}
<section id="faq" className={`${isMobile ? 'py-10' : 'py-20'} px-4 bg-gradient-to-b from-black to-gray-900`}>
  <div className="max-w-4xl mx-auto">
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 bg-cyan-500/10 rounded-full px-4 py-2 mb-4 border border-cyan-500/20">
        <Shield className="h-4 w-4 text-cyan-400" />
        <span className="text-sm text-cyan-400 font-medium">Got Questions?</span>
      </div>
      <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white mb-4`}>
        Frequently Asked Questions
      </h2>
      <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-400 max-w-2xl mx-auto`}>
        Everything you need to know about Finlight and how it works
      </p>
    </div>

    <div className="space-y-4">
      {/* General Questions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
          General Questions
        </h3>
        <div className="space-y-4">
          {/* FAQ Item 1 */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden">
            <button 
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              onClick={() => {
                const content = document.getElementById('faq-1');
                const icon = document.getElementById('faq-icon-1');
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
              }}
            >
              <span className="font-semibold text-white">What is Finlight and how does it work?</span>
              <ChevronRight id="faq-icon-1" className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
            </button>
            <div id="faq-1" className="hidden px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-800/50 pt-4">
              Finlight is a comprehensive financial management platform designed specifically for community organizations, age grades, and associations. It helps you track member contributions, manage dues payments, generate financial reports, and send real-time notifications. The platform works on both web and mobile devices, allowing members to pay dues, view their contribution history, and receive updates instantly.
            </div>
          </div>

          {/* FAQ Item 2 */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden">
            <button 
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              onClick={() => {
                const content = document.getElementById('faq-2');
                const icon = document.getElementById('faq-icon-2');
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
              }}
            >
              <span className="font-semibold text-white">Who can use Finlight?</span>
              <ChevronRight id="faq-icon-2" className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
            </button>
            <div id="faq-2" className="hidden px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-800/50 pt-4">
              Finlight is perfect for age grades, town unions, cooperative societies, tenant associations, church groups, alumni associations, and any community-based organization that needs to manage member contributions and finances. Whether you have 30 members or 500+, Finlight scales to meet your needs.
            </div>
          </div>

          {/* FAQ Item 3 */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden">
            <button 
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              onClick={() => {
                const content = document.getElementById('faq-3');
                const icon = document.getElementById('faq-icon-3');
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
              }}
            >
              <span className="font-semibold text-white">Is Finlight secure?</span>
              <ChevronRight id="faq-icon-3" className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
            </button>
            <div id="faq-3" className="hidden px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-800/50 pt-4">
              Absolutely! Finlight uses bank-grade 256-bit SSL encryption to protect all data and transactions. We are PCI DSS compliant for payment processing, and all financial information is stored securely. Regular security audits and updates ensure your organization's data remains safe.
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Billing Questions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
          Pricing & Billing
        </h3>
        <div className="space-y-4">
          {/* FAQ Item 4 */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden">
            <button 
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              onClick={() => {
                const content = document.getElementById('faq-4');
                const icon = document.getElementById('faq-icon-4');
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
              }}
            >
              <span className="font-semibold text-white">What payment methods do you accept?</span>
              <ChevronRight id="faq-icon-4" className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
            </button>
            <div id="faq-4" className="hidden px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-800/50 pt-4">
              We accept all major payment methods including bank transfers, credit/debit cards (Visa, Mastercard, Verve), USSD payments, and mobile money. Members can pay their dues using any method convenient for them, making it easy for everyone in your community.
            </div>
          </div>

          {/* FAQ Item 5 */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden">
            <button 
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              onClick={() => {
                const content = document.getElementById('faq-5');
                const icon = document.getElementById('faq-icon-5');
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
              }}
            >
              <span className="font-semibold text-white">Can I upgrade or downgrade my plan?</span>
              <ChevronRight id="faq-icon-5" className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
            </button>
            <div id="faq-5" className="hidden px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-800/50 pt-4">
              Yes! You can upgrade or downgrade your plan at any time. When you upgrade, the new features become available immediately, and the pricing is prorated. For downgrades, the changes take effect at the start of your next billing cycle. Contact our support team for assistance with plan changes.
            </div>
          </div>

          {/* FAQ Item 6 */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden">
            <button 
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              onClick={() => {
                const content = document.getElementById('faq-6');
                const icon = document.getElementById('faq-icon-6');
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
              }}
            >
              <span className="font-semibold text-white">Is there a free trial available?</span>
              <ChevronRight id="faq-icon-6" className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
            </button>
            <div id="faq-6" className="hidden px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-800/50 pt-4">
              Yes! We offer a free Starter plan that includes up to 30 members. This is perfect for small groups to try out Finlight and see how it works. You can upgrade to paid plans at any time when your organization grows. No credit card required to start with the free plan.
            </div>
          </div>
        </div>
      </div>

      {/* Features & Functionality */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
          Features & Functionality
        </h3>
        <div className="space-y-4">
          {/* FAQ Item 7 */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden">
            <button 
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              onClick={() => {
                const content = document.getElementById('faq-7');
                const icon = document.getElementById('faq-icon-7');
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
              }}
            >
              <span className="font-semibold text-white">Can I customize member roles and permissions?</span>
              <ChevronRight id="faq-icon-7" className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
            </button>
            <div id="faq-7" className="hidden px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-800/50 pt-4">
              Absolutely! Finlight comes with customizable role-based access control. You can assign different roles to members (Admin, Treasurer, Secretary, Member, etc.) with specific permissions. This ensures that only authorized personnel can access sensitive financial data and perform critical operations.
            </div>
          </div>

          {/* FAQ Item 8 */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden">
            <button 
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              onClick={() => {
                const content = document.getElementById('faq-8');
                const icon = document.getElementById('faq-icon-8');
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
              }}
            >
              <span className="font-semibold text-white">What kind of reports can I generate?</span>
              <ChevronRight id="faq-icon-8" className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
            </button>
            <div id="faq-8" className="hidden px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-800/50 pt-4">
              Finlight provides comprehensive financial reports including: contribution summaries, payment history, member statements, outstanding dues reports, income/expense tracking, budget vs actual analysis, and custom date-range reports. All reports can be exported to PDF or Excel for record-keeping.
            </div>
          </div>

          {/* FAQ Item 9 */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden">
            <button 
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              onClick={() => {
                const content = document.getElementById('faq-9');
                const icon = document.getElementById('faq-icon-9');
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
              }}
            >
              <span className="font-semibold text-white">Does Finlight send payment reminders?</span>
              <ChevronRight id="faq-icon-9" className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
            </button>
            <div id="faq-9" className="hidden px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-800/50 pt-4">
              Yes! Finlight automatically sends payment reminders to members via SMS, email, and WhatsApp notifications. You can customize reminder schedules (weekly, monthly, etc.) and messages. Members also receive real-time alerts when payments are made, reducing the administrative burden on your team.
            </div>
          </div>
        </div>
      </div>

      {/* Support & Technical */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
          Support & Technical
        </h3>
        <div className="space-y-4">
          {/* FAQ Item 10 */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden">
            <button 
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              onClick={() => {
                const content = document.getElementById('faq-10');
                const icon = document.getElementById('faq-icon-10');
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
              }}
            >
              <span className="font-semibold text-white">What kind of customer support do you offer?</span>
              <ChevronRight id="faq-icon-10" className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
            </button>
            <div id="faq-10" className="hidden px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-800/50 pt-4">
              We offer 24/7 customer support via WhatsApp, email, and phone. All paid plans include priority support with faster response times. Our support team is based in Nigeria and understands the unique needs of local community organizations. We also provide onboarding assistance and training for your administrators.
            </div>
          </div>

          {/* FAQ Item 11 */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden">
            <button 
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              onClick={() => {
                const content = document.getElementById('faq-11');
                const icon = document.getElementById('faq-icon-11');
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
              }}
            >
              <span className="font-semibold text-white">Can members access Finlight on mobile?</span>
              <ChevronRight id="faq-icon-11" className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
            </button>
            <div id="faq-11" className="hidden px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-800/50 pt-4">
              Yes! Finlight is fully responsive and works seamlessly on all devices including smartphones, tablets, and desktop computers. Your members can access the platform from anywhere, anytime using their mobile browsers. We also have a mobile app coming soon for even better experience.
            </div>
          </div>

          {/* FAQ Item 12 */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden">
            <button 
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              onClick={() => {
                const content = document.getElementById('faq-12');
                const icon = document.getElementById('faq-icon-12');
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
              }}
            >
              <span className="font-semibold text-white">How long does it take to set up Finlight?</span>
              <ChevronRight id="faq-icon-12" className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
            </button>
            <div id="faq-12" className="hidden px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-800/50 pt-4">
              Most organizations can set up Finlight in under 10 minutes! Simply sign up, add your members, set contribution amounts, and you're ready to go. We provide video tutorials and documentation to guide you through the process. For larger organizations, our team can help with data migration and custom setup.
            </div>
          </div>
        </div>
      </div>

      {/* Security & Data */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
          Security & Data
        </h3>
        <div className="space-y-4">
          {/* FAQ Item 13 */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden">
            <button 
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              onClick={() => {
                const content = document.getElementById('faq-13');
                const icon = document.getElementById('faq-icon-13');
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
              }}
            >
              <span className="font-semibold text-white">Is my organization's data backed up?</span>
              <ChevronRight id="faq-icon-13" className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
            </button>
            <div id="faq-13" className="hidden px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-800/50 pt-4">
              Yes! We perform automatic daily backups of all customer data. Enterprise and Business plans include up to 3-5 years of backup guarantee. You can also export your data at any time in multiple formats (CSV, Excel, PDF) for your own records and peace of mind.
            </div>
          </div>

          {/* FAQ Item 14 */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden">
            <button 
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              onClick={() => {
                const content = document.getElementById('faq-14');
                const icon = document.getElementById('faq-icon-14');
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
              }}
            >
              <span className="font-semibold text-white">Can I cancel my subscription anytime?</span>
              <ChevronRight id="faq-icon-14" className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
            </button>
            <div id="faq-14" className="hidden px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-800/50 pt-4">
              Yes, you can cancel your subscription at any time with no hidden fees. Your data will remain accessible for 30 days after cancellation, giving you time to export everything you need. There are no long-term contracts or commitments.
            </div>
          </div>

          {/* FAQ Item 15 - New */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden">
            <button 
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
              onClick={() => {
                const content = document.getElementById('faq-15');
                const icon = document.getElementById('faq-icon-15');
                content.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
              }}
            >
              <span className="font-semibold text-white">Can I import existing member data into Finlight?</span>
              <ChevronRight id="faq-icon-15" className="h-5 w-5 text-cyan-400 transition-transform duration-300" />
            </button>
            <div id="faq-15" className="hidden px-6 pb-4 text-gray-400 text-sm leading-relaxed border-t border-gray-800/50 pt-4">
              Absolutely! Finlight supports bulk member import via CSV/Excel files. You can easily migrate your existing member database, including names, contact information, previous payment records, and contribution history. Our support team can assist with data migration for larger organizations.
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Still Have Questions CTA */}
    <div className="mt-12 text-center">
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-2xl p-6 border border-cyan-500/20">
        <h3 className="text-lg font-semibold text-white mb-2">Still have questions?</h3>
        <p className="text-sm text-gray-400 mb-4">We're here to help you get started</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={openFormModal}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all inline-flex items-center justify-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Contact Support
          </button>
          <button
            onClick={() => window.open("https://wa.me/2347062780839?text=I%20have%20a%20question%20about%20Finlight", "_blank")}
            className="px-5 py-2 border border-gray-700 text-gray-300 rounded-xl text-sm font-medium hover:border-cyan-500 hover:text-cyan-400 transition-all inline-flex items-center justify-center gap-2"
          >
            <Phone className="h-4 w-4" />
            Chat on WhatsApp
          </button>
        </div>
      </div>
    </div>
  </div>
</section>
      {/* Footer */}
      <footer id="contact" className="bg-black text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'md:grid-cols-4 gap-8'}`}>
            <div className="text-center md:text-left">
              <div className={`flex items-center ${isMobile ? 'justify-center' : ''} gap-2 mb-4`}>
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="font-bold text-lg">F</span>
                </div>
                <span className="font-bold text-xl">Finlight</span>
              </div>
              <p className="text-gray-400 text-sm text-center md:text-left">
                Modern financial management for age grades and community organizations.
              </p>
            </div>
            
            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-4 text-gray-300">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#home" className="hover:text-cyan-400 transition-colors">Home</a></li>
                <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
                <li><a href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-cyan-400 transition-colors">Terms & Conditions</a></li>
                <li><a href="/refund" className="hover:text-cyan-400 transition-colors">Refund Policy</a></li>
                <li><a href="#testimonials" className="hover:text-cyan-400 transition-colors">Testimonials</a></li>
                <li><button onClick={openFormModal} className="hover:text-cyan-400 transition-colors">Get Started</button></li>
              </ul>
            </div>
            
            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-4 text-gray-300">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className={`flex items-center ${isMobile ? 'justify-center' : ''} gap-2`}>
                  <Mail className="h-4 w-4" />
                  <span>support@finlight.com</span>
                </li>
                <li className={`flex items-center ${isMobile ? 'justify-center' : ''} gap-2`}>
                  <Phone className="h-4 w-4" />
                  <span>+234 706 278 0839</span>
                </li>
                <li className={`flex items-center ${isMobile ? 'justify-center' : ''} gap-2`}>
                  <MapPin className="h-4 w-4" />
                  <span>Lagos, Nigeria</span>
                </li>
              </ul>
            </div>
            
            <div className="text-center md:text-left">
              <h4 className="font-semibold mb-4 text-gray-300">Security</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className={`flex items-center ${isMobile ? 'justify-center' : ''} gap-2`}>
                  <Lock className="h-4 w-4" />
                  <span>256-bit SSL Encryption</span>
                </li>
                <li className={`flex items-center ${isMobile ? 'justify-center' : ''} gap-2`}>
                  <Shield className="h-4 w-4" />
                  <span>PCI DSS Compliant</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2024 Finlight. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Form Modal Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeFormModal}
          />
          
          {/* Modal Content */}
          <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto modal-scroll">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-br from-gray-900 to-black border-b border-gray-800 p-5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Get Started with Finlight</h3>
                <p className="text-xs text-gray-400 mt-1">Fill out the form to begin your journey</p>
              </div>
              <button
                onClick={closeFormModal}
                className="p-1 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <XCircle className="h-6 w-6 text-gray-400 hover:text-gray-200" />
              </button>
            </div>
            
            {/* Form Body */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              {/* Organization Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Organization Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  placeholder="e.g., City Welfare Association"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
              
              {/* User Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Your Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  placeholder="e.g., John Agim"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
              
              {/* Plan Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Select Plan <span className="text-red-400">*</span>
                </label>
                <select
                  name="selectedPlan"
                  value={formData.selectedPlan}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                >
                  <option value="">Choose a plan</option>
                  <option value="Starter (FREE)">Starter (FREE) - Up to 30 members</option>
                  <option value="Growth (₦30,000 one-time + ₦12,000/year)">Growth (₦30,000 one-time + ₦12,000/year) - Up to 120 members</option>
                  <option value="Business (₦95,000 one-time + ₦20,000/year)">Business (₦95,000 one-time + ₦20,000/year) - Up to 300 members</option>
                  <option value="Custom (Quote based)">Custom (Quote based) - Unlimited members</option>
                </select>
              </div>
              
              {/* WhatsApp Number */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  WhatsApp Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 2348123456789"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Include country code (e.g., 234 for Nigeria)</p>
              </div>
              
              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
              
              {/* Status Message */}
              {submitStatus.message && (
                <div className={`p-3 rounded-xl text-sm ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {submitStatus.message}
                </div>
              )}
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit via WhatsApp
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              
              <p className="text-xs text-center text-gray-500 pt-2">
                By submitting, you agree to our terms and privacy policy. You'll be redirected to WhatsApp to complete your registration.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;