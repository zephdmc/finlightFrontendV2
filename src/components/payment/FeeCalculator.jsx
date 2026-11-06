import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, Info, Calculator, RefreshCw } from 'lucide-react';

const FeeCalculator = ({ amount = 0, onCalculated, className = '' }) => {
  const [inputAmount, setInputAmount] = useState(amount);
  const [calculation, setCalculation] = useState({
    totalAmount: 0,
    flutterwaveFee: 0,
    platformFee: 0,
    organizationGets: 0,
    platformGets: 0,
    organizationPercentage: 96,
    platformPercentage: 4
  });

  // Flutterwave fee = 2% of total amount (no cap, no fixed fee)
  const calculateFlutterwaveFee = (amount) => amount * 0.02;
  // Platform fee = 2% of total amount
  const calculatePlatformFee = (amount) => amount * 0.02;

  const calculateFees = (totalAmount) => {
    if (!totalAmount || totalAmount <= 0) {
      return {
        totalAmount: 0,
        flutterwaveFee: 0,
        platformFee: 0,
        organizationGets: 0,
        platformGets: 0
      };
    }

    const flutterwaveFee = calculateFlutterwaveFee(totalAmount);
    const platformFee = calculatePlatformFee(totalAmount);
    const organizationGets = totalAmount - flutterwaveFee - platformFee;

    return {
      totalAmount,
      flutterwaveFee,
      platformFee,
      organizationGets,
      platformGets: platformFee
    };
  };

  const handleAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setInputAmount(value);
    const fees = calculateFees(value);
    setCalculation({
      ...fees,
      organizationPercentage: 96,
      platformPercentage: 4
    });

    if (onCalculated) {
      onCalculated({
        ...fees,
        memberPays: value,
        organizationReceives: fees.organizationGets,
        platformReceives: fees.platformGets
      });
    }
  };

  useEffect(() => {
    if (amount > 0) {
      setInputAmount(amount);
      const fees = calculateFees(amount);
      setCalculation({
        ...fees,
        organizationPercentage: 96,
        platformPercentage: 4
      });
    }
  }, [amount]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-white" />
            <h3 className="font-semibold text-white text-sm">Payment Fee Calculator</h3>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-blue-200">Powered by Flutterwave</span>
          </div>
        </div>
        <p className="text-blue-200 text-xs mt-1">
          See how the payment will be split after fees
        </p>
      </div>

      {/* Input Section */}
      <div className="p-4 border-b border-gray-100">
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Enter Amount You Will Pay (₦)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₦</span>
          <input
            type="number"
            value={inputAmount}
            onChange={handleAmountChange}
            placeholder="0.00"
            min="0"
            step="100"
            className="w-full pl-8 pr-4 py-3 text-lg font-semibold border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Minimum: ₦100 | Maximum: ₦10,000,000
        </p>
      </div>

      {/* Fee Breakdown */}
      {calculation.totalAmount > 0 && (
        <div className="p-4 space-y-3">
          {/* Member Pays */}
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">You Pay (Total)</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {formatCurrency(calculation.totalAmount)}
            </span>
          </div>

          {/* Flutterwave Fee */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm text-gray-600">
                Flutterwave Fee (2%)
              </span>
            </div>
            <span className="text-sm font-medium text-red-600">
              -{formatCurrency(calculation.flutterwaveFee)}
            </span>
          </div>

          {/* Platform Fee */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-gray-600">
                Platform Fee (2%)
              </span>
            </div>
            <span className="text-sm font-medium text-orange-600">
              -{formatCurrency(calculation.platformFee)}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200 my-2"></div>

          {/* Split Title */}
          <div className="flex items-center gap-2 mt-2">
            <Info className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">Final distribution after fees:</span>
          </div>

          {/* Organization Gets */}
          <div className="flex justify-between items-center bg-green-50 rounded-xl p-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Organization Receives</span>
              </div>
              <p className="text-xs text-green-600 mt-0.5">
                {calculation.organizationPercentage}% of your payment
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-green-700">
                {formatCurrency(calculation.organizationGets)}
              </span>
            </div>
          </div>

          {/* Platform Gets */}
          <div className="flex justify-between items-center bg-blue-50 rounded-xl p-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Platform Receives</span>
              </div>
              <p className="text-xs text-blue-600 mt-0.5">
                {calculation.platformPercentage}% of your payment (2%)
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-blue-700">
                {formatCurrency(calculation.platformGets)}
              </span>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-gray-50 rounded-xl p-3 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Net to Organization:</span>
              <span className="text-base font-bold text-green-700">
                {formatCurrency(calculation.organizationGets)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-600">Total Fees (Flutterwave + Platform):</span>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(calculation.flutterwaveFee + calculation.platformFee)}
              </span>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-yellow-50 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-yellow-800 font-medium">Important Note</p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  The organisation will receive exactly {formatCurrency(calculation.organizationGets)} after deducting 2% Flutterwave fee and 2% platform fee.
                  Your total payment includes these fees – nothing is deducted from the organisation’s intended amount.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {calculation.totalAmount === 0 && (
        <div className="p-8 text-center">
          <Calculator className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-400">Enter an amount to see fee breakdown</p>
        </div>
      )}
    </div>
  );
};

export default FeeCalculator;