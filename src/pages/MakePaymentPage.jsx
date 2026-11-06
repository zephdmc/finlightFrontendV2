import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, AlertCircle, CheckCircle, Clock, Shield, History, TrendingDown, Calculator, RefreshCw, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePayments } from '../hooks/usePaymentData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Navbar from '../components/common/Navbar';
import PaymentForm from '../components/payment/PaymentForm';
// ============================================================
// NEW IMPORT: PeriodBadge component
// ============================================================
import PeriodBadge from '../components/common/PeriodBadge';
import { formatPeriodKey } from '../utils/periodUtils';
import toast from 'react-hot-toast';

const MakePaymentPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch payments using React Query
    const {
        data: payments = [],
        isLoading,
        refetch: refetchPayments,
        error
    } = usePayments({});

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlePaymentSuccess = () => {
        refetchPayments();
        toast.success('Payment completed successfully!');
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refetchPayments();
            toast.success('Data refreshed successfully');
        } catch (error) {
            toast.error('Failed to refresh data');
        } finally {
            setRefreshing(false);
        }
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    const formatCurrency = (amount) => {
        try {
            return new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount || 0);
        } catch (error) {
            return `₦${(amount || 0).toLocaleString()}`;
        }
    };

    // Calculate simple stats from payments
    const calculateStats = () => {
        const validPayments = payments.filter(p => p.type !== 'outstanding');
        const paidPayments = validPayments.filter(p => p.status === 'paid');
        const pendingPayments = validPayments.filter(p => p.status === 'unpaid' || p.status === 'pending');
        const partialPayments = validPayments.filter(p => p.isPartial === true && p.remainingAmount > 0);

        const totalPaid = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalOutstanding = pendingPayments.reduce((sum, p) => sum + (p.remainingAmount || p.amount || 0), 0) +
            partialPayments.reduce((sum, p) => sum + (p.remainingAmount || 0), 0);

        return {
            paidCount: paidPayments.length,
            pendingCount: pendingPayments.length + partialPayments.length,
            totalPaid,
            totalOutstanding
        };
    };

    const stats = calculateStats();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Failed to load payment data</p>
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">

                {/* Header with Gradient Background */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-4 pt-6 pb-8 rounded-b-3xl shadow-lg">





                    <div className="flex items-center gap-3 sm:gap-4">
                        <div
                            onClick={handleBackToDashboard}
                            className="p-2.5 sm:p-3 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10">
                            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                            {/* <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" /> */}

                        </div>
                        <div>
                            <h1 className="text-lg sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                                Make a Payment                                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                            </h1>
                            <p className="text-blue-200/80 text-xs sm:text-sm">
                                Scheduled payments by your group or organization. Please select a payment type to continue.                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
                        >
                            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>




                    {/* Stats Cards */}


                    {/* ============================================================
                NEW: Current Period Info (Display Only - NO PENDING LOGIC CHANGED)
                ============================================================ */}
                    {payments.some(p => p.periodKey) && (
                        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-200" />
                                <span className="text-xs text-blue-100">Current Period:</span>
                                <span className="text-xs font-medium text-white">
                                    {formatPeriodKey(new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0'))}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="px-4 mt-4">
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-4">
                            <PaymentForm
                                onSuccess={handlePaymentSuccess}
                                payments={payments}
                                isAdmin={false}
                                paymentTypes={[]}
                                userEmail={user?.email}
                            />
                        </div>
                    </div>



                    {/* Secure Payment Footer */}
                    <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-blue-800 mb-1">Secure Payment</p>
                                <p className="text-xs text-blue-700">
                                    Your payment is processed securely via Flutterwave. We accept all major cards.
                                    The organization will receive exactly what they requested - fees are added on top.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="mt-4 bg-gray-50 rounded-2xl p-4 border border-gray-200">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <Wallet className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-800">Need Help?</h3>
                                <p className="text-xs text-gray-600 mt-1">
                                    If you have any questions about your payments, please contact your organization administrator.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MakePaymentPage;