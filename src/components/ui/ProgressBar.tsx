interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  label?: string;
  showPercentage?: boolean;
}

/**
 * Reusable progress bar component
 */
export function ProgressBar({
  progress,
  className = '',
  label,
  showPercentage = true,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
