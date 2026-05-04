import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Shield, 
  Lock, 
  CheckCircle,
  FileText,
  Clock,
  Users,
  Eye,
  Trash2,
  Share2,
  Cookie,
  Bell,
  Database,
  Server,
  Globe,
  Mail,
  Phone,
  MapPin,
  Printer,
  Home,
  ChevronRight,
  AlertCircle,
  Download,
  Fingerprint,
  ShieldCheck,
  Settings
} from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lastUpdated] = useState("January 15, 2025");
  const [effectiveDate] = useState("January 1, 2025");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sections = [
    { id: 'information-collect', title: 'Information We Collect', icon: <Database className="h-4 w-4" /> },
    { id: 'how-we-use', title: 'How We Use Your Information', icon: <Settings className="h-4 w-4" /> },
    { id: 'sharing', title: 'Information Sharing', icon: <Share2 className="h-4 w-4" /> },
    { id: 'data-security', title: 'Data Security', icon: <Shield className="h-4 w-4" /> },
    { id: 'cookies', title: 'Cookies & Tracking', icon: <Cookie className="h-4 w-4" /> },
    { id: 'user-rights', title: 'Your Rights', icon: <Users className="h-4 w-4" /> },
    { id: 'data-retention', title: 'Data Retention', icon: <Trash2 className="h-4 w-4" /> },
    { id: 'children', title: 'Children\'s Privacy', icon: <Eye className="h-4 w-4" /> },
    { id: 'international', title: 'International Transfers', icon: <Globe className="h-4 w-4" /> },
    { id: 'updates', title: 'Policy Updates', icon: <Bell className="h-4 w-4" /> }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Finlight
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => navigate('/')} className="text-gray-300 hover:text-cyan-400 transition-colors flex items-center gap-1">
                <Home className="h-4 w-4" />
                Home
              </button>
              <button onClick={() => navigate('/terms')} className="text-gray-300 hover:text-cyan-400 transition-colors flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Terms
              </button>
              <button onClick={handlePrint} className="text-gray-300 hover:text-cyan-400 transition-colors flex items-center gap-1">
                <Printer className="h-4 w-4" />
                Print
              </button>
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
            >
              Back to Home
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 rounded-full px-4 py-2 mb-4 border border-cyan-500/20">
              <Lock className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-cyan-400 font-medium">Privacy & Security</span>
            </div>
            <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-white mb-4`}>
              Privacy Policy
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Your privacy is critically important to us. Learn how we collect, use, and protect your personal information.
            </p>
            <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Last Updated: {lastUpdated}</span>
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Effective: {effectiveDate}</span>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800 p-3 text-center">
              <ShieldCheck className="h-6 w-6 text-cyan-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">256-bit SSL Encryption</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800 p-3 text-center">
              <Fingerprint className="h-6 w-6 text-cyan-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">GDPR Compliant</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800 p-3 text-center">
              <Server className="h-6 w-6 text-cyan-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Secure Data Centers</p>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800 p-3 text-center">
              <Lock className="h-6 w-6 text-cyan-400 mx-auto mb-1" />
              <p className="text-xs text-gray-400">PCI DSS Compliant</p>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 p-4 mb-8">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-cyan-400" />
              Quick Navigation
            </h3>
            <div className="flex flex-wrap gap-2">
              {sections.map((section, idx) => (
                <a
                  key={idx}
                  href={`#${section.id}`}
                  className="text-xs px-3 py-1.5 bg-gray-800/50 rounded-full text-gray-400 hover:text-cyan-400 hover:bg-gray-800 transition-colors flex items-center gap-1"
                >
                  {section.icon}
                  <span className="hidden sm:inline">{section.title}</span>
                  <span className="sm:hidden">{section.title.split(' ').slice(0,2).join(' ')}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Privacy Policy Content */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 p-6 md:p-8">
            {/* Introduction */}
            <div className="mb-8 pb-6 border-b border-gray-800">
              <p className="text-gray-400 leading-relaxed mb-4">
                At Finlight ("we," "our," or "us"), we are committed to protecting your privacy and the security 
                of your personal information. This Privacy Policy explains how we collect, use, disclose, and 
                safeguard your information when you use our financial management platform.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Please read this Privacy Policy carefully. By accessing or using our Service, you acknowledge 
                that you have read, understood, and agree to be bound by all the terms of this Privacy Policy. 
                If you do not agree with these terms, please do not access or use our Service.
              </p>
            </div>

            {/* Section 1 - Information We Collect */}
            <div id="information-collect" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Database className="h-5 w-5 text-cyan-400" />
                1. Information We Collect
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                We collect several types of information from and about users of our platform:
              </p>
              
              <div className="space-y-4 mt-4">
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h3 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Personal Information You Provide
                  </h3>
                  <ul className="space-y-1 text-gray-400 text-sm pl-5 list-disc">
                    <li>Name, email address, phone number, and WhatsApp number</li>
                    <li>Organization name and details</li>
                    <li>Billing information and payment method details</li>
                    <li>Account credentials and profile information</li>
                    <li>Communications and support requests</li>
                    <li>Member lists and contribution records</li>
                  </ul>
                </div>

                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h3 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Automatically Collected Information
                  </h3>
                  <ul className="space-y-1 text-gray-400 text-sm pl-5 list-disc">
                    <li>Device information (IP address, browser type, operating system)</li>
                    <li>Usage data (pages visited, features used, time spent)</li>
                    <li>Location information (approximate based on IP address)</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>

                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h3 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Information from Third Parties
                  </h3>
                  <ul className="space-y-1 text-gray-400 text-sm pl-5 list-disc">
                    <li>Payment processor transaction data</li>
                    <li>Bank account verification information</li>
                    <li>Identity verification services (when required)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 2 - How We Use Your Information */}
            <div id="how-we-use" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Settings className="h-5 w-5 text-cyan-400" />
                2. How We Use Your Information
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="space-y-2 text-gray-400 leading-relaxed pl-5 list-disc">
                <li>Providing, operating, and maintaining our platform</li>
                <li>Processing transactions and managing member contributions</li>
                <li>Sending payment reminders, notifications, and updates</li>
                <li>Generating financial reports and analytics</li>
                <li>Improving, personalizing, and expanding our services</li>
                <li>Communicating with you about your account or support requests</li>
                <li>Detecting, preventing, and addressing technical or security issues</li>
                <li>Complying with legal obligations and regulatory requirements</li>
              </ul>
            </div>

            {/* Section 3 - Information Sharing */}
            <div id="sharing" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Share2 className="h-5 w-5 text-cyan-400" />
                3. Information Sharing & Disclosure
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                We do not sell, trade, or rent your personal information to third parties. However, we may share 
                your information in the following circumstances:
              </p>
              <ul className="space-y-2 text-gray-400 leading-relaxed pl-5 list-disc">
                <li><strong className="text-cyan-400">Service Providers:</strong> With third-party vendors who assist us in operating our platform (payment processors, hosting services, analytics providers)</li>
                <li><strong className="text-cyan-400">Legal Requirements:</strong> When required by law, court order, or governmental regulation</li>
                <li><strong className="text-cyan-400">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong className="text-cyan-400">With Your Consent:</strong> When you have given us explicit permission to share your information</li>
              </ul>
              <div className="mt-3 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                <p className="text-xs text-cyan-400 flex items-start gap-2">
                  <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>We require all third-party service providers to maintain appropriate security measures and use your information only for the purposes for which it was shared.</span>
                </p>
              </div>
            </div>

            {/* Section 4 - Data Security */}
            <div id="data-security" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-400" />
                4. Data Security
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                We implement robust security measures to protect your information:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-gray-800/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Encryption</span>
                  </div>
                  <p className="text-xs text-gray-500">256-bit SSL encryption for all data in transit and at rest</p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Server className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Access Controls</span>
                  </div>
                  <p className="text-xs text-gray-500">Strict role-based access and multi-factor authentication</p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Backups</span>
                  </div>
                  <p className="text-xs text-gray-500">Regular automated backups stored in secure locations</p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Monitoring</span>
                  </div>
                  <p className="text-xs text-gray-500">24/7 security monitoring and regular audits</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mt-3 text-sm">
                While we strive to protect your information, no method of transmission over the internet is 100% secure. 
                We cannot guarantee absolute security, and you use our service at your own risk.
              </p>
            </div>

            {/* Section 5 - Cookies & Tracking */}
            <div id="cookies" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Cookie className="h-5 w-5 text-cyan-400" />
                5. Cookies & Tracking Technologies
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="space-y-2 text-gray-400 leading-relaxed pl-5 list-disc">
                <li>Remember your preferences and login information</li>
                <li>Analyze how you use our platform to improve user experience</li>
                <li>Provide personalized content and features</li>
                <li>Monitor and prevent fraudulent activity</li>
              </ul>
              <p className="text-gray-400 leading-relaxed mt-3">
                You can control cookie settings through your browser preferences. However, disabling cookies may 
                affect the functionality of certain features on our platform.
              </p>
            </div>

            {/* Section 6 - Your Rights */}
            <div id="user-rights" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-400" />
                6. Your Privacy Rights
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="space-y-2 text-gray-400 leading-relaxed pl-5 list-disc">
                <li><strong className="text-cyan-400">Access:</strong> Request a copy of your personal information</li>
                <li><strong className="text-cyan-400">Correction:</strong> Request correction of inaccurate information</li>
                <li><strong className="text-cyan-400">Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
                <li><strong className="text-cyan-400">Portability:</strong> Request transfer of your data to another service</li>
                <li><strong className="text-cyan-400">Opt-out:</strong> Opt-out of marketing communications</li>
                <li><strong className="text-cyan-400">Restriction:</strong> Request restriction of data processing</li>
              </ul>
              <div className="mt-4 p-3 bg-gray-800/30 rounded-xl">
                <p className="text-sm text-gray-400">
                  To exercise any of these rights, please contact us at <span className="text-cyan-400">privacy@finlight.com</span>. 
                  We will respond to your request within 30 days.
                </p>
              </div>
            </div>

            {/* Section 7 - Data Retention */}
            <div id="data-retention" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-cyan-400" />
                7. Data Retention
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                We retain your personal information for as long as your account is active or as needed to provide 
                you with our services. We may also retain and use your information as necessary to:
              </p>
              <ul className="space-y-2 text-gray-400 leading-relaxed pl-5 list-disc">
                <li>Comply with legal obligations and regulatory requirements</li>
                <li>Resolve disputes and enforce our agreements</li>
                <li>Prevent fraud and abuse</li>
                <li>Maintain security and operational integrity</li>
              </ul>
              <p className="text-gray-400 leading-relaxed mt-3">
                Upon account termination, your data will be deleted within 90 days, subject to any legal retention 
                obligations. You may request data export within 30 days of account closure.
              </p>
            </div>

            {/* Section 8 - Children's Privacy */}
            <div id="children" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Eye className="h-5 w-5 text-cyan-400" />
                8. Children's Privacy
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Our Service is not intended for children under the age of 18. We do not knowingly collect personal 
                information from children under 18. If you believe a child has provided us with personal information, 
                please contact us immediately, and we will take steps to delete such information.
              </p>
            </div>

            {/* Section 9 - International Transfers */}
            <div id="international" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Globe className="h-5 w-5 text-cyan-400" />
                9. International Data Transfers
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Your information may be transferred to and maintained on servers located outside of your country 
                or jurisdiction. By using our Service, you consent to the transfer of your information to countries 
                with different data protection laws. We take appropriate safeguards to ensure your data is protected 
                in accordance with this Privacy Policy.
              </p>
            </div>

            {/* Section 10 - Policy Updates */}
            <div id="updates" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Bell className="h-5 w-5 text-cyan-400" />
                10. Updates to This Privacy Policy
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for 
                operational, legal, or regulatory reasons. We will notify you of any material changes by:
              </p>
              <ul className="space-y-2 text-gray-400 leading-relaxed pl-5 list-disc">
                <li>Posting the new Privacy Policy on this page</li>
                <li>Sending an email notification to registered users</li>
                <li>Displaying a prominent notice on our platform</li>
              </ul>
              <p className="text-gray-400 leading-relaxed mt-3">
                The "Last Updated" date at the top of this page indicates when changes were made. Your continued 
                use of the Service after any changes constitutes acceptance of the updated policy.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Mail className="h-5 w-5 text-cyan-400" />
                11. Contact Us
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="flex items-center gap-2 text-gray-300 mb-2">
                    <Mail className="h-4 w-4 text-cyan-400" />
                    <span className="font-medium">Email</span>
                  </p>
                  <p className="text-sm text-gray-400">privacy@finlight.com</p>
                  <p className="text-sm text-gray-400">support@finlight.com</p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="flex items-center gap-2 text-gray-300 mb-2">
                    <Phone className="h-4 w-4 text-cyan-400" />
                    <span className="font-medium">Phone</span>
                  </p>
                  <p className="text-sm text-gray-400">+234 706 278 0839</p>
                  <p className="text-sm text-gray-400">Mon-Fri, 9AM - 6PM WAT</p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4 md:col-span-2">
                  <p className="flex items-center gap-2 text-gray-300 mb-2">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    <span className="font-medium">Address</span>
                  </p>
                  <p className="text-sm text-gray-400">Imo State, Nigeria</p>
                  <p className="text-sm text-gray-400">Data Protection Officer: zephdmc@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
              <p className="text-xs text-gray-500">
                By using Finlight, you consent to the collection and use of your information as described in 
                this Privacy Policy.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-gray-600">
                <button onClick={() => navigate('/terms')} className="hover:text-cyan-400 transition-colors">
                  Terms & Conditions
                </button>
                <span>•</span>
                <button onClick={handlePrint} className="hover:text-cyan-400 transition-colors">
                  Print This Policy
                </button>
                <span>•</span>
                <button onClick={() => window.location.href = 'mailto:privacy@finlight.com'} className="hover:text-cyan-400 transition-colors">
                  Request Data Deletion
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-4">
                © {new Date().getFullYear()} Finlight. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;