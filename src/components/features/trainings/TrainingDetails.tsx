import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { ExportButton } from '@/components/features/pdf/ExportButton';
import { MediaGallery } from '@/components/features/media/MediaGallery';
import type { MediaAttachment } from '@/lib/db/schema';

interface TrainingType {
  id: string;
  name: string;
  icon?: string | null;
}

interface Training {
  id: string;
  date: string;
  time?: string | null;
  durationMinutes: number;
  ratingOverall: number;
  ratingPhysical?: number | null;
  ratingEnergy?: number | null;
  ratingMotivation?: number | null;
  ratingDifficulty?: number | null;
  trainingGoal?: string | null;
  mostSatisfiedWith?: string | null;
  improveNextTime?: string | null;
  howToImprove?: string | null;
  notes?: string | null;
  caloriesBurned?: number | null;
  trainingType?: TrainingType | null;
  media?: MediaAttachment[];
  createdAt: string;
  updatedAt: string;
}

interface TrainingDetailsProps {
  training: Training;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  return `${mins} minut`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 lg:w-6 lg:h-6 ${
            i < rating ? 'text-yellow-400 fill-yellow-400 dark:text-yellow-500 dark:fill-yellow-500' : 'text-gray-300 dark:text-gray-700'
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-2 text-sm lg:text-base text-gray-600 dark:text-gray-400">{rating}/5</span>
    </div>
  );
}

export function TrainingDetails({ training }: TrainingDetailsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState<MediaAttachment[]>(training.media || []);

  const handleMediaDelete = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/media/${mediaId}`, { method: 'DELETE' });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: { message: 'Nie udało się usunąć pliku' }
        }));
        throw new Error(errorData.error?.message || 'Nie udało się usunąć pliku');
      }

      // Tylko jeśli sukces - usuń ze stanu
      setMedia((prev) => prev.filter((m) => m.id !== mediaId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/trainings/${training.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Nie udało się usunąć treningu');
      }

      window.location.href = '/trainings';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div>
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {training.trainingType?.name || 'Trening'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-base lg:text-lg">
                {formatDate(training.date)}
                {training.time && ` • ${training.time}`}
              </p>
            </div>
            <div className="flex gap-2">
              <ExportButton training={training} />
              <a href={`/trainings/${training.id}/edit`}>
                <Button variant="secondary" size="sm">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edytuj
                </Button>
              </a>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Usuń
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-1">Czas trwania</p>
              <p className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {formatDuration(training.durationMinutes)}
              </p>
            </div>

            {training.caloriesBurned && (
              <div>
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mb-1">Spalone kalorie</p>
                <p className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {training.caloriesBurned} kcal
                </p>
              </div>
            )}
          </div>

          {/* Training Goal */}
          {training.trainingGoal && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm lg:text-base font-medium text-blue-900 dark:text-blue-300 mb-2">
                🎯 Cel treningu (mentalny i fizyczny)
              </p>
              <p className="text-sm lg:text-base text-blue-800 dark:text-blue-200 whitespace-pre-wrap">{training.trainingGoal}</p>
            </div>
          )}

          {/* Ratings Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="font-semibold text-base lg:text-lg text-gray-900 dark:text-gray-100 mb-4">Oceny</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2">Ogólne zadowolenie</p>
                <RatingStars rating={training.ratingOverall} />
              </div>

              {training.ratingPhysical && (
                <div>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2">Samopoczucie fizyczne</p>
                  <RatingStars rating={training.ratingPhysical} />
                </div>
              )}

              {training.ratingEnergy && (
                <div>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2">Poziom energii</p>
                  <RatingStars rating={training.ratingEnergy} />
                </div>
              )}

              {training.ratingMotivation && (
                <div>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2">Motywacja</p>
                  <RatingStars rating={training.ratingMotivation} />
                </div>
              )}

              {training.ratingDifficulty && (
                <div>
                  <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2">Trudność treningu</p>
                  <RatingStars rating={training.ratingDifficulty} />
                </div>
              )}
            </div>
          </div>

          {/* Reflection Section */}
          {(training.mostSatisfiedWith || training.improveNextTime || training.howToImprove) && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-semibold text-base lg:text-lg text-gray-900 dark:text-gray-100 mb-4">Refleksja po treningu</h3>
              <div className="space-y-4">
                {training.mostSatisfiedWith && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm lg:text-base font-medium text-green-900 dark:text-green-300 mb-2">
                      😊 Z czego jestem najbardziej zadowolony?
                    </p>
                    <p className="text-sm lg:text-base text-green-800 dark:text-green-200 whitespace-pre-wrap">
                      {training.mostSatisfiedWith}
                    </p>
                  </div>
                )}

                {training.improveNextTime && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm lg:text-base font-medium text-amber-900 dark:text-amber-300 mb-2">
                      📈 Co następnym razem chcę zrobić lepiej?
                    </p>
                    <p className="text-sm lg:text-base text-amber-800 dark:text-amber-200 whitespace-pre-wrap">
                      {training.improveNextTime}
                    </p>
                  </div>
                )}

                {training.howToImprove && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <p className="text-sm lg:text-base font-medium text-purple-900 dark:text-purple-300 mb-2">
                      💡 Jak mogę to zrobić?
                    </p>
                    <p className="text-sm lg:text-base text-purple-800 dark:text-purple-200 whitespace-pre-wrap">
                      {training.howToImprove}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Media Gallery */}
          {media.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-semibold text-base lg:text-lg text-gray-900 dark:text-gray-100 mb-4">
                Zdjęcia i filmy
              </h3>
              <MediaGallery
                media={media}
                onDelete={handleMediaDelete}
                canDelete={true}
              />
            </div>
          )}

          {/* Additional Notes */}
          {training.notes && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <p className="text-sm lg:text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                Dodatkowe uwagi i komentarze
              </p>
              <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{training.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <a href="/trainings" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm lg:text-base font-medium">
          &larr; Powrót do listy treningów
        </a>
      </div>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
