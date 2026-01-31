import { normalizeMediaUrl } from '@/lib/utils/media';

interface TrainingType {
  id: string;
  name: string;
  icon?: string | null;
}

interface MediaAttachment {
  id: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
}

interface Training {
  id: string;
  date: string;
  durationMinutes: number;
  notes?: string | null;
  rating?: number | null;
  caloriesBurned?: number | null;
  trainingType?: TrainingType | null;
  media?: MediaAttachment[];
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
  const images = training.media?.filter((m) => m.fileType === 'image') || [];
  const videos = training.media?.filter((m) => m.fileType === 'video') || [];
  const hasMedia = images.length > 0 || videos.length > 0;

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

      {/* Media preview - pokazuje miniatury */}
      {hasMedia && (
        <div className="mt-3 flex gap-2 items-center">
          <div className="flex -space-x-2 overflow-hidden">
            {images.slice(0, 3).map((img) => (
              <img
                key={img.id}
                src={normalizeMediaUrl(img.fileUrl)}
                alt={img.fileName}
                className="inline-block h-10 w-10 rounded-lg ring-2 ring-white dark:ring-gray-800 object-cover"
              />
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {images.length > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {images.length}
              </span>
            )}
            {videos.length > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {videos.length}
              </span>
            )}
          </div>
        </div>
      )}

      {training.notes && (
        <p className="mt-3 text-sm lg:text-base text-gray-600 dark:text-gray-300 line-clamp-2">{training.notes}</p>
      )}
    </a>
  );
}
