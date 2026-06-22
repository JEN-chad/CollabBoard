import React from 'react';

const Badge = ({
  children,
  variant = 'neutral', // 'primary', 'success', 'warning', 'danger', 'neutral'
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border select-none';

  const variants = {
    primary: 'text-primary bg-primary/10 border-primary/15',
    success: 'text-success bg-success/10 border-success/15',
    warning: 'text-warning bg-warning/10 border-warning/15',
    danger: 'text-danger bg-danger/10 border-danger/15',
    neutral: 'text-textSecondary bg-surface border-border',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon className="h-2.5 w-2.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
