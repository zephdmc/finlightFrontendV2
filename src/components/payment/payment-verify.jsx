// In your PaymentVerify page component
useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('tx_ref');
    const status = urlParams.get('status');

    if (reference && status === 'successful') {
        // Call your verification endpoint
        api.get(`/payment-gateway/verify/${reference}`)
            .then(response => {
                if (response.data.success) {
                    toast.success('Payment verified!');
                    navigate('/dashboard');
                }
            })
            .catch(() => toast.error('Verification failed'));
    }
}, []);