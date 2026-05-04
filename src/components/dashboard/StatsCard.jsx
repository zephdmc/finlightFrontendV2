import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, color = 'blue', subtitle, trend, compact = false }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const colors = {
    blue: { 
      bg: '#EFF6FF', 
      text: '#1D4ED8', 
      icon: '#2563EB',
      light: '#DBEAFE'
    },
    green: { 
      bg: '#F0FDF4', 
      text: '#166534', 
      icon: '#16A34A',
      light: '#DCFCE7'
    },
    red: { 
      bg: '#FEF2F2', 
      text: '#991B1B', 
      icon: '#DC2626',
      light: '#FEE2E2'
    },
    yellow: { 
      bg: '#FEFCE8', 
      text: '#854D0E', 
      icon: '#EAB308',
      light: '#FEF9C3'
    },
    purple: { 
      bg: '#FAF5FF', 
      text: '#6B21A5', 
      icon: '#9333EA',
      light: '#F3E8FF'
    }
  };

  const colorStyle = colors[color] || colors.blue;

  const formatValue = (val) => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `₦${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `₦${(val / 1000).toFixed(1)}K`;
      }
      return `₦${val.toLocaleString()}`;
    }
    return val;
  };

  // Compact mobile version
  if (compact && isMobile) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: colorStyle.bg }}
            >
              <Icon style={{ height: '18px', width: '18px', color: colorStyle.icon }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{title}</p>
              <p className="text-lg font-bold text-gray-900">
                {formatValue(value)}
              </p>
            </div>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              trend > 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={`text-xs font-medium ${
                trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
        )}
      </div>
    );
  }

  // Regular desktop version
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all duration-300 border border-gray-100 h-full">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <p className={`text-xl md:text-2xl font-bold mt-2`} style={{ color: colorStyle.text }}>
            {formatValue(value)}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div 
          className="h-10 w-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: colorStyle.bg }}
        >
          <Icon style={{ height: '20px', width: '20px', color: colorStyle.icon }} />
        </div>
      </div>
      
      {trend && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
          {trend > 0 ? (
            <>
              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-green-600">+{Math.abs(trend)}%</span>
            </>
          ) : (
            <>
              <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-3 w-3 text-red-600" />
              </div>
              <span className="text-xs font-semibold text-red-600">-{Math.abs(trend)}%</span>
            </>
          )}
          <span className="text-xs text-gray-500">vs last month</span>
        </div>
      )}

      {/* Mini progress indicator for metrics */}
      {color === 'blue' && typeof value === 'number' && value > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-100 rounded-full h-1">
            <div 
              className="rounded-full h-1 transition-all duration-500"
              style={{ 
                width: `${Math.min(100, (value / 10000) * 100)}%`,
                backgroundColor: colorStyle.icon
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;