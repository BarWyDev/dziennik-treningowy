import { jsx, jsxs } from 'react/jsx-runtime';
import { useEffect } from 'react';

function Dialog({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "flex min-h-full items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative bg-white dark:bg-[#161b22] rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all border border-gray-200 dark:border-gray-800", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100", children: title }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors",
            onClick: onClose,
            children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 lg:w-6 lg:h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M6 18L18 6M6 6l12 12"
              }
            ) })
          }
        )
      ] }),
      children
    ] })
  ] }) });
}

export { Dialog as D };
