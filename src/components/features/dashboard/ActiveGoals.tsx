interface Goal {
  id: string;
  title: string;
  targetValue?: number | null;
  currentValue?: number | null;
  unit?: string | null;
  deadline?: string | null;
  createdAt: string;
  lowerIsBetter?: boolean | null;
}

interface ActiveGoalsProps {
  goals: Goal[];
}

function getProgress(
  current: number | null | undefined,
  target: number | null | undefined,
  lowerIsBetter: boolean | null | undefined
): number {
  if (!target || target === 0) return 0;
  if (lowerIsBetter) {
    const currentVal = current || 0;
    if (currentVal === 0) return 0;
    return Math.min(100, Math.round((target / currentVal) * 100));
  }
  const currentVal = current || 0;
  return Math.min(100, Math.round((currentVal / target) * 100));
}

function getTimeProgress(createdAt: string, deadline: string | null | undefined): number {
  if (!deadline) return 0;

  const now = new Date();
  const start = new Date(createdAt);
  const end = new Date(deadline);

  const totalTime = end.getTime() - start.getTime();
  const elapsedTime = now.getTime() - start.getTime();

  if (totalTime <= 0) return 100;

  const progress = (elapsedTime / totalTime) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

function getRemainingDays(deadline: string | null | undefined): number | null {
  if (!deadline) return null;

  const now = new Date();
  const end = new Date(deadline);

  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ActiveGoals({ goals }: ActiveGoalsProps) {
  if (goals.length === 0) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 xl:p-5">
        <h2 className="text-base lg:text-lg xl:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Aktywne cele</h2>
        <div className="text-center py-4 xl:py-6">
          <svg
            className="mx-auto h-10 w-10 lg:h-12 lg:w-12 xl:h-12 xl:w-12 text-gray-400 dark:text-gray-600"
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
          <p className="mt-2 text-xs lg:text-sm xl:text-sm text-gray-500 dark:text-gray-400">Brak aktywnych celów</p>
          <a
            href="/goals"
            className="mt-2 inline-block text-xs lg:text-sm xl:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            Dodaj pierwszy cel
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 xl:p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base lg:text-lg xl:text-lg font-semibold text-gray-900 dark:text-gray-100">Aktywne cele</h2>
        <a
          href="/goals"
          className="text-xs lg:text-sm xl:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          Zarządzaj
        </a>
      </div>

      <div className="space-y-3 xl:space-y-3.5">
        {goals.map((goal) => {
          const valueProgress = getProgress(goal.currentValue, goal.targetValue, goal.lowerIsBetter);
          const timeProgress = getTimeProgress(goal.createdAt, goal.deadline);
          const remainingDays = getRemainingDays(goal.deadline);
          const hasTarget = goal.targetValue && goal.targetValue > 0;
          const hasDeadline = !!goal.deadline;

          return (
            <div key={goal.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm lg:text-base xl:text-base">{goal.title}</p>
              </div>
              {hasTarget && (
                <div className="mt-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {goal.lowerIsBetter ? (
                        <>Wynik: {goal.currentValue ?? 0} {goal.unit} → cel: ≤{goal.targetValue} {goal.unit}</>
                      ) : (
                        <>Postęp: {goal.currentValue || 0} / {goal.targetValue} {goal.unit}</>
                      )}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{valueProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-primary-600 dark:bg-primary-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${valueProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {hasDeadline && (
                <div className="mt-1.5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {remainingDays !== null && remainingDays > 0 && (
                        <span>Pozostało {remainingDays} {remainingDays === 1 ? 'dzień' : remainingDays < 5 ? 'dni' : 'dni'}</span>
                      )}
                      {remainingDays !== null && remainingDays === 0 && (
                        <span className="text-warning-600 dark:text-warning-400 font-medium">Ostatni dzień!</span>
                      )}
                      {remainingDays !== null && remainingDays < 0 && (
                        <span className="text-error-600 dark:text-error-400 font-medium">Termin minął</span>
                      )}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{timeProgress}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">
                      do {formatDate(goal.deadline!)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        timeProgress >= 100
                          ? 'bg-error-500 dark:bg-error-400'
                          : timeProgress >= 75
                          ? 'bg-warning-500 dark:bg-warning-400'
                          : 'bg-primary-600 dark:bg-primary-500'
                      }`}
                      style={{ width: `${timeProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
