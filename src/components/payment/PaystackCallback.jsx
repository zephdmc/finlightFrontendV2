import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

const PaystackCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    // Check if token exists, if not try to restore from localStorage
    const token = localStorage.getItem('token');
    console.log('Token exists on callback page:', !!token);
    
    if (!token) {
      // Wait a bit and try to get token from storage again
      setTimeout(() => {
        const retryToken = localStorage.getItem('token');
        if (retryToken) {
          console.log('Token found after retry');
          verifyPayment();
        } else {
          // No token, but we can still verify the payment without auth
          verifyPaymentWithoutAuth();
        }
      }, 500);
    } else {
      verifyPayment();
    }
  }, []);

  const verifyPayment = async () => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    const paymentRef = reference || trxref;
    
    console.log('Payment reference:', paymentRef);
    
    if (!paymentRef) {
      setStatus('error');
      setVerifying(false);
      toast.error('No payment reference found');
      return;
    }
    
    try {
      // Try with authentication
      const { data } = await api.get(`/payment-gateway/verify/${paymentRef}`);
      console.log('Verification response:', data);
      
      if (data.success) {
        setStatus('success');
        setPaymentDetails(data.data);
        toast.success('Payment verified successfully!');
        
        setTimeout(() => {
          navigate('/payments');
        }, 3000);
      } else {
        throw new Error(data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      // If auth fails, try without auth
      verifyPaymentWithoutAuth();
    } finally {
      setVerifying(false);
    }
  };

  const verifyPaymentWithoutAuth = async () => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    const paymentRef = reference || trxref;
    
    try {
      // Direct fetch without auth headers
      const response = await fetch(`http://localhost:5000/api/payment-gateway/verify/${paymentRef}`);
      const data = await response.json();
      console.log('Verification without auth response:', data);
      
      if (data.success) {
        setStatus('success');
        setPaymentDetails(data.data);
        toast.success('Payment verified successfully!');
        
        // Try to restore session
        const token = localStorage.getItem('token');
        if (token) {
          try {
            await api.get('/auth/me');
          } catch (e) {
            console.log('Could not refresh session, user may need to login again');
          }
        }
        
        setTimeout(() => {
          navigate('/payments');
        }, 3000);
      } else {
        setStatus('error');
        toast.error(data.message || 'Payment verification failed');
        setVerifying(false);
      }
    } catch (error) {
      console.error('Verification without auth error:', error);
      setStatus('error');
      toast.error('Payment verification failed. Please check your payment status on the payments page.');
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
          <p className="text-sm text-gray-500 mt-2">Please do not close this window</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'success' ? (
          <>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your payment has been verified successfully.
            </p>
            {paymentDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-600">Payment Details:</p>
                <p className="font-semibold capitalize">{paymentDetails.type}</p>
                <p className="text-lg font-bold text-green-600">
                  ₦{paymentDetails.amount?.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Reference: {paymentDetails.transactionReference}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500 mb-6">
              Redirecting you to payments page in 3 seconds...
            </p>
            <button
              onClick={() => navigate('/payments')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Payments
            </button>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Verification</h2>
            <p className="text-gray-600 mb-6">
              Could not verify your payment automatically. Please check your payment status.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/payments')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go to Payments
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaystackCallback;