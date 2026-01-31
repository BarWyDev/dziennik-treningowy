interface WeekSummaryProps {
  trainingsCount: number;
  totalDuration: number;
  totalCalories: number;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  return `${mins}min`;
}

export function WeekSummary({ trainingsCount, totalDuration, totalCalories }: WeekSummaryProps) {
  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 xl:p-5 h-full">
      <h2 className="text-base lg:text-lg xl:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Ten tydzień</h2>

      <div className="grid grid-cols-3 gap-3 xl:gap-4">
        <div className="text-center">
          <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-primary-600 dark:text-primary-400">{trainingsCount}</p>
          <p className="text-xs lg:text-sm xl:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {trainingsCount === 1 ? 'trening' : trainingsCount >= 2 && trainingsCount <= 4 ? 'treningi' : 'treningów'}
          </p>
        </div>

        <div className="text-center border-x border-gray-200 dark:border-gray-700">
          <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-primary-600 dark:text-primary-400">
            {totalDuration > 0 ? formatDuration(totalDuration) : '0min'}
          </p>
          <p className="text-xs lg:text-sm xl:text-sm text-gray-500 dark:text-gray-400 mt-1">łącznie</p>
        </div>

        <div className="text-center">
          <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-primary-600 dark:text-primary-400">
            {totalCalories > 0 ? totalCalories : '-'}
          </p>
          <p className="text-xs lg:text-sm xl:text-sm text-gray-500 dark:text-gray-400 mt-1">kcal</p>
        </div>
      </div>
    </div>
  );
}
