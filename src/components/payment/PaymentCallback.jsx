import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';
import { CheckCircle, XCircle, ArrowLeft, AlertCircle } from 'lucide-react';

const PaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    verifyPayment();

    const interval = setInterval(() => {
      setRedirectCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status === 'success' && redirectCountdown === 0) {
      navigate('/payments');
    }
  }, [status, redirectCountdown, navigate]);

  const verifyPayment = async () => {
    // Flutterwave sends 'tx_ref' (transaction reference) and optionally 'transaction_id'
    const tx_ref = searchParams.get('tx_ref');
    const transaction_id = searchParams.get('transaction_id');
    const paymentRef = tx_ref || transaction_id;


    if (!paymentRef) {
      setStatus('error');
      setVerifying(false);
      setErrorMessage('No payment reference found. Please check your payment status on the payments page.');
      toast.error('No payment reference found');
      return;
    }

    try {
      const { data } = await api.get(`/payment-gateway/verify/${paymentRef}`);

      if (data.success) {
        setStatus('success');
        setPaymentDetails(data.data);
        toast.success('Payment verified successfully!');
      } else {
        throw new Error(data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        setErrorMessage('Authentication issue. Please log in again to view payment details.');
        setStatus('auth_error');
      } else if (error.response?.status === 404) {
        setErrorMessage('Payment not found. Please contact support.');
        setStatus('error');
      } else {
        setErrorMessage(error.response?.data?.message || error.message || 'Payment verification failed. Please check your payment status on the payments page.');
        setStatus('error');
      }
      toast.error('Payment verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleManualRedirect = () => {
    navigate('/payments');
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Verifying your payment...</p>
          <p className="text-sm text-gray-500 mt-2">Please do not close this window</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className={`p-6 text-center ${
          status === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
          status === 'auth_error' ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
          'bg-gradient-to-r from-red-500 to-rose-600'
        }`}>
          {status === 'success' ? (
            <CheckCircle className="h-16 w-16 text-white mx-auto" />
          ) : status === 'auth_error' ? (
            <AlertCircle className="h-16 w-16 text-white mx-auto" />
          ) : (
            <XCircle className="h-16 w-16 text-white mx-auto" />
          )}
          <h2 className="text-2xl font-bold text-white mt-4">
            {status === 'success' ? 'Payment Successful!' :
             status === 'auth_error' ? 'Authentication Required' :
             'Payment Verification Failed'}
          </h2>
        </div>

        <div className="p-6">
          {status === 'success' && paymentDetails ? (
            <>
              <p className="text-gray-600 text-center mb-6">
                Your payment has been verified successfully.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">Payment Type</span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {paymentDetails.type || 'Payment'}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">Amount Paid</span>
                  <span className="text-xl font-bold text-green-600">
                    Ã¢â€šÂ¦{paymentDetails.amount?.toLocaleString()}
                  </span>
                </div>
                {paymentDetails.transactionReference && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Reference</span>
                    <span className="text-xs text-gray-600 font-mono">
                      {paymentDetails.transactionReference}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">
                  Redirecting to payments page in {redirectCountdown} seconds...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                  <div
                    className="bg-green-600 h-1 rounded-full transition-all duration-1000"
                    style={{ width: `${((5 - redirectCountdown) / 5) * 100}%` }}
                  />
                </div>
              </div>
              <button
                onClick={handleManualRedirect}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Payments Now
              </button>
            </>
          ) : status === 'auth_error' ? (
            <>
              <p className="text-gray-600 text-center mb-6">
                {errorMessage || 'Please log in again to view your payment details.'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                  }}
                  className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Log In Again
                </button>
                <button
                  onClick={() => navigate('/payments')}
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Go to Payments
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 text-center mb-6">
                {errorMessage || 'Could not verify your payment automatically. Please check your payment status on the payments page.'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleManualRedirect}
                  className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Go to Payments
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2.5 text-gray-500 hover:text-gray-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Need help? Contact support@finlight.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;