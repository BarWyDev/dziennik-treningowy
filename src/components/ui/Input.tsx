import { type InputHTMLAttributes, forwardRef, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    // Większy border-radius dla date/time pickerów
    const isDateOrTime = type === 'date' || type === 'time' || type === 'datetime-local';
    const borderRadiusClass = isDateOrTime ? 'rounded-xl' : 'rounded-lg';

    const baseStyles = `block w-full ${borderRadiusClass} border px-3 py-2 text-sm lg:text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed`;

    const stateStyles = error
      ? 'border-error-500 dark:border-error-600 focus:border-error-500 focus:ring-error-500'
      : 'border-gray-300 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500';

    return (
      <div className="w-full">
        <div className="relative">
          <input
            ref={ref}
            type={isPassword && showPassword ? 'text' : type}
            className={`${baseStyles} ${stateStyles} ${isPassword ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
              tabIndex={-1}
              aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 lg:h-5 lg:w-5">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 lg:h-5 lg:w-5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-sm lg:text-base text-error-600 dark:text-error-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
