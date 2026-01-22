import { jsxs, jsx } from 'react/jsx-runtime';
import { forwardRef } from 'react';

const Label = forwardRef(
  ({ className = "", required, children, ...props }, ref) => {
    return /* @__PURE__ */ jsxs(
      "label",
      {
        ref,
        className: `block text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 mb-1 ${className}`,
        ...props,
        children: [
          children,
          required && /* @__PURE__ */ jsx("span", { className: "text-error-500 dark:text-error-400 ml-1", children: "*" })
        ]
      }
    );
  }
);
Label.displayName = "Label";

export { Label as L };
