import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    const baseStyles = 'block w-full rounded-lg border px-3 py-2 text-sm lg:text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed';

    const stateStyles = error
      ? 'border-error-500 dark:border-error-600 focus:border-error-500 focus:ring-error-500'
      : 'border-gray-300 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500';

    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`${baseStyles} ${stateStyles} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm lg:text-base text-error-600 dark:text-error-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
