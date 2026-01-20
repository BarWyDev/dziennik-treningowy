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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Ten tydzień</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-primary-600">{trainingsCount}</p>
          <p className="text-sm text-gray-500 mt-1">
            {trainingsCount === 1 ? 'trening' : trainingsCount >= 2 && trainingsCount <= 4 ? 'treningi' : 'treningów'}
          </p>
        </div>

        <div className="text-center border-x border-gray-200">
          <p className="text-3xl font-bold text-primary-600">
            {totalDuration > 0 ? formatDuration(totalDuration) : '0min'}
          </p>
          <p className="text-sm text-gray-500 mt-1">łącznie</p>
        </div>

        <div className="text-center">
          <p className="text-3xl font-bold text-primary-600">
            {totalCalories > 0 ? totalCalories : '-'}
          </p>
          <p className="text-sm text-gray-500 mt-1">kcal</p>
        </div>
      </div>
    </div>
  );
}
