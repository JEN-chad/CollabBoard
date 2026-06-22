import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // 'sm' (380px), 'md' (512px), 'lg' (768px)
  className = '',
}) => {
  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className={`relative w-full ${sizes[size]} bg-surface border-t sm:border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 z-10 animate-scale-up max-h-[90vh] sm:max-h-[85vh] flex flex-col ${className}`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 flex-shrink-0">
          {title && (
            <h3 className="text-lg font-bold text-textPrimary tracking-tight">
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-[#1e293b]/55 transition-colors border border-transparent hover:border-border"
            aria-label="Close modal"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
