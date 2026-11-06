import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
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
  Download,
  X,
  Check,
  Zap,
  XCircle
} from 'lucide-react';
import { warmupBackend } from '../services/api';


const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const [currentCard, setCurrentCard] = useState('card');

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

  // APK Download Link - Google Drive direct download
  const APK_DOWNLOAD_URL = "https://raw.githubusercontent.com/zephdmc/finlightFrontendV2/main/AppStore/Finlight.apk";
  useEffect(() => {
    warmupBackend();
  }, []);

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

    // Hide floating button when scrolling to bottom
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollPosition + windowHeight >= documentHeight - 100) {
        setShowFloatingButton(false);
      } else {
        setShowFloatingButton(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Prevent body scroll when modal is open
    if (isFormOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      document.body.style.overflow = 'unset';
    };
  }, [isFormOpen]);



  // Carousel navigation functions
  const slides = ['card', 'image1', 'image2', 'image3'];

  const nextSlide = () => {
    const currentIndex = slides.indexOf(currentCard);
    const nextIndex = (currentIndex + 1) % slides.length;
    setCurrentCard(slides[nextIndex]);
  };

  const prevSlide = () => {
    const currentIndex = slides.indexOf(currentCard);
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    setCurrentCard(slides[prevIndex]);
  };

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [currentCard]); // Re-run when currentCard changes
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
      color: 'from-blue-600 to-blue-800'
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
    { value: 'â‚¦10M+', label: isMobile ? 'Processed' : 'Transactions Processed', icon: <Wallet className={isMobile ? "h-4 w-4" : "h-5 w-5"} /> },
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
      gradient: 'from-blue-800 to-blue-900',
      borderColor: 'border-blue-700',
      textColor: 'text-blue-300',
      buttonGradient: 'from-blue-700 to-blue-800'
    },
    {
      name: 'Growth',
      price: 'â‚¦30,000',
      originalPrice: null,
      period: 'one-time + â‚¦12,000/year',
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
      price: 'â‚¦95,000',
      originalPrice: null,
      period: 'one-time + â‚¦20,000/year',
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
      gradient: 'from-blue-600 to-blue-600',
      borderColor: 'border-blue-400',
      textColor: 'text-blue-300',
      buttonGradient: 'from-blue-500 to-blue-500',
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
      gradient: 'from-blue-900 to-pink-900',
      borderColor: 'border-blue-600',
      textColor: 'text-blue-900',
      buttonGradient: 'from-blue-800 to-pink-600'
    }
  ];

  const testimonials = [
    {
      name: 'John Okonkwo',
      role: 'Financial Secretary',
      content: isMobile ? 'Finlight transformed how we manage finances. The transparency is unmatched.' : 'Finlight has transformed how we manage our association\'s finances. The transparency and ease of use are unmatched.',
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
            <rect width="200" height="80" rx="12" fill="#1a1a2e" stroke="#00B3B0" strokeWidth="1" strokeOpacity="0.3" />
            <text x="100" y="48" textAnchor="middle" fill="#00B3B0" fontSize="20" fontWeight="bold" fontFamily="Arial, sans-serif">Paystack</text>
            <text x="100" y="64" textAnchor="middle" fill="#00B3B0" fontSize="10" opacity="0.7">âš¡ Payments</text>
          </svg>
        )
      },
      {
        name: 'Moniepoint',
        color: '#F5821E',
        bgGradient: 'from-orange-500/20 to-orange-600/10',
        svg: () => (
          <svg viewBox="0 0 200 80" className="h-10 md:h-14 w-auto">
            <rect width="200" height="80" rx="12" fill="#1a1a2e" stroke="#F5821E" strokeWidth="1" strokeOpacity="0.3" />
            <text x="100" y="48" textAnchor="middle" fill="#F5821E" fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif">Moniepoint</text>
            <text x="100" y="64" textAnchor="middle" fill="#F5821E" fontSize="9" opacity="0.7">ðŸ’° Business Banking</text>
          </svg>
        )
      },
      {
        name: 'Opay',
        color: '#1A8F5E',
        bgGradient: 'from-green-500/20 to-green-600/10',
        svg: () => (
          <svg viewBox="0 0 200 80" className="h-10 md:h-14 w-auto">
            <rect width="200" height="80" rx="12" fill="#1a1a2e" stroke="#1A8F5E" strokeWidth="1" strokeOpacity="0.3" />
            <text x="100" y="48" textAnchor="middle" fill="#1A8F5E" fontSize="24" fontWeight="bold" fontFamily="Arial, sans-serif">Opay</text>
            <text x="100" y="64" textAnchor="middle" fill="#1A8F5E" fontSize="9" opacity="0.7">ðŸ“± Digital Wallet</text>
          </svg>
        )
      },
      {
        name: 'Flutterwave',
        color: '#F41D7D',
        bgGradient: 'from-pink-500/20 to-pink-600/10',
        svg: () => (
          <svg viewBox="0 0 200 80" className="h-10 md:h-14 w-auto">
            <rect width="200" height="80" rx="12" fill="#1a1a2e" stroke="#F41D7D" strokeWidth="1" strokeOpacity="0.3" />
            <text x="100" y="48" textAnchor="middle" fill="#F41D7D" fontSize="17" fontWeight="bold" fontFamily="Arial, sans-serif">Flutterwave</text>
            <text x="100" y="64" textAnchor="middle" fill="#F41D7D" fontSize="9" opacity="0.7">ðŸŒ Global Payments</text>
          </svg>
        )
      },
      {
        name: 'Visa',
        color: '#1A1F71',
        bgGradient: 'from-blue-700/20 to-blue-800/10',
        svg: () => (
          <svg viewBox="0 0 200 80" className="h-10 md:h-14 w-auto">
            <rect width="200" height="80" rx="12" fill="#1a1a2e" stroke="#1A1F71" strokeWidth="1" strokeOpacity="0.3" />
            <rect x="35" y="28" width="60" height="28" rx="6" fill="#1A1F71" opacity="0.8" />
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
            <rect width="200" height="80" rx="12" fill="#1a1a2e" stroke="#EB001B" strokeWidth="1" strokeOpacity="0.3" />
            <circle cx="80" cy="42" r="14" fill="#EB001B" opacity="0.8" />
            <circle cx="110" cy="42" r="14" fill="#F79E1B" opacity="0.8" />
            <text x="118" y="62" fill="#EB001B" fontSize="9" fontWeight="bold">Mastercard</text>
          </svg>
        )
      },
      {
        name: 'Monnify',
        color: '#673AB7',
        bgGradient: 'from-blue-600/20 to-blue-800/10',
        svg: () => (
          <svg viewBox="0 0 200 80" className="h-10 md:h-14 w-auto">
            <rect width="200" height="80" rx="12" fill="#1a1a2e" stroke="#673AB7" strokeWidth="1" strokeOpacity="0.3" />
            <text x="100" y="48" textAnchor="middle" fill="#673AB7" fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif">Monnify</text>
            <text x="100" y="64" textAnchor="middle" fill="#673AB7" fontSize="9" opacity="0.7">ðŸ”’ Bank Transfers</text>
          </svg>
        )
      }
    ];

    return logos.map((logo, idx) => (
      <div
        key={idx}
        className="group relative bg-gradient-to-br from-blue-900 to-black rounded-xl border border-blue-800 hover:border-blue-500/50 transition-all duration-300 hover:scale-110 cursor-pointer"
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
        className="px-4 py-2 bg-blue-800/30 rounded-full border border-blue-700 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
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
      `ðŸ¢ *Organization Name:* ${formData.organizationName}%0A` +
      `ðŸ‘¤ *User Name:* ${formData.userName}%0A` +
      `ðŸ“‹ *Selected Plan:* ${formData.selectedPlan}%0A` +
      `ðŸ“± *WhatsApp Number:* ${formData.whatsappNumber}%0A` +
      `ðŸ“§ *Email:* ${formData.email}%0A%0A` +
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

  // Floating Download Button Component
  const FloatingDownloadButton = () => (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${showFloatingButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
      <a
        href={APK_DOWNLOAD_URL}
        download="FinlightApp.apk"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full px-5 py-3 shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-full border border-white/20">
            <Smartphone className="h-4 w-4" />
          </div>
          <div className="text-left">
            <span className="font-medium text-sm block">Download App</span>
            <span className="text-[10px] text-blue-200/80 block">Android APK</span>
          </div>
        </div>
        <Download className="h-4 w-4 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400"></span>
        </span>
      </a>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>FinLight - Financial Management Platform for Communities</title>
        <meta name="description" content="FinLight is a comprehensive financial management platform for community organizations, clubs, alumni associations, age grades, cooperatives, and student groups. Track payments, manage members, and generate reports." />
        <meta property="og:title" content="FinLight - Financial Management Platform" />
        <meta property="og:description" content="Simplify financial management for your community organization with FinLight. Track payments, manage members, and generate reports effortlessly." />
        <meta property="og:url" content="https://finlight.web.app" />
        <link rel="canonical" href="https://finlight.web.app" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "FinLight",
            "description": "Financial management platform for community organizations",
            "applicationCategory": "Finance",
            "operatingSystem": "All",
            "url": "https://finlight.web.app",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black" style={{
        background: 'linear-gradient(135deg, rgba(0, 49, 162, 0.85), rgba(0, 15, 231, 0.9))',
      }}>
        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 bg-gray/80 backdrop-blur-md z-50 border-b border-blue-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">



                  <div className="absolute top-2 left-3 w-5 h-2.5 bg-white/35 rounded-lg rotate-[-20deg] z-10" />
                  <img
                    src="/icon-192x192.png"
                    alt="Finlight Logo"
                    className="w-full h-full object-contain rounded-xl z-10"
                  />




                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                  Finlight
                </span>
              </div>

              <div className="hidden md:flex items-center gap-8">
                <a href="#home" className="text-blue-300 hover:text-blue-400 transition-colors">Home</a>
                <a href="#features" className="text-blue-300 hover:text-blue-400 transition-colors">Features</a>
                <a href="#pricing" className="text-blue-300 hover:text-blue-400 transition-colors">Pricing</a>
                <a href="#testimonials" className="text-blue-300 hover:text-blue-400 transition-colors">Testimonials</a>
                <a href="#contact" className="text-blue-300 hover:text-blue-400 transition-colors">Contact</a>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-blue-800 active:bg-blue-700 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-5 w-5 text-blue-300" /> : <Menu className="h-5 w-5 text-blue-300" />}
              </button>

              <button
                onClick={() => { navigate("/login"); }}
                className="hidden md:flex px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all items-center gap-2"
              >
                Login
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden py-3 border-t border-blue-800 space-y-2">
                <a href="#home" className="block py-2 text-sm text-blue-300 hover:text-blue-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</a>
                <a href="#features" className="block py-2 text-sm text-blue-300 hover:text-blue-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#pricing" className="block py-2 text-sm text-blue-300 hover:text-blue-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
                <a href="#testimonials" className="block py-2 text-sm text-blue-300 hover:text-blue-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
                <a href="#contact" className="block py-2 text-sm text-blue-300 hover:text-blue-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/login");
                  }}
                  className="w-full mt-2 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
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
                <div className={`inline-flex items-center gap-2 bg-blue-800/10 rounded-full ${isMobile ? 'px-3 py-1.5 mb-4' : 'px-4 py-2 mb-6'} border border-blue-500/20`}>
                  <Shield className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-blue-400`} />
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-400 font-medium`}>Secure & Reliable</span>
                </div>

                <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl lg:text-6xl'} font-bold text-white ${isMobile ? 'mb-3' : 'mb-6'} leading-tight`}>
                  Modern Financial Management for{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                    {isMobile ? 'Associations' : 'Organizations'}
                  </span>
                </h1>

                <p className={`${isMobile ? 'text-sm mb-6' : 'text-lg mb-8'} text-blue-400 leading-relaxed`}>
                  {isMobile
                    ? 'Streamline financial operations. Track payments, manage members, and generate reports with ease.'
                    : 'Streamline your community\'s financial operations with our comprehensive platform. Track payments, manage members, and generate reports with ease.'
                  }
                </p>

                <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-col sm:flex-row gap-4'}`}>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/login");
                    }}
                    className={`${isMobile ? 'px-5 py-2.5 text-sm' : 'px-6 py-3 text-base'} bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2`}
                  >
                    Get Started
                    <ArrowRight className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                  </button>

                  <button
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className={`${isMobile ? 'px-5 py-2.5 text-sm' : 'px-6 py-3 text-base'} border border-blue-700 text-blue-100 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-400 transition-all`}
                  >
                    Learn More
                  </button>
                </div>

                {/* <div className={`flex items-center gap-6 mt-8 pt-4`}>
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`${isMobile ? 'w-8 h-8 text-xs' : 'w-10 h-10'} rounded-full bg-gradient-to-r from-blue-500 to-blue-600 border-2 border-black flex items-center justify-center text-white font-bold`}>
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div> */}
                {/* <div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} fill-yellow-400 text-yellow-400`} />
                      ))}
                    </div>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-500`}>Trusted by 500+ members</p>
                  </div> */}
                {/* </div> */}
              </div>

              {/* Hero Image with Carousel */}
              <div className="relative animate-on-scroll" id="hero-image">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>

                  {/* Carousel Container */}
                  <div className="relative bg-gradient-to-br from-blue-900 to-black rounded-3xl shadow-2xl p-6 border border-blue-800 overflow-hidden min-h-[340px]">
                    {/* Card Content */}
                    <div className="relative transition-opacity duration-700">
                      {currentCard === 'card' ? (
                        // Financial Card
                        <div className="animate-fade-in">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white mb-4">
                            <div className="flex justify-between items-center mb-4">
                              <Wallet className="h-8 w-8" />
                              <span className="text-sm opacity-90">Account Summary</span>
                            </div>
                            <p className="text-3xl font-bold">â‚¦2,450,000</p>
                            <p className="text-sm opacity-90 mt-1">Total Contributions</p>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-blue-800/50 rounded-xl">
                              <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5 text-green-400" />
                                <span className="text-sm text-blue-300">Recent Payment</span>
                              </div>
                              <span className="font-semibold text-white">â‚¦25,000</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-800/50 rounded-xl">
                              <div className="flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-blue-400" />
                                <span className="text-sm text-blue-300">Active Members</span>
                              </div>
                              <span className="font-semibold text-white">342</span>
                            </div>
                          </div>
                        </div>
                      ) : currentCard === 'image1' ? (
                        // Image Card 1 - Dashboard
                        <div className="animate-fade-in relative">
                          <img
                            src="/Admin Dashboard.png"
                            alt="Financial Dashboard"
                            className="w-full h-[280px] object-cover rounded-2xl"
                          />
                          <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-xl p-3">
                            <p className="text-white text-sm font-medium">Real-time Dashboard</p>
                            <p className="text-blue-300 text-xs">Track all your finances in one place</p>
                          </div>
                        </div>
                      ) : currentCard === 'image2' ? (
                        // Image Card 2 - Mobile App
                        <div className="animate-fade-in relative">
                          <img
                            src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                            alt="Mobile App"
                            className="w-full h-[280px] object-cover rounded-2xl"
                          />
                          <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-xl p-3">
                            <p className="text-white text-sm font-medium">Mobile Access</p>
                            <p className="text-blue-300 text-xs">Manage finances on the go</p>
                          </div>
                        </div>
                      ) : (
                        // Image Card 3 - Team/Community
                        <div className="animate-fade-in relative">
                          <img
                            src="/meeting.jpeg"
                            alt="Community Management"
                            className="w-full h-[280px] object-cover rounded-2xl"
                          />
                          <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-xl p-3">
                            <p className="text-white text-sm font-medium">Community Management</p>
                            <p className="text-blue-300 text-xs">Manage members and roles effortlessly</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Carousel Indicators */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {['card', 'image1', 'image2', 'image3'].map((item, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentCard(item)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${currentCard === item
                            ? 'w-6 bg-blue-500'
                            : 'bg-white/30 hover:bg-white/50'
                            }`}
                          aria-label={`Slide ${index + 1}`}
                        />
                      ))}
                    </div>

                    {/* Navigation Arrows */}
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-all z-10"
                    >
                      <ChevronRight className="h-4 w-4 rotate-180" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-all z-10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Animation Styles */}
          <style jsx>{`
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fade-in {
      animation: fade-in 0.5s ease-out forwards;
    }
  `}</style>
        </section >
        {/* Stats Section */}
        < section className={`${isMobile ? 'py-10' : 'py-16'} bg-blue-600`
        }>
          <div className="max-w-7xl mx-auto px-4">
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-6'}`}>
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`text-center ${isMobile ? 'p-3' : 'p-6'} bg-gradient-to-br from-gray-100 to-gray-300 rounded-2xl border border-gray-100 animate-on-scroll hover:border-blue-500/50 transition-all`}
                  id={`stat-${index}`}
                >
                  <div className={`inline-flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-12 h-12'} bg-blue-500/10 rounded-xl mb-2 text-blue-800 mx-auto`}>
                    {stat.icon}
                  </div>
                  <div className={`${isMobile ? 'text-base' : 'text-2xl'} font-bold text-blue-800`}>{stat.value}</div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-800 mt-0.5`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section >

        {/* APK Download Section - After Stats Section */}
        < section className={`${isMobile ? 'py-10' : 'py-16'} px-4 bg-gradient-to-b from-black to-blue-900 relative overflow-hidden`}>
          {/* Background Image with Dim Overlay */}
          < div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("/finlight_office2.png")',
            }}
          >

            {/* <img
              src="/icon-192x192.png"
              alt="Finlight Logo"
              className="w-full h-full object-contain rounded-xl z-10"
            /> */}


            {/* Dim overlay to maintain readability */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg, rgba(0, 49, 162, 0.85), rgba(0, 15, 231, 0.9))',
            }}></div>
          </div >

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 via-blue-600/20 to-blue-800/20 border border-gray-100/20 p-1">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(6,182,212,0.15),transparent_60%)]"></div>

              <div className={`relative ${isMobile ? 'p-6' : 'p-8 md:p-12'} flex flex-col md:flex-row items-center justify-between gap-6`}>
                {/* Left Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-blue-500/10 rounded-full px-3 py-1.5 mb-3 border border-blue-500/20">
                    <Smartphone className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-gray-300 font-medium">Android App</span>
                  </div>

                  <h3 className={`${isMobile ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold text-white mb-2`}>
                    Get the Finlight Mobile App
                  </h3>

                  <p className={`${isMobile ? 'text-sm' : 'text-base'} text-blue-400 max-w-md mx-auto md:mx-0`}>
                    Download the official Finlight Android app for seamless financial management on the go.
                  </p>

                  <div className={`${isMobile ? 'grid grid-cols-2 gap-2 mt-4' : 'flex flex-wrap gap-4 mt-4'} justify-center md:justify-start`}>
                    <div className="flex items-center gap-2 text-gray-100 text-xs md:text-sm">
                      <Check className="h-4 w-4 text-green-400" />
                      <span>Secure & Fast</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-100 text-xs md:text-sm">
                      <Check className="h-4 w-4 text-green-400" />
                      <span>Offline Access</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-100 text-xs md:text-sm">
                      <Check className="h-4 w-4 text-green-400" />
                      <span>Push Notifications</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-100 text-xs md:text-sm">
                      <Check className="h-4 w-4 text-green-400" />
                      <span>Bank-grade Security</span>
                    </div>
                  </div>
                </div>

                {/* Right - Download Button */}
                <div className="flex flex-col items-center gap-3">
                  {/* Main Download Button */}
                  <a
                    href={APK_DOWNLOAD_URL}
                    download="FinlightApp.apk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative ${isMobile ? 'w-full' : 'min-w-[220px]'} bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-1 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                    <div className={`relative flex items-center ${isMobile ? 'px-5 py-4' : 'px-6 py-4'} gap-3 bg-gradient-to-r from-blue-600/20 to-blue-600/20 rounded-2xl backdrop-blur-sm`}>
                      <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl border border-white/20">
                        <Smartphone className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} text-white`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-bold text-sm md:text-base">Download APK</div>
                        <div className="text-[10px] md:text-xs text-blue-200/80">Version 2.0.0 â€¢ 28 MB</div>
                      </div>
                      <Download className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-white/80 group-hover:text-white group-hover:scale-110 transition-all`} />
                    </div>
                  </a>

                  {/* Additional Info */}
                  <div className="flex items-center gap-2 text-xs text-blue-100">
                    <Smartphone className="h-3 w-3" />
                    <span>Requires Android 6.0 (API 23) or higher</span>
                  </div>

                  {/* Alternative download text */}
                  <button
                    onClick={() => {
                      alert('You can also download the APK directly from our website or contact support for assistance.');
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
                  >
                    Need help downloading?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section >

        {/* Features Section */}
        < section id="features" className={`${isMobile ? 'py-10' : 'py-20'} px-4`} style={{
          background: 'linear-gradient(135deg, rgba(0, 49, 162, 0.85), rgba(0, 15, 231, 0.9))',
        }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white mb-4`}>
                Everything you need to manage finances
              </h2>
              <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-blue-400 max-w-2xl mx-auto`}>
                Powerful features designed to simplify financial management for community organizations
              </p>
            </div>

            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-8'}`}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`group ${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border border-blue-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all animate-on-scroll`}
                  id={`feature-${index}`}
                >
                  <div className={`bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-white ${isMobile ? 'w-10 h-10 mb-3' : 'w-12 h-12 mb-4'}`}>
                    {feature.icon}
                  </div>
                  <h3 className={`${isMobile ? 'text-base' : 'text-xl'} font-semibold text-blue-900 mb-2`}>{feature.title}</h3>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-500 leading-relaxed`}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section >
        {/* How to Get Started Section */}
        < section className={`${isMobile ? 'py-10' : 'py-20'} px-4 bg-white`}>
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 mb-4 border border-blue-100">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Quick & Easy</span>
              </div>
              <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-blue-800 mb-4`}>
                How to Get Started
              </h2>
              <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-500 max-w-2xl mx-auto`}>
                Get your community organization up and running with Finlight in just a few simple steps
              </p>
            </div>

            {/* Content Grid */}
            <div className={`${isMobile ? 'flex flex-col' : 'grid md:grid-cols-2'} gap-12 items-center`}>
              {/* Left Side - Steps */}
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4 items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Create Your Account</h3>
                    <p className="text-sm text-gray-500">Sign up for free and set up your organization profile in minutes</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4 items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Add Members</h3>
                    <p className="text-sm text-gray-500">Invite your community members and assign roles and permissions</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4 items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Start Managing Finances</h3>
                    <p className="text-sm text-gray-500">Track payments, generate reports, and manage contributions seamlessly</p>
                  </div>
                </div>

                {/* CTA Button */}
                {/* <div className="pt-4">
                  <button
                    onClick={openFormModal}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 transition-all inline-flex items-center gap-2"
                  >
                    Get Started Now
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div> */}
              </div>

              {/* Right Side - Amoeba Image Frame with Wave Ripples */}
              <div className="relative flex items-center justify-center">
                {/* Animated Wave Ripples */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-[120%] h-[120%] rounded-full border-2 border-blue-200/30 animate-ping" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute w-[110%] h-[110%] rounded-full border-2 border-blue-300/20 animate-ping" style={{ animationDuration: '4s', animationDelay: '0.5s' }}></div>
                  <div className="absolute w-[100%] h-[100%] rounded-full border-2 border-blue-400/10 animate-ping" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
                </div>

                {/* Animated Wave Ripples - Additional decorative */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="absolute w-[140%] h-[140%] text-blue-200/5 animate-spin-slow" viewBox="0 0 200 200">
                    <path d="M100 10 C120 10, 140 30, 150 50 C160 70, 170 100, 160 130 C150 160, 120 180, 100 190 C80 180, 50 160, 40 130 C30 100, 40 70, 50 50 C60 30, 80 10, 100 10Z"
                      fill="currentColor" className="animate-pulse-soft" />
                  </svg>
                </div>

                {/* Amoeba Shape Frame */}
                <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
                  {/* Decorative floating blobs */}
                  <div className="absolute -top-8 -right-8 w-20 h-20 bg-blue-400/20 rounded-full blur-2xl animate-float"></div>
                  <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 -right-12 w-16 h-16 bg-blue-300/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>

                  {/* Amoeba Shape Container */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                    <defs>
                      <clipPath id="amoebaClip">
                        <path d="M200 20
                  C260 15, 320 50, 350 100
                  C380 150, 390 220, 360 270
                  C330 320, 280 370, 220 385
                  C160 400, 90 380, 50 340
                  C10 300, 0 230, 15 180
                  C30 130, 60 70, 120 40
                  C140 25, 170 22, 200 20Z" />
                      </clipPath>
                      {/* Wave pattern for background */}
                      <pattern id="wavePattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M0 30 Q15 15, 30 30 T60 30" stroke="rgba(37, 99, 235, 0.08)" strokeWidth="2" fill="none">
                          <animate attributeName="d"
                            values="M0 30 Q15 15, 30 30 T60 30;M0 30 Q15 45, 30 30 T60 30;M0 30 Q15 15, 30 30 T60 30"
                            dur="4s" repeatCount="indefinite" />
                        </path>
                      </pattern>
                    </defs>

                    {/* Amoeba Background with Gradient */}
                    <g clipPath="url(#amoebaClip)">
                      <rect width="400" height="400" fill="url(#wavePattern)" />
                      <rect width="400" height="400" fill="url(#amoebaGradient)" />

                      {/* Multiple wave layers inside amoeba */}
                      <path d="M0 200 Q100 150, 200 200 T400 200" stroke="rgba(37, 99, 235, 0.15)" strokeWidth="3" fill="none">
                        <animate attributeName="d"
                          values="M0 200 Q100 150, 200 200 T400 200;M0 200 Q100 250, 200 200 T400 200;M0 200 Q100 150, 200 200 T400 200"
                          dur="5s" repeatCount="indefinite" />
                      </path>
                      <path d="M0 250 Q100 200, 200 250 T400 250" stroke="rgba(37, 99, 235, 0.10)" strokeWidth="2" fill="none">
                        <animate attributeName="d"
                          values="M0 250 Q100 200, 200 250 T400 250;M0 250 Q100 300, 200 250 T400 250;M0 250 Q100 200, 200 250 T400 250"
                          dur="6s" repeatCount="indefinite" />
                      </path>
                      <path d="M0 150 Q100 100, 200 150 T400 150" stroke="rgba(37, 99, 235, 0.08)" strokeWidth="2" fill="none">
                        <animate attributeName="d"
                          values="M0 150 Q100 100, 200 150 T400 150;M0 150 Q100 200, 200 150 T400 150;M0 150 Q100 100, 200 150 T400 150"
                          dur="7s" repeatCount="indefinite" />
                      </path>
                    </g>

                    {/* Image inside Amoeba */}
                    <image
                      href="/tool8.png"
                      clipPath="url(#amoebaClip)"
                      x="0" y="0"
                      width="400" height="400"
                      preserveAspectRatio="xMidYMid slice"
                      className="opacity-90"
                    />
                    {/* <img
              src="/icon-192x192.png"
              alt="Finlight Logo"
              className="w-full h-full object-contain rounded-xl z-10"
            /> */}


                    {/* Gradient Overlay for depth */}
                    <g clipPath="url(#amoebaClip)">
                      <rect width="400" height="400" fill="url(#overlayGradient)" opacity="0.3" />
                    </g>
                  </svg>

                  {/* Defs for gradients */}
                  <svg className="absolute w-0 h-0">
                    <defs>
                      <linearGradient id="amoebaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E8F5FD" stopOpacity="0.6" />
                        <stop offset="50%" stopColor="#CDEBFA" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#9DD7F7" stopOpacity="0.1" />
                      </linearGradient>
                      <linearGradient id="overlayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0568D4" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#0152BF" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Decorative dots around amoeba */}
                  <div className="absolute -top-4 left-1/4 w-3 h-3 bg-blue-400 rounded-full animate-pulse-soft"></div>
                  <div className="absolute -bottom-2 right-1/4 w-2 h-2 bg-blue-600 rounded-full animate-pulse-soft" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute top-1/2 -left-6 w-2.5 h-2.5 bg-blue-300 rounded-full animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/3 -right-4 w-3 h-3 bg-blue-500 rounded-full animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Animation Styles */}
          <style>{`
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(5deg); }
    }
    @keyframes pulse-soft {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    .animate-pulse-soft {
      animation: pulse-soft 2s ease-in-out infinite;
    }
    .animate-spin-slow {
      animation: spin-slow 20s linear infinite;
    }
  `}</style>
        </section >
        {/* Testimonials Section */}
        < section id="testimonials" className={`${isMobile ? 'py-10' : 'py-20'} px-4 bg-gradient-to-b from-blue-900 to-black relative overflow-hidden`}>

          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("/finlight_office.png")',
            }}
          >



            {/* Dim overlay to maintain readability */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg, rgba(1, 3, 154, 0.85), rgba(2, 70, 241, 0.9))',
            }}></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white mb-4`}>
                What our members say
              </h2>
              <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-blue-400 max-w-2xl mx-auto`}>
                Join thousands of satisfied users who trust Finlight for their financial management
              </p>
            </div>

            <div className={`grid ${isMobile ? 'space-y-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-8'}`}>
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br from-gray-100 to-blue-300 rounded-2xl ${isMobile ? 'p-4' : 'p-6'} border border-blue-800 hover:border-blue-500/50 transition-all animate-on-scroll`}
                  id={`testimonial-${index}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full`}
                    />
                    <div>
                      <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-blue-800`}>{testimonial.name}</h4>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-500`}>{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} fill-yellow-400 text-yellow-400`} />
                    ))}
                  </div>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-blue-900 leading-relaxed`}>"{testimonial.content}"</p>
                </div>
              ))}
            </div>
          </div>
        </section >

        {/* CTA Section */}
        < section className={`${isMobile ? 'py-10' : 'py-20'} px-4 bg-gradient-to-b from-black to-blue-900`} style={{
          background: 'linear-gradient(135deg, rgba(0, 49, 162, 0.85), rgba(0, 15, 231, 0.9))',
        }}>


          <div className="max-w-5xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-6 md:p-12 text-white">
              <h2 className={`${isMobile ? 'text-xl' : 'text-3xl md:text-4xl'} font-bold mb-3`}>
                Ready to transform your financial management?
              </h2>
              <p className={`${isMobile ? 'text-xs mb-4' : 'text-lg mb-8'} text-blue-100 max-w-2xl mx-auto`}>
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
        </section >

        {/* Integration with Payment Giants Section */}
        < section className={`${isMobile ? 'py-10' : 'py-16'} px-4 bg-gradient-to-b from-blue-900 to-blue overflow-hidden`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 rounded-full px-4 py-2 mb-4 border border-blue-500/20">
                <Zap className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-400 font-medium">Trusted Payment Partners</span>
              </div>
              <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold text-white mb-3`}>
                Integration with Payment Giants
              </h2>
              <p className={`${isMobile ? 'text-sm' : 'text-base'} text-blue-400 max-w-2xl mx-auto`}>
                Seamlessly connect with Africa's leading payment platforms for smooth transactions
              </p>
            </div>

            {/* Animated Carousel / Slider */}
            <div className="relative py-8">
              {/* Gradient Overlays for fade effect */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-blue-900 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-blue-900 to-transparent z-10 pointer-events-none"></div>

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



            {/* Important Notice */}
            <div className="mt-12 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-amber-400 font-semibold text-sm">Important Notice</span>
              </div>
              <p className="text-blue-400 text-xs md:text-sm max-w-2xl mx-auto">
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
        </section >
        {/* FAQ Section */}
        < section id="faq" className={`${isMobile ? 'py-10' : 'py-20'} px-4 bg-gradient-to-b from-black to-blue-900`} style={{
          background: 'linear-gradient(135deg, rgba(0, 49, 162, 0.85), rgba(0, 15, 231, 0.9))',
        }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 rounded-full px-4 py-2 mb-4 border border-blue-500/20">
                <Shield className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-400 font-medium">Got Questions?</span>
              </div>
              <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-white mb-4`}>
                Frequently Asked Questions
              </h2>
              <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-blue-400 max-w-2xl mx-auto`}>
                Everything you need to know about Finlight and how it works
              </p>
            </div>

            <div className="space-y-4">
              {/* FAQ Item 1 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                  onClick={() => {
                    const content = document.getElementById('faq-content-1');
                    const icon = document.getElementById('faq-icon-1');
                    if (content) {
                      content.classList.toggle('hidden');
                      if (icon) {
                        icon.classList.toggle('rotate-180');
                      }
                    }
                  }}
                >
                  <span className="text-white font-medium">What is Finlight?</span>
                  <ChevronRight
                    id="faq-icon-1"
                    className="h-5 w-5 text-blue-400 transition-transform duration-300"
                  />
                </button>
                <div id="faq-content-1" className="hidden px-6 pb-4">
                  <p className="text-blue-300 text-sm leading-relaxed">
                    Finlight is a comprehensive financial management platform designed specifically for community organizations,
                    clubs, alumni associations, age grades, cooperatives, and student groups. It helps you track payments,
                    manage members, and generate reports with ease.
                  </p>
                </div>
              </div>

              {/* FAQ Item 2 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                  onClick={() => {
                    const content = document.getElementById('faq-content-2');
                    const icon = document.getElementById('faq-icon-2');
                    if (content) {
                      content.classList.toggle('hidden');
                      if (icon) {
                        icon.classList.toggle('rotate-180');
                      }
                    }
                  }}
                >
                  <span className="text-white font-medium">How does Finlight handle payments?</span>
                  <ChevronRight
                    id="faq-icon-2"
                    className="h-5 w-5 text-blue-400 transition-transform duration-300"
                  />
                </button>
                <div id="faq-content-2" className="hidden px-6 pb-4">
                  <p className="text-blue-300 text-sm leading-relaxed">
                    Finlight integrates with leading payment platforms like Paystack, Moniepoint, and Flutterwave to process
                    payments securely. All transactions are encrypted and protected with bank-grade security measures.
                  </p>
                </div>
              </div>

              {/* FAQ Item 3 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                  onClick={() => {
                    const content = document.getElementById('faq-content-3');
                    const icon = document.getElementById('faq-icon-3');
                    if (content) {
                      content.classList.toggle('hidden');
                      if (icon) {
                        icon.classList.toggle('rotate-180');
                      }
                    }
                  }}
                >
                  <span className="text-white font-medium">Is Finlight secure?</span>
                  <ChevronRight
                    id="faq-icon-3"
                    className="h-5 w-5 text-blue-400 transition-transform duration-300"
                  />
                </button>
                <div id="faq-content-3" className="hidden px-6 pb-4">
                  <p className="text-blue-300 text-sm leading-relaxed">
                    Yes! Finlight uses 256-bit SSL encryption, is PCI DSS compliant, and follows industry best practices
                    for data security. Your financial data is always protected.
                  </p>
                </div>
              </div>

              {/* FAQ Item 4 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                  onClick={() => {
                    const content = document.getElementById('faq-content-4');
                    const icon = document.getElementById('faq-icon-4');
                    if (content) {
                      content.classList.toggle('hidden');
                      if (icon) {
                        icon.classList.toggle('rotate-180');
                      }
                    }
                  }}
                >
                  <span className="text-white font-medium">Can I use Finlight on mobile?</span>
                  <ChevronRight
                    id="faq-icon-4"
                    className="h-5 w-5 text-blue-400 transition-transform duration-300"
                  />
                </button>
                <div id="faq-content-4" className="hidden px-6 pb-4">
                  <p className="text-blue-300 text-sm leading-relaxed">
                    Absolutely! Finlight is fully responsive and works on all devices. We also have a dedicated Android app
                    available for download, with iOS coming soon.
                  </p>
                </div>
              </div>

              {/* FAQ Item 5 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                  onClick={() => {
                    const content = document.getElementById('faq-content-5');
                    const icon = document.getElementById('faq-icon-5');
                    if (content) {
                      content.classList.toggle('hidden');
                      if (icon) {
                        icon.classList.toggle('rotate-180');
                      }
                    }
                  }}
                >
                  <span className="text-white font-medium">What plans do you offer?</span>
                  <ChevronRight
                    id="faq-icon-5"
                    className="h-5 w-5 text-blue-400 transition-transform duration-300"
                  />
                </button>
                <div id="faq-content-5" className="hidden px-6 pb-4">
                  <p className="text-blue-300 text-sm leading-relaxed">
                    We offer flexible plans to suit organizations of all sizes: Starter (FREE) for up to 30 members,
                    Growth (â‚¦30,000 one-time + â‚¦12,000/year) for up to 120 members, Business (â‚¦95,000 one-time + â‚¦20,000/year)
                    for up to 300 members, and Custom plans for organizations with unlimited members.
                  </p>
                </div>
              </div>

              {/* FAQ Item 6 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                  onClick={() => {
                    const content = document.getElementById('faq-content-6');
                    const icon = document.getElementById('faq-icon-6');
                    if (content) {
                      content.classList.toggle('hidden');
                      if (icon) {
                        icon.classList.toggle('rotate-180');
                      }
                    }
                  }}
                >
                  <span className="text-white font-medium">How do I get started?</span>
                  <ChevronRight
                    id="faq-icon-6"
                    className="h-5 w-5 text-blue-400 transition-transform duration-300"
                  />
                </button>
                <div id="faq-content-6" className="hidden px-6 pb-4">
                  <p className="text-blue-300 text-sm leading-relaxed">
                    Getting started is easy! Simply click the "Get Started" button, fill out the registration form,
                    and our team will reach out via WhatsApp to help you set up your organization's account.
                  </p>
                </div>
              </div>

              {/* FAQ Item 7 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
                  onClick={() => {
                    const content = document.getElementById('faq-content-7');
                    const icon = document.getElementById('faq-icon-7');
                    if (content) {
                      content.classList.toggle('hidden');
                      if (icon) {
                        icon.classList.toggle('rotate-180');
                      }
                    }
                  }}
                >
                  <span className="text-white font-medium">Is Finlight a bank?</span>
                  <ChevronRight
                    id="faq-icon-7"
                    className="h-5 w-5 text-blue-400 transition-transform duration-300"
                  />
                </button>
                <div id="faq-content-7" className="hidden px-6 pb-4">
                  <p className="text-blue-300 text-sm leading-relaxed">
                    No, Finlight is not a bank. We are a financial management platform that partners with registered
                    financial institutions to process payments. All funds are handled by our trusted payment partners.
                  </p>
                </div>
              </div>
            </div>

            {/* Still Have Questions CTA */}
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-6 border border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-2">Still have questions?</h3>
                <p className="text-sm text-blue-400 mb-4">We're here to help you get started</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={openFormModal}
                    className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Contact Support
                  </button>
                  <button
                    onClick={() => window.open("https://wa.me/2347062780839?text=I%20have%20a%20question%20about%20Finlight", "_blank")}
                    className="px-5 py-2 border border-blue-700 text-blue-300 rounded-xl text-sm font-medium hover:border-blue-500 hover:text-blue-400 transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Chat on WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section >

        {/* Footer */}
        < footer id="contact" className="bg-black text-white py-12 border-t border-blue-800" >
          <div className="max-w-7xl mx-auto px-4">
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'md:grid-cols-4 gap-8'}`}>
              <div className="text-center md:text-left">
                <div className={`flex items-center ${isMobile ? 'justify-center' : ''} gap-2 mb-4`}>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    {/* <span className="font-bold text-lg">F</span> */}

                    <div className="absolute top-2 left-3 w-5 h-2.5 bg-white/35 rounded-lg rotate-[-20deg] z-10" />
                    <img
                      src="/icon-192x192.png"
                      alt="Finlight Logo"
                      className="w-full h-full object-contain rounded-xl z-10"
                    />
                  </div>
                  <span className="font-bold text-xl">Finlight</span>
                </div>
                <p className="text-blue-400 text-sm text-center md:text-left">
                  Modern financial management for age grades and community organizations.
                </p>
              </div>

              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-4 text-blue-300">Quick Links</h4>
                <ul className="space-y-2 text-blue-400 text-sm">
                  <li><a href="#home" className="hover:text-blue-400 transition-colors">Home</a></li>
                  <li><a href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                  <li><a href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="/terms" className="hover:text-blue-400 transition-colors">Terms & Conditions</a></li>
                  <li><a href="/delete-account" className="hover:text-blue-400 transition-colors">Delete Account</a></li>
                  <li><a href="/refund" className="hover:text-blue-400 transition-colors">Refund Policy</a></li>
                  <li><a href="#testimonials" className="hover:text-blue-400 transition-colors">Testimonials</a></li>
                  <li><button onClick={openFormModal} className="hover:text-blue-400 transition-colors">Get Started</button></li>
                </ul>
              </div>

              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-4 text-blue-300">Contact</h4>
                <ul className="space-y-2 text-blue-400 text-sm">
                  <li className={`flex items-center ${isMobile ? 'justify-center' : ''} gap-2`}>
                    <Mail className="h-4 w-4" />
                    <span>Zephcoredigital@Zephcoredigital.ng</span>
                  </li>
                  <li className={`flex items-center ${isMobile ? 'justify-center' : ''} gap-2`}>
                    <Phone className="h-4 w-4" />
                    <span>+234 706 278 0839</span>
                  </li>
                  <li className={`flex items-center ${isMobile ? 'justify-center' : ''} gap-2`}>
                    <MapPin className="h-4 w-4" />
                    <span>Imo, Nigeria</span>
                  </li>
                </ul>
              </div>

              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-4 text-blue-300">Security</h4>
                <ul className="space-y-2 text-blue-400 text-sm">
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

            <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-500 text-sm">
              <p>&copy; 2026 Finlight. All rights reserved.</p>
              <p>Powered by Zephcore Digital Enterprise.</p>
            </div>
          </div>
        </footer >

        {/* Form Modal Overlay */}
        {
          isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={closeFormModal}
              />

              {/* Modal Content */}
              <div className="relative bg-gradient-to-br from-blue-900 to-black rounded-2xl border border-blue-700 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto modal-scroll">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-br from-blue-900 to-black border-b border-blue-800 p-5 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white">Get Started with Finlight</h3>
                    <p className="text-xs text-blue-400 mt-1">Fill out the form to begin your journey</p>
                  </div>
                  <button
                    onClick={closeFormModal}
                    className="p-1 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    <XCircle className="h-6 w-6 text-blue-400 hover:text-blue-200" />
                  </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
                  {/* Organization Name */}
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-1">
                      Organization Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      placeholder="e.g., City Welfare Association"
                      className="w-full px-4 py-2.5 bg-blue-800 border border-blue-700 rounded-xl text-white placeholder-blue-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  {/* User Name */}
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-1">
                      Your Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      placeholder="e.g., John Agim"
                      className="w-full px-4 py-2.5 bg-blue-800 border border-blue-700 rounded-xl text-white placeholder-blue-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  {/* Plan Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-1">
                      Select Plan <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="selectedPlan"
                      value={formData.selectedPlan}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-blue-800 border border-blue-700 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    >
                      <option value="">Choose a plan</option>
                      <option value="Starter (FREE)">Starter (FREE) - Up to 30 members</option>
                      <option value="Growth (â‚¦30,000 one-time + â‚¦12,000/year)">Growth (â‚¦30,000 one-time + â‚¦12,000/year) - Up to 120 members</option>
                      <option value="Business (â‚¦95,000 one-time + â‚¦20,000/year)">Business (â‚¦95,000 one-time + â‚¦20,000/year) - Up to 300 members</option>
                      <option value="Custom (Quote based)">Custom (Quote based) - Unlimited members</option>
                    </select>
                  </div>

                  {/* WhatsApp Number */}
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-1">
                      WhatsApp Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., 2348123456789"
                      className="w-full px-4 py-2.5 bg-blue-800 border border-blue-700 rounded-xl text-white placeholder-blue-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                    <p className="text-xs text-blue-500 mt-1">Include country code (e.g., 234 for Nigeria)</p>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-1">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 bg-blue-800 border border-blue-700 rounded-xl text-white placeholder-blue-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  {/* Status Message */}
                  {submitStatus.message && (
                    <div className={`p-3 rounded-xl text-sm ${submitStatus.type === 'success'
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
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

                  <p className="text-xs text-center text-blue-500 pt-2">
                    By submitting, you agree to our terms and privacy policy. You'll be redirected to WhatsApp to complete your registration.
                  </p>
                </form>
              </div>
            </div>
          )
        }

        {/* Floating Download Button */}
        <FloatingDownloadButton />
      </div >
    </>
  );
};

export default LandingPage;