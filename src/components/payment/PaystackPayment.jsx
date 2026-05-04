import { PaystackButton } from '@makozi/paystack-react-pay';
import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PaystackPayment = ({ paymentId, amount, email, onSuccess, onClose, buttonText }) => {
  const [loading, setLoading] = useState(false);
  const [paymentReference, setPaymentReference] = useState(null);

  const handleSuccess = async (response) => {
    console.log('Payment successful:', response);
    
    // Verify payment on backend
    try {
      const verifyResponse = await api.get(`/payment-gateway/verify/${response.reference}`);
      if (verifyResponse.data.success) {
        toast.success('Payment completed successfully!');
        if (onSuccess) onSuccess(verifyResponse.data.data);
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Payment successful but verification pending');
      if (onSuccess) onSuccess(response);
    }
  };

  const handleClose = () => {
    console.log('Payment modal closed');
    if (onClose) onClose();
  };

  const initializePayment = async () => {
    setLoading(true);
    try {
      const response = await api.post('/payment-gateway/initialize', { paymentId });
      if (response.data.success) {
        setPaymentReference(response.data.data.reference);
        // Open Paystack programmatically or use the returned URL
        window.location.href = response.data.data.authorizationUrl;
      }
    } catch (error) {
      console.error('Initialization error:', error);
      toast.error(error.response?.data?.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const config = {
    reference: paymentReference || new Date().getTime().toString(),
    email: email,
    amount: amount * 100, // Convert to kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    onSuccess: handleSuccess,
    onClose: handleClose,
    metadata: {
      paymentId: paymentId,
      custom_fields: [
        {
          display_name: "Payment ID",
          variable_name: "payment_id",
          value: paymentId
        }
      ]
    }
  };

  return (
    <div>
      {paymentReference ? (
        <PaystackButton
          {...config}
          text={buttonText || `Pay ₦${amount.toLocaleString()}`}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
        />
      ) : (
        <button
          onClick={initializePayment}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Initializing...
            </div>
          ) : (
            buttonText || `Pay ₦${amount.toLocaleString()}`
          )}
        </button>
      )}
    </div>
  );
};

export default PaystackPayment;