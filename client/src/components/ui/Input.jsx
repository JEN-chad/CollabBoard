import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconClick,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-textSecondary select-none">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {LeftIcon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-textSecondary pointer-events-none">
            <LeftIcon className="h-4.5 w-4.5" />
          </span>
        )}
        
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full rounded-lg border bg-[#090d16] py-2.5 text-sm text-textPrimary placeholder-gray-600 outline-none transition-all duration-200 min-h-[44px]
            ${LeftIcon ? 'pl-11' : 'pl-4'} 
            ${RightIcon ? 'pr-11' : 'pr-4'}
            ${error 
              ? 'border-danger/60 focus:border-danger focus:ring-1 focus:ring-danger/20' 
              : 'border-border focus:border-primary/80 focus:ring-1 focus:ring-primary/20'
            }
            disabled:opacity-50 disabled:cursor-not-allowed`}
          {...props}
        />

        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            disabled={disabled}
            className={`absolute inset-y-0 right-0 flex items-center pr-3.5 text-textSecondary hover:text-textPrimary transition-colors ${
              onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'
            }`}
          >
            <RightIcon className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {error && (
        <span className="text-xs text-danger font-medium animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
