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
  CreditCard,
  AlertCircle,
  ExternalLink,
  Home,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Printer,
  Download
} from 'lucide-react';

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [lastUpdated] = useState("January 15, 2025");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sections = [
    { id: 'agreement', title: 'Agreement to Terms', icon: <FileText className="h-4 w-4" /> },
    { id: 'eligibility', title: 'Eligibility', icon: <Users className="h-4 w-4" /> },
    { id: 'services', title: 'Services Provided', icon: <Shield className="h-4 w-4" /> },
    { id: 'payments', title: 'Payments & Fees', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'user-responsibilities', title: 'User Responsibilities', icon: <CheckCircle className="h-4 w-4" /> },
    { id: 'privacy', title: 'Privacy & Data', icon: <Lock className="h-4 w-4" /> },
    { id: 'termination', title: 'Termination', icon: <Clock className="h-4 w-4" /> },
    { id: 'limitations', title: 'Limitations of Liability', icon: <AlertCircle className="h-4 w-4" /> }
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
              <FileText className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-cyan-400 font-medium">Legal Document</span>
            </div>
            <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-white mb-4`}>
              Terms and Conditions
            </h1>
            <p className="text-gray-400">
              Welcome to Finlight. By using our platform, you agree to these terms.
            </p>
            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Last Updated: {lastUpdated}</span>
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
                  <span>{section.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Terms Content */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 p-6 md:p-8">
            {/* Introduction */}
            <div className="mb-8 pb-6 border-b border-gray-800">
              <p className="text-gray-400 leading-relaxed mb-4">
                Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using 
                the Finlight platform (the "Service") operated by Finlight ("us", "we", or "our").
              </p>
              <p className="text-gray-400 leading-relaxed">
                Your access to and use of the Service is conditioned on your acceptance of and compliance with 
                these Terms. These Terms apply to all visitors, users, and others who access or use the Service. 
                By accessing or using the Service, you agree to be bound by these Terms.
              </p>
            </div>

            {/* Section 1 - Agreement to Terms */}
            <div id="agreement" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-400" />
                1. Agreement to Terms
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                By registering for, accessing, or using the Finlight platform, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part 
                of these terms, you must not use our Service.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Finlight reserves the right to modify or replace these Terms at any time. If a revision is material, 
                we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a 
                material change will be determined at our sole discretion.
              </p>
            </div>

            {/* Section 2 - Eligibility */}
            <div id="eligibility" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-400" />
                2. Eligibility
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                By using Finlight, you represent and warrant that:
              </p>
              <ul className="space-y-2 text-gray-400 leading-relaxed pl-5 list-disc">
                <li>You are at least 18 years of age or have legal parental/guardian consent</li>
                <li>You have the authority to bind your organization to these Terms</li>
                <li>Your organization is legally recognized in its jurisdiction</li>
                <li>All information you provide is accurate, current, and complete</li>
                <li>You will maintain the security of your account credentials</li>
                <li>You will promptly notify us of any unauthorized use of your account</li>
              </ul>
            </div>

            {/* Section 3 - Services Provided */}
            <div id="services" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-400" />
                3. Services Provided
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                Finlight provides a financial management platform that includes:
              </p>
              <ul className="space-y-2 text-gray-400 leading-relaxed pl-5 list-disc">
                <li>Member management and contribution tracking</li>
                <li>Dues collection and payment processing</li>
                <li>Financial reporting and analytics</li>
                <li>Automated notifications and reminders</li>
                <li>Data export and backup services</li>
                <li>Integration with third-party payment processors</li>
              </ul>
              <p className="text-gray-400 leading-relaxed mt-3">
                We reserve the right to modify, suspend, or discontinue any part of the Service at any time, 
                with or without notice. We shall not be liable to you or any third party for any modification, 
                suspension, or discontinuation of the Service.
              </p>
            </div>

            {/* Section 4 - Payments & Fees */}
            <div id="payments" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-cyan-400" />
                4. Payments & Fees
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                Finlight offers both free and paid subscription plans. By subscribing to a paid plan, you agree to:
              </p>
              <ul className="space-y-2 text-gray-400 leading-relaxed pl-5 list-disc">
                <li>Pay all applicable fees as described on our pricing page</li>
                <li>Provide accurate billing information</li>
                <li>Authorize us to charge your chosen payment method</li>
                <li>Pay any applicable taxes associated with your subscription</li>
              </ul>
              <p className="text-gray-400 leading-relaxed mt-3">
                <strong className="text-cyan-400">Refund Policy:</strong> All fees are non-refundable except as expressly 
                provided in these Terms or as required by applicable law. You may cancel your subscription at any time, 
                and cancellation will take effect at the end of your current billing period.
              </p>
              <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <p className="text-xs text-amber-400 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Important Notice: Finlight is not a bank. All financial transactions are processed through our registered partner institutions. Funds are held in accordance with our partners' terms and conditions.</span>
                </p>
              </div>
            </div>

            {/* Section 5 - User Responsibilities */}
            <div id="user-responsibilities" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-cyan-400" />
                5. User Responsibilities
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                As a user of Finlight, you agree to:
              </p>
              <ul className="space-y-2 text-gray-400 leading-relaxed pl-5 list-disc">
                <li>Use the Service only for lawful purposes and in compliance with these Terms</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Not interfere with or disrupt the Service or servers</li>
                <li>Not attempt to gain unauthorized access to any part of the Service</li>
                <li>Not use the Service to transmit any harmful or malicious code</li>
                <li>Not impersonate any person or entity or misrepresent your affiliation</li>
                <li>Comply with all applicable laws and regulations in your jurisdiction</li>
              </ul>
            </div>

            {/* Section 6 - Privacy & Data */}
            <div id="privacy" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Lock className="h-5 w-5 text-cyan-400" />
                6. Privacy & Data Protection
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                Your privacy is important to us. Our Privacy Policy, which is incorporated into these Terms, 
                explains how we collect, use, and protect your personal information. By using Finlight, you 
                consent to the collection and use of your information as described in our Privacy Policy.
              </p>
              <p className="text-gray-400 leading-relaxed">
                We employ industry-standard security measures to protect your data, including encryption, 
                firewalls, and secure data centers. However, no method of transmission over the internet is 
                100% secure, and we cannot guarantee absolute security.
              </p>
            </div>

            {/* Section 7 - Termination */}
            <div id="termination" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-400" />
                7. Termination
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                We may terminate or suspend your account immediately, without prior notice or liability, 
                for any reason whatsoever, including without limitation if you breach these Terms.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Upon termination, your right to use the Service will cease immediately. You may export your 
                data for 30 days following termination, after which your data may be permanently deleted. 
                All provisions of these Terms which by their nature should survive termination shall survive, 
                including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </div>

            {/* Section 8 - Limitations of Liability */}
            <div id="limitations" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-cyan-400" />
                8. Limitations of Liability
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                To the maximum extent permitted by applicable law, in no event shall Finlight, its directors, 
                employees, partners, or suppliers be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including without limitation:
              </p>
              <ul className="space-y-2 text-gray-400 leading-relaxed pl-5 list-disc">
                <li>Loss of profits, revenue, or anticipated savings</li>
                <li>Loss of data or business interruption</li>
                <li>Loss of goodwill or reputation</li>
                <li>Any other loss or damage of any kind</li>
              </ul>
              <p className="text-gray-400 leading-relaxed mt-3">
                Our total liability to you for all claims arising out of or relating to these Terms or the 
                Service shall not exceed the amount you have paid to us in the twelve months preceding the 
                event giving rise to the liability.
              </p>
            </div>

            {/* Additional Sections */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-cyan-400" />
                9. Third-Party Services
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Finlight integrates with third-party payment processors and services. We are not responsible 
                for the terms, practices, or performance of these third-party services. Your use of third-party 
                services is at your own risk and subject to their respective terms and conditions.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-400" />
                10. Governing Law
              </h2>
              <p className="text-gray-400 leading-relaxed">
                These Terms shall be governed and construed in accordance with the laws of the Federal Republic 
                of Nigeria, without regard to its conflict of law provisions. Any disputes arising under these 
                Terms shall be subject to the exclusive jurisdiction of the courts located in Lagos, Nigeria.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Mail className="h-5 w-5 text-cyan-400" />
                11. Contact Us
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="space-y-2 text-gray-400">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-cyan-400" />
                  <span>Email: legal@finlight.com</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-cyan-400" />
                  <span>Phone: +234 706 278 0839</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                  <span>Address: Lagos, Nigeria</span>
                </p>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
              <p className="text-xs text-gray-500">
                By continuing to use Finlight, you acknowledge that you have read, understood, and agree to 
                be bound by these Terms and Conditions.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                © {new Date().getFullYear()} Finlight. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;