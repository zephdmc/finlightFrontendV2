import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Shield, 
  CreditCard, 
  Users, 
  BarChart3, 
  Bell, 
  Smartphone, 
  Lock,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  Wallet,
  FileText,
  Star,
  Phone,
  Mail,
  MapPin,
  Download,
  Eye,
  Clock,
  DollarSign,
  UserCheck,
  Activity,
  Server,
  Cloud,
  Database,
  Headphones,
  BookOpen,
  Video,
  Award,
  Globe,
  Zap
} from 'lucide-react';

const LearnMore = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGetStarted = () => {
    navigate('/login');
  };

  const sections = [
    {
      id: 'overview',
      title: 'Platform Overview',
      icon: <Globe className="h-5 w-5" />
    },
    {
      id: 'features',
      title: 'Features',
      icon: <Zap className="h-5 w-5" />
    },
    {
      id: 'security',
      title: 'Security',
      icon: <Shield className="h-5 w-5" />
    },
    {
      id: 'pricing',
      title: 'Pricing',
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: <Headphones className="h-5 w-5" />
    }
  ];

  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Member Management',
      description: 'Easily add, edit, and manage member profiles with roles and permissions.',
      details: [
        'Bulk member import',
        'Role-based access control',
        'Member activity tracking',
        'Profile management'
      ]
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: 'Payment Processing',
      description: 'Secure payment collection with multiple payment methods and automated tracking.',
      details: [
        'Multiple payment gateways',
        'Recurring payments',
        'Payment reminders',
        'Transaction history'
      ]
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Financial Reporting',
      description: 'Comprehensive reports and analytics for complete financial transparency.',
      details: [
        'Income/Expense reports',
        'Member payment status',
        'Export to CSV/PDF',
        'Custom date ranges'
      ]
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: 'Real-time Notifications',
      description: 'Stay updated with instant alerts for payments, updates, and announcements.',
      details: [
        'Email notifications',
        'In-app alerts',
        'Payment confirmations',
        'Due date reminders'
      ]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Bank-grade Security',
      description: 'Enterprise-level security to protect your financial data and transactions.',
      details: [
        '256-bit SSL encryption',
        'Two-factor authentication',
        'Secure data storage',
        'Regular security audits'
      ]
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: 'Mobile Friendly',
      description: 'Access your account anywhere, anytime with our responsive mobile design.',
      details: [
        'Mobile-optimized interface',
        'Touch-friendly controls',
        'Offline access',
        'Push notifications'
      ]
    }
  ];

  const securityFeatures = [
    {
      title: 'Data Encryption',
      description: 'All sensitive data is encrypted using AES-256 encryption both at rest and in transit.',
      icon: <Lock className="h-6 w-6" />
    },
    {
      title: 'Secure Authentication',
      description: 'Multi-factor authentication and secure password policies protect user accounts.',
      icon: <UserCheck className="h-6 w-6" />
    },
    {
      title: 'PCI Compliance',
      description: 'Fully PCI DSS compliant payment processing with secure tokenization.',
      icon: <CreditCard className="h-6 w-6" />
    },
    {
      title: 'Regular Backups',
      description: 'Automated daily backups with point-in-time recovery capabilities.',
      icon: <Database className="h-6 w-6" />
    },
    {
      title: 'DDoS Protection',
      description: 'Enterprise-grade DDoS mitigation and web application firewall.',
      icon: <Shield className="h-6 w-6" />
    },
    {
      title: 'Audit Logs',
      description: 'Comprehensive audit trails of all user actions and system events.',
      icon: <Activity className="h-6 w-6" />
    }
  ];

  const pricingPlans = [
    {
      name: 'Basic',
      price: '0',
      period: 'forever',
      description: 'Perfect for small communities just getting started',
      features: [
        'Up to 50 members',
        'Basic payment tracking',
        'Email support',
        'Basic reports',
        'Mobile access'
      ],
      recommended: false,
      buttonText: 'Get Started',
      buttonClass: 'border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'
    },
    {
      name: 'Professional',
      price: '99',
      period: 'month',
      description: 'Ideal for growing organizations with advanced needs',
      features: [
        'Up to 500 members',
        'Advanced payment processing',
        'Priority support',
        'Advanced analytics',
        'API access',
        'Custom reports',
        'Bulk operations'
      ],
      recommended: true,
      buttonText: 'Start Free Trial',
      buttonClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For large organizations with complex requirements',
      features: [
        'Unlimited members',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
        'White-label options',
        'Training sessions',
        'Custom development'
      ],
      recommended: false,
      buttonText: 'Contact Sales',
      buttonClass: 'border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600'
    }
  ];

  const faqs = [
    {
      question: 'What is AGFMA?',
      answer: 'AGFMA (Age Grade Financial Management Application) is a comprehensive financial management platform designed specifically for age grades, community organizations, cooperatives, and student groups to track payments, manage members, and generate financial reports.'
    },
    {
      question: 'How secure is my data?',
      answer: 'We employ bank-grade security measures including 256-bit SSL encryption, secure data centers, regular security audits, and PCI DSS compliance. Your financial data is protected with the highest industry standards.'
    },
    {
      question: 'What payment methods are supported?',
      answer: 'We support multiple payment methods including credit/debit cards, bank transfers, mobile money, and USSD. Integration with Paystack provides secure and seamless payment processing.'
    },
    {
      question: 'Can I export my financial data?',
      answer: 'Yes! You can export all your financial data, member lists, and reports in multiple formats including CSV, Excel, and PDF for offline analysis and record keeping.'
    },
    {
      question: 'Is there a mobile app?',
      answer: 'While we don\'t have a dedicated mobile app yet, our platform is fully responsive and works perfectly on all mobile devices through your web browser, providing a native app-like experience.'
    },
    {
      question: 'How do I get support?',
      answer: 'We offer multiple support channels including email support, live chat, phone support for enterprise clients, and a comprehensive knowledge base with video tutorials and documentation.'
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Absolutely! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect immediately, and we prorate the charges accordingly.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, we offer a 14-day free trial on our Professional plan with no credit card required. You can explore all features before committing to a subscription.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AGFMA
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate('/')} className="text-gray-600 hover:text-blue-600 transition-colors">Home</button>
              <button onClick={() => navigate('/learn-more')} className="text-blue-600 font-medium">Learn More</button>
              <button onClick={() => navigate('/login')} className="text-gray-600 hover:text-blue-600 transition-colors">Login</button>
            </div>
            
            <button
              onClick={handleGetStarted}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Learn More About AGFMA
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Discover how our platform can transform your community's financial management
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              Explore Features
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={handleGetStarted}
              className="px-6 py-3 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="sticky top-16 bg-white border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-4 py-3 scrollbar-hide">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveTab(section.id);
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === section.id
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {section.icon}
                <span>{section.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <section id="overview" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Platform Overview
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              AGFMA is a comprehensive financial management solution designed specifically for community organizations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 mb-6">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">Our Vision</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Simplifying Financial Management for Communities
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                AGFMA was born from the need to provide age grades, cooperatives, and community organizations 
                with a modern, transparent, and efficient way to manage their finances. We understand the 
                challenges of manual record-keeping, delayed payments, and lack of financial transparency.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our platform automates the entire financial management process, from member registration 
                and payment collection to comprehensive reporting and analytics. We're committed to helping 
                communities thrive with better financial management.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-700">500+ Active Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-700">₦10M+ Processed</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Community-Focused</h4>
                    <p className="text-sm text-gray-600">Built specifically for age grades and community organizations</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Transparent Operations</h4>
                    <p className="text-sm text-gray-600">Complete visibility into all financial transactions</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Easy to Use</h4>
                    <p className="text-sm text-gray-600">Intuitive interface designed for all skill levels</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your community's finances effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-16 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 mb-4">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-medium">Enterprise Security</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Bank-Grade Security
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Your data and transactions are protected with the highest security standards
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex flex-wrap gap-8 justify-between items-center">
              <div className="flex items-center gap-3">
                <Server className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-900">99.9% Uptime SLA</p>
                  <p className="text-sm text-gray-500">Guaranteed availability</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Cloud className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-900">AWS Cloud Hosting</p>
                  <p className="text-sm text-gray-500">Enterprise infrastructure</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-900">Automated Backups</p>
                  <p className="text-sm text-gray-500">Daily data protection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose the plan that best fits your community's needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-8 transition-all ${
                  plan.recommended
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl scale-105'
                    : 'bg-white border border-gray-200 hover:shadow-lg'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.recommended ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${plan.recommended ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price === 'Custom' ? plan.price : `₦${plan.price}`}
                  </span>
                  {plan.price !== 'Custom' && (
                    <span className={`text-sm ${plan.recommended ? 'text-blue-200' : 'text-gray-500'}`}>
                      /{plan.period}
                    </span>
                  )}
                </div>
                <p className={`text-sm mb-6 ${plan.recommended ? 'text-blue-200' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 ${plan.recommended ? 'text-blue-300' : 'text-green-500'}`} />
                      <span className={plan.recommended ? 'text-blue-100' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleGetStarted}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.buttonClass}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Find answers to common questions about our platform
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white rounded-xl shadow-sm overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {faq.question}
                  </h3>
                  <ChevronRight className="h-5 w-5 text-gray-400 transform transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join hundreds of communities already using AGFMA to manage their finances
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <span className="font-bold text-lg">A</span>
                </div>
                <span className="font-bold text-xl">AGFMA</span>
              </div>
              <p className="text-gray-400 text-sm">
                Modern financial management for age grades and community organizations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => navigate('/learn-more')} className="hover:text-white transition-colors">Learn More</button></li>
                <li><button onClick={handleGetStarted} className="hover:text-white transition-colors">Get Started</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>support@agfma.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+234 123 456 7890</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Documentation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <span>Video Tutorials</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>Certification</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 AGFMA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LearnMore;