// src/utils/periodUtils.js

/**
 * Format a date for display
 */
export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

/**
 * Format period key for display
 * Examples: "2026-08" → "August 2026"
 *           "2026-W34" → "Week 34, 2026"
 *           "2026-Q3" → "Q3 2026"
 */
export const formatPeriodKey = (periodKey) => {
    if (!periodKey) return 'One-time';

    // Monthly: "2026-08" → "August 2026"
    if (periodKey.match(/^\d{4}-\d{2}$/)) {
        const [year, month] = periodKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    }

    // Weekly: "2026-W34" → "Week 34, 2026"
    if (periodKey.match(/^\d{4}-W\d{2}$/)) {
        const [year, week] = periodKey.split('-W');
        return `Week ${parseInt(week)}, ${year}`;
    }

    // Quarterly: "2026-Q3" → "Q3 2026"
    if (periodKey.match(/^\d{4}-Q[1-4]$/)) {
        const [year, quarter] = periodKey.split('-Q');
        return `Q${quarter} ${year}`;
    }

    // Yearly: "2026" → "2026"
    if (periodKey.match(/^\d{4}$/)) {
        return periodKey;
    }

    return periodKey;
};

/**
 * Get period range label
 * Example: "Aug 1 - Aug 31, 2026"
 */
export const getPeriodRangeLabel = (periodStart, periodEnd) => {
    if (!periodStart) return 'One-time';
    if (!periodEnd) return formatDate(periodStart);

    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    const startStr = start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
    const endStr = end.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return `${startStr} - ${endStr}`;
};

/**
 * Get current month/year period key
 */
export const getCurrentPeriodKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

/**
 * Get period key from payment data (with fallback)
 */
export const getPaymentPeriodKey = (payment) => {
    return payment.periodKey || payment.periodKey || 'one-time';
};

/**
 * Get display period label from payment data
 */
export const getPaymentPeriodLabel = (payment) => {
    if (payment.periodKey) {
        return formatPeriodKey(payment.periodKey);
    }
    if (payment.periodStart) {
        return formatDate(payment.periodStart);
    }
    return 'One-time';
};

/**
 * Check if a period key is the current period
 */
export const isCurrentPeriod = (periodKey) => {
    if (!periodKey) return false;
    return periodKey === getCurrentPeriodKey();
};

/**
 * Get period badge color based on status
 */
export const getPeriodBadgeColor = (status, periodKey) => {
    if (status === 'paid') return 'bg-green-100 text-green-700';
    if (status === 'partial') return 'bg-yellow-100 text-yellow-700';
    if (status === 'pending') return 'bg-blue-100 text-blue-700';
    if (isCurrentPeriod(periodKey)) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
};

/**
 * Sort periods (newest first)
 */
export const sortPeriods = (periods) => {
    return periods.sort((a, b) => {
        if (a === 'one-time') return 1;
        if (b === 'one-time') return -1;
        return b.localeCompare(a);
    });
};

/**
 * Group payments by period
 */
export const groupPaymentsByPeriod = (payments) => {
    const grouped = payments.reduce((acc, payment) => {
        const key = payment.periodKey || 'one-time';
        if (!acc[key]) {
            acc[key] = {
                periodKey: key,
                periodLabel: getPaymentPeriodLabel(payment),
                periodStart: payment.periodStart,
                periodEnd: payment.periodEnd,
                payments: []
            };
        }
        acc[key].payments.push(payment);
        return acc;
    }, {});

    // Convert to array and sort
    return Object.values(grouped).sort((a, b) => {
        if (a.periodKey === 'one-time') return 1;
        if (b.periodKey === 'one-time') return -1;
        return b.periodKey.localeCompare(a.periodKey);
    });
};