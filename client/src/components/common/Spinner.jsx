import React from 'react';

const Spinner = ({ size = 'md', color = 'saffron' }) => {
  const sizeClasses = {
    sm: 'h-5 h-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  };

  const colorClasses = {
    saffron: 'border-saffron-500 border-t-transparent',
    maroon: 'border-maroon-700 border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.saffron}`}
      />
    </div>
  );
};

export default Spinner;
