// src/components/common/PeriodBadge.jsx
import React from 'react';
import { formatPeriodKey, getPeriodBadgeColor, isCurrentPeriod } from '../../utils/periodUtils';
import { Calendar } from 'lucide-react';

/**
 * Period Badge - Shows the period label with appropriate styling
 */
const PeriodBadge = ({
    periodKey,
    periodStart,
    periodEnd,
    status,
    size = 'sm',
    showIcon = true,
    className = ''
}) => {
    if (!periodKey && !periodStart) {
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500 ${className}`}>
                One-time
            </span>
        );
    }

    const label = periodKey ? formatPeriodKey(periodKey) : 'Custom Period';
    const colorClass = getPeriodBadgeColor(status, periodKey);
    const isCurrent = isCurrentPeriod(periodKey);

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5 gap-1',
        md: 'text-sm px-3 py-1 gap-1.5',
        lg: 'text-base px-4 py-1.5 gap-2'
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${colorClass} ${className}`}>
            {showIcon && <Calendar className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />}
            {label}
            {isCurrent && status !== 'paid' && (
                <span className="ml-1 w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
            )}
        </span>
    );
};

export default PeriodBadge;