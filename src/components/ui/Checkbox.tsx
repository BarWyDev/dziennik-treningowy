import { type InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string;
  label: React.ReactNode;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', error, label, id, ...props }, ref) => {
    return (
      <div className={className}>
        <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className={`mt-0.5 h-4 w-4 shrink-0 rounded border bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
              error
                ? 'border-error-500 dark:border-error-600 text-error-600'
                : 'border-gray-300 dark:border-gray-600 text-primary-600'
            }`}
            {...props}
          />
          <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug select-none">
            {label}
          </span>
        </label>
        {error && <p className="mt-1 ml-7 text-sm text-error-600 dark:text-error-400">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
