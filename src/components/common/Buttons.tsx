import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  className = '',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'py-2 px-4 text-xs font-semibold rounded-xl gap-1.5',
    md: 'py-3.5 px-6 text-sm sm:text-base font-semibold rounded-2xl gap-2 min-h-[48px]',
    lg: 'py-4 px-8 text-base sm:text-lg font-bold rounded-2xl gap-2.5 min-h-[54px]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-sm
        bg-[#005B49] text-white hover:bg-[#004739] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export const SecondaryButton: React.FC<ButtonProps> = ({
  children,
  className = '',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'py-2 px-4 text-xs font-medium rounded-xl gap-1.5',
    md: 'py-3.5 px-6 text-sm sm:text-base font-semibold rounded-2xl gap-2 min-h-[48px]',
    lg: 'py-4 px-8 text-base font-bold rounded-2xl gap-2.5 min-h-[54px]',
  };

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-all duration-200 active:scale-[0.98] cursor-pointer
        bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs
        ${fullWidth ? 'w-full' : ''} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

export const OutlineButton: React.FC<ButtonProps> = ({
  children,
  className = '',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-200 active:scale-[0.98] cursor-pointer
        bg-transparent border-2 border-[#005B49] text-[#005B49] font-bold rounded-2xl hover:bg-[#005B49]/5
        ${fullWidth ? 'w-full' : ''} py-3.5 px-6 text-sm sm:text-base min-h-[48px] gap-2 ${className}`}
      {...props}
    >
      {leftIcon && <span>{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};
