// src/components/payments/PeriodGroup.jsx
import React from 'react';
import PeriodBadge from '../common/PeriodBadge';
import { formatCurrency } from '../../utils/currencyUtils';

/**
 * Period Group - Displays a group of payments for a specific period
 */
const PeriodGroup = ({
    periodKey,
    periodLabel,
    periodStart,
    periodEnd,
    payments = [],
    onPay,
    onView
}) => {
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPaid = payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalUnpaid = payments
        .filter(p => p.status === 'unpaid' || p.status === 'partial')
        .reduce((sum, p) => sum + (p.remainingAmount || 0), 0);

    const allPaid = payments.every(p => p.status === 'paid');
    const hasPartial = payments.some(p => p.status === 'partial');

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            {/* Period Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                    <PeriodBadge
                        periodKey={periodKey}
                        periodStart={periodStart}
                        periodEnd={periodEnd}
                        size="md"
                    />
                    {allPaid ? (
                        <span className="text-xs text-green-600 font-medium">✅ All Paid</span>
                    ) : hasPartial ? (
                        <span className="text-xs text-yellow-600 font-medium">⚠️ Partial</span>
                    ) : (
                        <span className="text-xs text-red-600 font-medium">⏳ Pending</span>
                    )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                        Total: <span className="font-bold text-gray-900">{formatCurrency(totalAmount)}</span>
                    </span>
                    {totalUnpaid > 0 && (
                        <span className="text-red-600">
                            Outstanding: <span className="font-bold">{formatCurrency(totalUnpaid)}</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Payments List */}
            <div className="divide-y divide-gray-100">
                {payments.map((payment) => (
                    <div key={payment._id} className="px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800">{payment.name}</span>
                                <PeriodBadge
                                    periodKey={payment.periodKey}
                                    status={payment.status}
                                    size="sm"
                                />
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span>Amount: {formatCurrency(payment.amount)}</span>
                                {payment.status === 'partial' && (
                                    <span className="text-yellow-600">
                                        Remaining: {formatCurrency(payment.remainingAmount || 0)}
                                    </span>
                                )}
                                {payment.status === 'paid' && (
                                    <span className="text-green-600">Paid on {new Date(payment.paidAt).toLocaleDateString()}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onView?.(payment)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                View
                            </button>
                            {(payment.status === 'unpaid' || payment.status === 'partial') && (
                                <button
                                    onClick={() => onPay?.(payment)}
                                    className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
                                >
                                    Pay Now
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PeriodGroup;