import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { ExportButton } from '@/components/features/pdf/ExportButton';

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

export function TrainingDetails({ training }: TrainingDetailsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {training.trainingType?.name || 'Trening'}
              </h1>
              <p className="text-gray-500 mt-1">{formatDate(training.date)}</p>
            </div>
            <div className="flex gap-2">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Czas trwania</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatDuration(training.durationMinutes)}
              </p>
            </div>

            {training.rating && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Ocena</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < training.rating!
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            )}

            {training.caloriesBurned && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Spalone kalorie</p>
                <p className="text-xl font-semibold text-gray-900">
                  {training.caloriesBurned} kcal
                </p>
              </div>
            )}
          </div>

          {training.notes && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Notatki</p>
              <p className="text-gray-700 whitespace-pre-wrap">{training.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <a href="/trainings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
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
