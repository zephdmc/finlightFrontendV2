import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Shield, 
  Lock, 
  FileText,
  Clock,
  CreditCard,
  AlertCircle,
  RefreshCw,
  Calendar,
  DollarSign,
  MessageCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Printer,
  Home,
  ChevronRight,
  Timer,
  Receipt,
  Banknote,
  UserCheck,
  ThumbsUp,
  Users  // Added missing Users import
} from 'lucide-react';

const RefundPolicy = () => {
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
    { id: 'overview', title: 'Policy Overview', icon: <FileText className="h-4 w-4" /> },
    { id: 'subscription', title: 'Subscription Refunds', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'dues', title: 'Member Dues Refunds', icon: <Users className="h-4 w-4" /> },
    { id: 'timeframes', title: 'Refund Timeframes', icon: <Timer className="h-4 w-4" /> },
    { id: 'process', title: 'Refund Process', icon: <RefreshCw className="h-4 w-4" /> },
    { id: 'exceptions', title: 'Non-Refundable Items', icon: <XCircle className="h-4 w-4" /> },
    { id: 'disputes', title: 'Dispute Resolution', icon: <MessageCircle className="h-4 w-4" /> }
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
              <button onClick={() => navigate('/privacy')} className="text-gray-300 hover:text-cyan-400 transition-colors flex items-center gap-1">
                <Lock className="h-4 w-4" />
                Privacy
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
              <RefreshCw className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-cyan-400 font-medium">Money Back Guarantee</span>
            </div>
            <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-white mb-4`}>
              Refund Policy
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Clear, transparent, and fair refund policies for all Finlight users
            </p>
            <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Last Updated: {lastUpdated}</span>
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Effective: {effectiveDate}</span>
              </div>
            </div>
          </div>

          {/* Key Points Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl border border-green-500/20 p-4 text-center">
              <RefreshCw className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Refund requests must be submitted within</p>
              <p className="text-lg font-bold text-green-400">14 Days</p>
              <p className="text-xs text-gray-500">of transaction date</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-xl border border-cyan-500/20 p-4 text-center">
              <Timer className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Refund processing typically takes</p>
              <p className="text-lg font-bold text-cyan-400">5-10 Business Days</p>
              <p className="text-xs text-gray-500">depending on payment method</p>
            </div>
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl border border-amber-500/20 p-4 text-center">
              <DollarSign className="h-8 w-8 text-amber-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Processing fees are</p>
              <p className="text-lg font-bold text-amber-400">Non-Refundable</p>
              <p className="text-xs text-gray-500">from payment processors</p>
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

          {/* Refund Policy Content */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 p-6 md:p-8">
            {/* Introduction */}
            <div className="mb-8 pb-6 border-b border-gray-800">
              <p className="text-gray-400 leading-relaxed mb-4">
                At Finlight ("we," "our," or "us"), we strive to ensure complete satisfaction with our services. 
                This Refund Policy outlines the circumstances under which refunds may be issued for payments made 
                through our platform.
              </p>
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <p className="text-sm text-amber-400 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span><strong className="font-semibold">Important Note:</strong> Finlight is a software platform, not a bank. Refunds for member dues and contributions are subject to your organization's internal policies. Finlight facilitates the refund process but does not make decisions on organization-specific refunds.</span>
                </p>
              </div>
            </div>

            {/* Section 1 - Policy Overview */}
            <div id="overview" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-400" />
                1. Policy Overview
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                This Refund Policy applies to all payments made through the Finlight platform, including:
              </p>
              <ul className="space-y-2 text-gray-400 leading-relaxed pl-5 list-disc">
                <li>Subscription fees for paid plans (Starter, Growth, Business, Custom)</li>
                <li>Member dues and contribution payments</li>
                <li>One-time service fees and processing charges</li>
                <li>Custom feature development and setup fees</li>
              </ul>
              <p className="text-gray-400 leading-relaxed mt-3">
                By using Finlight, you acknowledge that you have read, understood, and agree to this Refund Policy. 
                If you do not agree with any part of this policy, please discontinue use of our services.
              </p>
            </div>

            {/* Section 2 - Subscription Refunds */}
            <div id="subscription" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-cyan-400" />
                2. Subscription Plan Refunds
              </h2>
              
              <div className="space-y-4 mt-3">
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <h3 className="font-semibold text-green-400">14-Day Money-Back Guarantee</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    We offer a full refund on subscription fees if you cancel within 14 days of your initial 
                    subscription purchase, provided you have not extensively used the platform's premium features. 
                    This applies to the first subscription only.
                  </p>
                </div>

                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h3 className="font-semibold text-cyan-400 mb-2">Pro-rated Refunds</h3>
                  <p className="text-gray-400 text-sm">
                    For cancellations after the 14-day period, refunds may be issued on a pro-rated basis for the 
                    unused portion of your subscription term. The minimum refund amount is ₦5,000 or 10% of the 
                    subscription fee, whichever is higher.
                  </p>
                </div>

                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h3 className="font-semibold text-cyan-400 mb-2">Annual Subscriptions</h3>
                  <p className="text-gray-400 text-sm">
                    Annual subscription cancellations are eligible for pro-rated refunds based on remaining full 
                    months. A 10% administrative fee may apply to process the refund.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3 - Member Dues Refunds */}
            <div id="dues" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-400" />
                3. Member Dues & Contribution Refunds
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                Refunds for member dues and contributions are governed by your organization's internal policies. 
                Finlight provides the technical means to process refunds, but the decision to refund rests with 
                the organization administrator.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-gray-800/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ThumbsUp className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Eligible for Refund</span>
                  </div>
                  <ul className="text-xs text-gray-400 pl-4 list-disc space-y-1">
                    <li>Duplicate/accidental payments</li>
                    <li>Incorrect payment amounts</li>
                    <li>Payments for wrong member</li>
                    <li>Unauthorized transactions</li>
                  </ul>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="h-4 w-4 text-red-400" />
                    <span className="text-sm font-medium text-white">Not Eligible for Refund</span>
                  </div>
                  <ul className="text-xs text-gray-400 pl-4 list-disc space-y-1">
                    <li>Voluntary contributions received</li>
                    <li>Payments older than 30 days</li>
                    <li>Processing fees (non-refundable)</li>
                    <li>Disputed dues (organization decision)</li>
                  </ul>
                </div>
              </div>

              <div className="mt-3 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
                <p className="text-xs text-cyan-400 flex items-start gap-2">
                  <UserCheck className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Organization administrators have the final authority on refund decisions for member dues. Finlight will process refunds only upon authorization from the organization administrator.</span>
                </p>
              </div>
            </div>

            {/* Section 4 - Refund Timeframes - FIXED TABLE */}
            <div id="timeframes" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Timer className="h-5 w-5 text-cyan-400" />
                4. Refund Timeframes
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                Refund processing times vary depending on the original payment method:
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-800">
                    <tr className="text-left text-gray-400">
                      <th className="pb-2 font-medium">Payment Method</th>
                      <th className="pb-2 font-medium">Processing Time</th>
                      <th className="pb-2 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    <tr>
                      <td className="py-2 text-gray-300">Card Payments</td>
                      <td className="py-2 text-gray-400">5-7 business days</td>
                      <td className="py-2 text-gray-500 text-xs">Depends on issuing bank</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-300">Bank Transfer</td>
                      <td className="py-2 text-gray-400">3-5 business days</td>
                      <td className="py-2 text-gray-500 text-xs">Nigerian banks only</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-300">USSD/Mobile Money</td>
                      <td className="py-2 text-gray-400">7-10 business days</td>
                      <td className="py-2 text-gray-500 text-xs">Provider dependent</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-300">Wallet Balance</td>
                      <td className="py-2 text-gray-400">1-2 business days</td>
                      <td className="py-2 text-gray-500 text-xs">Instant to Finlight wallet</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="text-gray-400 text-sm mt-3">
                <strong className="text-cyan-400">Note:</strong> All timeframes are estimates. Actual refund times may vary based on payment processor and financial institution processing times.
              </p>
            </div>

            {/* Section 5 - Refund Process */}
            <div id="process" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-cyan-400" />
                5. How to Request a Refund
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                To request a refund, please follow these steps:
              </p>
              
              <div className="space-y-3 mt-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-cyan-400 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Submit a Refund Request</h3>
                    <p className="text-gray-400 text-sm">Contact our support team via email at <span className="text-cyan-400">refunds@finlight.com</span> or through the in-app support feature.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-cyan-400 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Provide Required Information</h3>
                    <p className="text-gray-400 text-sm">Include your transaction ID, payment date, amount, and reason for refund request. Attach any relevant documentation.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-cyan-400 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Wait for Review</h3>
                    <p className="text-gray-400 text-sm">Our team will review your request within 3-5 business days. You will receive a confirmation email once reviewed.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-cyan-400 text-xs font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Refund Processing</h3>
                    <p className="text-gray-400 text-sm">Approved refunds will be processed to the original payment method within the timeframes specified above.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6 - Non-Refundable Items */}
            <div id="exceptions" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-cyan-400" />
                6. Non-Refundable Items and Services
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                The following items and services are generally non-refundable:
              </p>
              <ul className="space-y-2 text-gray-400 leading-relaxed pl-5 list-disc">
                <li><strong className="text-cyan-400">Processing Fees:</strong> Payment processor fees (typically 1.5% - 2.5%) are non-refundable</li>
                <li><strong className="text-cyan-400">Custom Development:</strong> Fees for custom features or integrations already completed</li>
                <li><strong className="text-cyan-400">Setup Fees:</strong> One-time setup or onboarding fees for implemented services</li>
                <li><strong className="text-cyan-400">Partial Months:</strong> No refunds for partial month usage on monthly plans</li>
                <li><strong className="text-cyan-400">Bank Charges:</strong> Any bank reversal or chargeback fees incurred</li>
                <li><strong className="text-cyan-400">Discounted Services:</strong> Services purchased during promotional periods or with discounts</li>
              </ul>
            </div>

            {/* Section 7 - Dispute Resolution */}
            <div id="disputes" className="mb-8 scroll-mt-20">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-cyan-400" />
                7. Dispute Resolution
              </h2>
              <p className="text-gray-400 leading-relaxed mb-3">
                In the event of a dispute regarding a refund, the following process applies:
              </p>
              
              <div className="space-y-3 mt-3">
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h3 className="font-semibold text-cyan-400 mb-2">Step 1: Internal Review</h3>
                  <p className="text-gray-400 text-sm">
                    Submit a detailed explanation of your dispute to <span className="text-cyan-400">disputes@finlight.com</span>. 
                    Our team will conduct a thorough review and respond within 7 business days.
                  </p>
                </div>
                
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h3 className="font-semibold text-cyan-400 mb-2">Step 2: Escalation</h3>
                  <p className="text-gray-400 text-sm">
                    If the dispute remains unresolved, you may escalate to our management team. Provide all 
                    relevant documentation and communication history.
                  </p>
                </div>
                
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h3 className="font-semibold text-cyan-400 mb-2">Step 3: Third-Party Mediation</h3>
                  <p className="text-gray-400 text-sm">
                    For disputes involving significant amounts (₦100,000+), both parties agree to first attempt 
                    mediation through a mutually agreed-upon mediator in Lagos, Nigeria, before pursuing legal action.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-cyan-400" />
                8. Special Circumstances
              </h2>
              
              <div className="space-y-3">
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                  <h3 className="font-semibold text-green-400 mb-1">Service Outage Refunds</h3>
                  <p className="text-gray-400 text-sm">
                    In the event of a significant service outage (downtime exceeding 48 consecutive hours), 
                    affected users may be eligible for a credit equivalent to the downtime period. Credits will 
                    be automatically applied to the next billing cycle.
                  </p>
                </div>
                
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                  <h3 className="font-semibold text-amber-400 mb-1">Fraudulent Transactions</h3>
                  <p className="text-gray-400 text-sm">
                    If you identify an unauthorized or fraudulent transaction on your account, please notify us 
                    immediately at <span className="text-cyan-400">security@finlight.com</span>. We will investigate and 
                    issue a full refund upon verification of the fraudulent activity.
                  </p>
                </div>
                
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
                  <h3 className="font-semibold text-cyan-400 mb-1">Chargebacks</h3>
                  <p className="text-gray-400 text-sm">
                    If you initiate a chargeback with your bank or credit card company, your Finlight account may 
                    be suspended pending investigation. We encourage you to contact us first to resolve any issues 
                    before initiating a chargeback.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-8 pt-6 border-t border-gray-800">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <Mail className="h-5 w-5 text-cyan-400" />
                9. Contact Us for Refund Questions
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                If you have questions about this Refund Policy or need assistance with a refund request, 
                please contact our support team:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="flex items-center gap-2 text-gray-300 mb-2">
                    <Mail className="h-4 w-4 text-cyan-400" />
                    <span className="font-medium">Refund Requests</span>
                  </p>
                  <p className="text-sm text-gray-400">refunds@finlight.com</p>
                  <p className="text-sm text-gray-400">support@finlight.com</p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="flex items-center gap-2 text-gray-300 mb-2">
                    <Phone className="h-4 w-4 text-cyan-400" />
                    <span className="font-medium">Phone Support</span>
                  </p>
                  <p className="text-sm text-gray-400">+234 706 278 0839</p>
                  <p className="text-sm text-gray-400">Mon-Fri, 9AM - 5PM WAT</p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4 md:col-span-2">
                  <p className="flex items-center gap-2 text-gray-300 mb-2">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    <span className="font-medium">Dispute Resolution Address</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Finlight Dispute Resolution Department<br />
                    Lagos, Nigeria
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
              <div className="flex flex-wrap justify-center gap-4 mb-4 text-xs">
                <button onClick={() => navigate('/terms')} className="text-gray-500 hover:text-cyan-400 transition-colors">
                  Terms & Conditions
                </button>
                <span className="text-gray-700">•</span>
                <button onClick={() => navigate('/privacy')} className="text-gray-500 hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </button>
                <span className="text-gray-700">•</span>
                <button onClick={handlePrint} className="text-gray-500 hover:text-cyan-400 transition-colors">
                  Print This Policy
                </button>
              </div>
              <p className="text-xs text-gray-600">
                This Refund Policy is subject to change without prior notice. Please review it periodically.
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

export default RefundPolicy;