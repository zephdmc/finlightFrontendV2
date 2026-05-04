import React from 'react';

/**
 * Loading Spinner Component
 * Displays a customizable loading spinner
 */
const LoadingSpinner = ({ size = 'md', color = 'blue', fullScreen = false, text = 'Loading...' }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const colors = {
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    green: 'border-green-600',
    red: 'border-red-600',
    white: 'border-white'
  };

  const spinnerSize = sizes[size] || sizes.md;
  const spinnerColor = colors[color] || colors.blue;

  const Spinner = () => (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full ${spinnerSize} border-b-2 ${spinnerColor}`}></div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50 bg-opacity-75 flex items-center justify-center z-50">
        <Spinner />
      </div>
    );
  }

  return <Spinner />;
};

/**
 * Skeleton Loader Component
 * Displays a placeholder while content is loading
 */
export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const skeletons = {
    card: () => (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    ),
    table: () => (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    ),
    list: () => (
      <div className="animate-pulse space-y-3">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    ),
    chart: () => (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    )
  };

  const SkeletonComponent = skeletons[type] || skeletons.card;
  
  if (count > 1 && type !== 'table') {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
          <SkeletonComponent key={i} />
        ))}
      </div>
    );
  }

  return <SkeletonComponent />;
};

export default LoadingSpinner;