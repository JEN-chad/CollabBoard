import React from 'react';

const PageContainer = ({
  children,
  className = '',
  clean = false,
  ...props
}) => {
  return (
    <div
      className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${
        clean ? '' : 'max-w-7xl py-8'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default PageContainer;
