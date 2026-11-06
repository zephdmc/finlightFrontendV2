import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';

const PaymentVerify = () => {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [verifying, setVerifying] = useState(true);
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'failed', 'cancelled'
    const [verificationAttempted, setVerificationAttempted] = useState(false); // âœ… ADD THIS

    useEffect(() => {
        const reference = searchParams.get('tx_ref');
        const transactionId = searchParams.get('transaction_id');
        const statusParam = searchParams.get('status');

        if (verificationAttempted) {
                        return;
        }


        // If no reference, something went wrong
        if (!reference) {
            setStatus('failed');
            setVerifying(false);
            toast.error('No payment reference found');
            setTimeout(() => navigate('/dashboard'), 3000);
            return;
        }

        // Check if payment was cancelled
        if (statusParam === 'cancelled') {
            setStatus('cancelled');
            setVerifying(false);
            toast.error('Payment was cancelled');
            setTimeout(() => navigate('/dashboard'), 3000);
            return;
        }

        // Verify the payment with your backend
        const verifyPayment = async () => {
            try {
                setVerifying(true);
                const response = await api.get(`/payment-gateway/verify/${reference}`);

                if (response.data.success) {
                    setStatus('success');
                    toast.success('Payment verified successfully!');

                    // Clear session storage
                    sessionStorage.removeItem('pendingPaymentId');
                    sessionStorage.removeItem('pendingTxRef');

                    // Redirect to dashboard after 3 seconds
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 3000);
                } else {
                    setStatus('failed');
                    toast.error(response.data.message || 'Payment verification failed');
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 4000);
                }
            } catch (error) {
                console.error('Verification error:', error);
                setStatus('failed');
                toast.error(error.response?.data?.message || 'Could not verify payment. Please contact support.');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 4000);
            } finally {
                setVerifying(false);
            }
        };

        // Small delay to ensure everything is loaded
        const timer = setTimeout(() => {
            verifyPayment();
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchParams, navigate, verificationAttempted]);

    // Render based on status
    const renderContent = () => {
        switch (status) {
            case 'verifying':
                return (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
                        <p className="text-gray-500">Please wait while we confirm your payment...</p>
                    </div>
                );

            case 'success':
                return (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful! ðŸŽ‰</h2>
                        <p className="text-gray-500 mb-4">Your payment has been confirmed and verified.</p>
                        <div className="bg-green-50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-green-700">Redirecting you to dashboard...</p>
                        </div>
                    </div>
                );

            case 'cancelled':
                return (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="h-12 w-12 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h2>
                        <p className="text-gray-500 mb-4">You cancelled the payment process.</p>
                        <div className="bg-yellow-50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-yellow-700">Redirecting you to dashboard...</p>
                        </div>
                    </div>
                );

            case 'failed':
                return (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="h-12 w-12 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
                        <p className="text-gray-500 mb-4">We couldn't verify your payment status.</p>
                        <div className="bg-red-50 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 text-left">
                                    Please contact support with your payment reference if you were charged.
                                    <br />
                                    <span className="font-mono text-xs mt-1 block">Reference: {searchParams.get('tx_ref')}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                {renderContent()}

                {/* Progress bar for redirect */}
                {status !== 'verifying' && (
                    <div className="mt-6">
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 rounded-full ${status === 'success' ? 'bg-green-500' :
                                    status === 'cancelled' ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}
                                style={{ width: '100%' }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentVerify;