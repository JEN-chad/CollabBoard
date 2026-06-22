import React from 'react';

const SectionHeader = ({
  title,
  description,
  actions,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 ${className}`}
      {...props}
    >
      <div className="min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-xs text-textSecondary leading-normal">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
