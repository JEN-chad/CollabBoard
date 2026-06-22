import React from 'react';
import Button from './Button';
import { Plus } from 'lucide-react';

const EmptyState = ({
  title,
  description,
  actionText,
  onActionClick,
  icon: Icon,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-[#090d16]/30 max-w-md mx-auto animate-fade-in ${className}`}>
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface border border-border text-primary shadow-sm mb-4">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <h3 className="text-base font-semibold text-textPrimary tracking-tight">
        {title}
      </h3>
      <p className="mt-1 text-xs text-textSecondary leading-relaxed">
        {description}
      </p>
      {actionText && onActionClick && (
        <Button
          onClick={onActionClick}
          variant="solid"
          size="sm"
          className="mt-5"
          icon={Plus}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
