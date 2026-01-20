interface TrainingType {
  id: string;
  name: string;
}

interface Training {
  id: string;
  date: string;
  durationMinutes: number;
  trainingType?: TrainingType | null;
}

interface RecentTrainingsProps {
  trainings: Training[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateString === today.toISOString().split('T')[0]) {
    return 'Dzisiaj';
  }
  if (dateString === yesterday.toISOString().split('T')[0]) {
    return 'Wczoraj';
  }

  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
  });
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  return `${mins}min`;
}

export function RecentTrainings({ trainings }: RecentTrainingsProps) {
  if (trainings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ostatnie treningi</h2>
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">Brak treningów do wyświetlenia</p>
          <a
            href="/trainings/new"
            className="mt-3 inline-block text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Dodaj pierwszy trening
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Ostatnie treningi</h2>
        <a
          href="/trainings"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Zobacz wszystkie
        </a>
      </div>

      <div className="space-y-3">
        {trainings.map((training) => (
          <a
            key={training.id}
            href={`/trainings/${training.id}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="font-medium text-gray-900">
                {training.trainingType?.name || 'Trening'}
              </p>
              <p className="text-sm text-gray-500">{formatDate(training.date)}</p>
            </div>
            <span className="text-sm font-medium text-primary-600">
              {formatDuration(training.durationMinutes)}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
