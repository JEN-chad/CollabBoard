import React from 'react';

const Card = ({
  children,
  variant = 'default', // 'default' (surface), 'elevated' (elevated), 'glass' (backdrop blur)
  hover = false,
  rounded = 'lg', // 'lg' (12px), 'xl' (16px), '2xl' (24px)
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'border border-border text-textPrimary transition-all duration-200';
  
  const variants = {
    default: 'bg-surface',
    elevated: 'bg-elevated',
    glass: 'bg-surface/40 backdrop-blur-md',
  };

  const roundedClasses = {
    lg: 'rounded-xl', // 12px
    xl: 'rounded-2xl', // 16px
    '2xl': 'rounded-[24px]', // 24px
  };

  const hoverStyles = hover 
    ? 'hover:border-primary/45 hover:shadow-lg hover:shadow-primary/5 hover:translate-y-[-2px]' 
    : '';

  const cursorStyle = onClick ? 'cursor-pointer active:scale-[0.995]' : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${roundedClasses[rounded]} ${hoverStyles} ${cursorStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
