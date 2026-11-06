// src/components/common/PeriodSelector.jsx
import React from 'react';
import { formatPeriodKey } from '../../utils/periodUtils';
import { ChevronDown } from 'lucide-react';

/**
 * Period Selector - Dropdown for selecting periods
 */
const PeriodSelector = ({
    periods = [],
    selected,
    onSelect,
    label = 'Select Period',
    includeAll = true,
    className = ''
}) => {
    const sortedPeriods = [...periods].sort((a, b) => {
        if (a === 'one-time') return 1;
        if (b === 'one-time') return -1;
        return b.localeCompare(a);
    });

    const displayPeriods = includeAll
        ? ['all', ...sortedPeriods]
        : sortedPeriods;

    return (
        <div className={`relative ${className}`}>
            <select
                value={selected || 'all'}
                onChange={(e) => onSelect(e.target.value)}
                className="w-full appearance-none px-4 py-2 pr-10 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            >
                {displayPeriods.map(period => (
                    <option key={period} value={period}>
                        {period === 'all' ? 'All Periods' : formatPeriodKey(period)}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
    );
};

export default PeriodSelector;