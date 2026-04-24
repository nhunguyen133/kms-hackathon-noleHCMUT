import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  loading = false, 
  ...props 
}) => {
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    outline: 'border border-slate-600 hover:bg-slate-800 text-slate-200',
    ghost: 'hover:bg-slate-800 text-slate-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button
      disabled={loading}
      className={twMerge(
        'relative px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2',
        variants[variant],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
