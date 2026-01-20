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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aktywne cele</h2>
        <div className="text-center py-6">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <p className="mt-2 text-sm text-gray-500">Brak aktywnych celów</p>
          <a
            href="/goals"
            className="mt-3 inline-block text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Dodaj pierwszy cel
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Aktywne cele</h2>
        <a
          href="/goals"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
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
                <p className="font-medium text-gray-900">{goal.title}</p>
                {hasTarget && (
                  <span className="text-sm text-gray-500">
                    {goal.currentValue || 0}/{goal.targetValue} {goal.unit}
                  </span>
                )}
              </div>
              {hasTarget && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
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
