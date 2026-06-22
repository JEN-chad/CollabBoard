import React from 'react';

const Skeleton = ({
  variant = 'text', // 'text', 'circular', 'rectangular'
  width = 'w-full',
  height = 'h-4',
  className = '',
}) => {
  const baseStyles = 'shimmer-bg rounded';
  
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${width} ${height} ${className}`}
    />
  );
};

export default Skeleton;
