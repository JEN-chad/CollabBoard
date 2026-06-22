import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'solid',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none rounded-lg active:scale-[0.98]';

  const variants = {
    solid: 'bg-primary hover:bg-indigo-500 text-white shadow-md shadow-primary/10 hover:shadow-primary/20',
    outline: 'border border-border bg-transparent hover:bg-surface text-textPrimary hover:text-white',
    ghost: 'bg-transparent hover:bg-surface text-textSecondary hover:text-white',
    danger: 'bg-danger hover:bg-red-500 text-white shadow-md shadow-danger/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs min-h-[36px]',
    md: 'px-4 py-2 text-sm min-h-[44px]', // Mobile friendly minimum tap target
    lg: 'px-6 py-3 text-base min-h-[48px]',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {size !== 'sm' && <span>Loading...</span>}
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          {children}
        </span>
      )}
    </button>
  );
};

export default Button;
