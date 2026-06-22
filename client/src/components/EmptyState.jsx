import React from 'react';
import { Plus } from 'lucide-react';

const EmptyState = ({ 
  title, 
  description, 
  actionText, 
  onActionClick, 
  icon: Icon 
}) => {
  return (
    <div className="rounded-xl border border-gray-800/80 bg-[#101422]/20 p-12 text-center backdrop-blur-sm animate-fade-in flex flex-col items-center justify-center max-w-lg mx-auto">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#161a27]/80 text-brand-400 mb-5 border border-gray-800 shadow-md">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
        {description}
      </p>
      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          className="mt-6 flex items-center gap-2 rounded-lg bg-brand-600 px-4.5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-500 shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
