import React from 'react';

const Skeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-slate-800 rounded-md ${className}`} />
  );
};

export default Skeleton;
export { Skeleton };
