import { jsxs, jsx } from 'react/jsx-runtime';
import { forwardRef } from 'react';

const Select = forwardRef(
  ({ className = "", error, options, placeholder, ...props }, ref) => {
    const baseStyles = `block w-full rounded-lg border px-3 py-2 text-sm lg:text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")] bg-[length:1.5rem_1.5rem] bg-[right_0.5rem_center] bg-no-repeat pr-10`;
    const stateStyles = error ? "border-error-500 dark:border-error-600 focus:border-error-500 focus:ring-error-500" : "border-gray-300 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500";
    return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
      /* @__PURE__ */ jsxs(
        "select",
        {
          ref,
          className: `${baseStyles} ${stateStyles} ${className}`,
          ...props,
          children: [
            placeholder && /* @__PURE__ */ jsx("option", { value: "", disabled: true, children: placeholder }),
            options.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
          ]
        }
      ),
      error && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm lg:text-base text-error-600 dark:text-error-400", children: error })
    ] });
  }
);
Select.displayName = "Select";

export { Select as S };
