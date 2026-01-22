import { type LabelHTMLAttributes, forwardRef } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 mb-1 ${className}`}
        {...props}
      >
        {children}
        {required && <span className="text-error-500 dark:text-error-400 ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';

export { Label };
