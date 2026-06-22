import React from 'react';
import Card from './Card';

const StatCard = ({
  label,
  value,
  icon: Icon,
  variant = 'neutral', // 'primary', 'success', 'warning', 'danger', 'neutral'
  className = '',
  ...props
}) => {
  const colorMaps = {
    primary: 'text-primary bg-primary/10 border-primary/10',
    success: 'text-success bg-success/10 border-success/10',
    warning: 'text-warning bg-warning/10 border-warning/10',
    danger: 'text-danger bg-danger/10 border-danger/10',
    neutral: 'text-textSecondary bg-surface border-border',
  };

  return (
    <Card
      variant="elevated"
      rounded="lg"
      className={`p-5 flex items-center justify-between hover:border-primary/20 ${className}`}
      {...props}
    >
      <div className="min-w-0">
        <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block truncate">
          {label}
        </span>
        <p className="mt-1 text-2xl font-extrabold text-white tracking-tight leading-none">
          {value}
        </p>
      </div>
      {Icon && (
        <div className={`rounded-lg p-2.5 border ${colorMaps[variant] || colorMaps.neutral}`}>
          <Icon className="h-4.5 w-4.5 shrink-0" />
        </div>
      )}
    </Card>
  );
};

export default StatCard;
