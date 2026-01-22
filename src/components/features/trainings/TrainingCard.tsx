interface TrainingType {
  id: string;
  name: string;
  icon?: string | null;
}

interface Training {
  id: string;
  date: string;
  durationMinutes: number;
  notes?: string | null;
  rating?: number | null;
  caloriesBurned?: number | null;
  trainingType?: TrainingType | null;
}

interface TrainingCardProps {
  training: Training;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  return `${mins}min`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function TrainingCard({ training }: TrainingCardProps) {
  return (
    <a
      href={`/trainings/${training.id}`}
      className="block bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100">
              {training.trainingType?.name || 'Trening'}
            </span>
            {training.rating && (
              <div className="flex items-center gap-0.5">
                {[...Array(training.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400 fill-yellow-400 dark:text-yellow-500 dark:fill-yellow-500"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">{formatDate(training.date)}</p>
        </div>
        <div className="text-right">
          <p className="text-lg lg:text-xl font-semibold text-primary-600 dark:text-primary-400">
            {formatDuration(training.durationMinutes)}
          </p>
          {training.caloriesBurned && (
            <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400">{training.caloriesBurned} kcal</p>
          )}
        </div>
      </div>
      {training.notes && (
        <p className="mt-3 text-sm lg:text-base text-gray-600 dark:text-gray-300 line-clamp-2">{training.notes}</p>
      )}
    </a>
  );
}
