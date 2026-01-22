interface Goal {
  id: string;
  title: string;
  targetValue?: number | null;
  currentValue?: number | null;
  unit?: string | null;
}

interface ActiveGoalsProps {
  goals: Goal[];
}

function getProgress(current: number | null | undefined, target: number | null | undefined): number {
  if (!target || target === 0) return 0;
  const currentVal = current || 0;
  return Math.min(100, Math.round((currentVal / target) * 100));
}

export function ActiveGoals({ goals }: ActiveGoalsProps) {
  if (goals.length === 0) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Aktywne cele</h2>
        <div className="text-center py-6">
          <svg
            className="mx-auto h-12 w-12 lg:h-14 lg:w-14 text-gray-400 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <p className="mt-2 text-sm lg:text-base text-gray-500 dark:text-gray-400">Brak aktywnych celów</p>
          <a
            href="/goals"
            className="mt-3 inline-block text-sm lg:text-base text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            Dodaj pierwszy cel
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100">Aktywne cele</h2>
        <a
          href="/goals"
          className="text-sm lg:text-base text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          Zarządzaj
        </a>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = getProgress(goal.currentValue, goal.targetValue);
          const hasTarget = goal.targetValue && goal.targetValue > 0;

          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 dark:text-gray-100 text-base lg:text-lg">{goal.title}</p>
                {hasTarget && (
                  <span className="text-sm lg:text-base text-gray-500 dark:text-gray-400">
                    {goal.currentValue || 0}/{goal.targetValue} {goal.unit}
                  </span>
                )}
              </div>
              {hasTarget && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
