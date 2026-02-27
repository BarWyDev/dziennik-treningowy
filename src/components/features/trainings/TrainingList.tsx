import { useState, useEffect } from 'react';
import { TrainingCard } from './TrainingCard';
import { TrainingFilters } from './TrainingFilters';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { safeJsonParse, parseErrorResponse } from '@/lib/client-helpers';

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
  durationMinutes?: number | null;
  notes?: string | null;
  rating?: number | null;
  caloriesBurned?: number | null;
  trainingType?: TrainingType | null;
  media?: MediaAttachment[];
}

interface Filters {
  startDate?: string;
  endDate?: string;
  trainingTypeId?: string;
}

export function TrainingList() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTrainings = async (currentPage: number, currentFilters: Filters, append = false) => {
    setIsLoading(true);
    if (!append) {
      setError(null);
    }

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });

      if (currentFilters.startDate) params.set('startDate', currentFilters.startDate);
      if (currentFilters.endDate) params.set('endDate', currentFilters.endDate);
      if (currentFilters.trainingTypeId) params.set('trainingTypeId', currentFilters.trainingTypeId);

      const response = await fetch(`/api/trainings?${params}`);

      if (response.ok) {
        const data = await safeJsonParse(response);
        if (data) {
          // Użyj functional update aby uniknąć stale closure
          setTrainings((prev) => (append ? [...prev, ...data.data] : data.data));
          setHasMore(data.data.length === 20);
        }
      } else {
        const errorMessage = await parseErrorResponse(response);
        setError(errorMessage);
      }
    } catch (err) {
      setError('Nie udało się pobrać treningów. Sprawdź połączenie z internetem.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchTrainings(1, filters);
  }, [filters]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTrainings(nextPage, filters, true);
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  if (isLoading && trainings.length === 0) {
    return (
      <div className="space-y-4">
        <TrainingFilters filters={filters} onFiltersChange={handleFiltersChange} />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <div className="space-y-4">
      <TrainingFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {error && (
        <Alert variant="error">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="secondary" onClick={() => fetchTrainings(page, filters)}>
              Spróbuj ponownie
            </Button>
          </div>
        </Alert>
      )}

      {trainings.length === 0 && !error ? (
        <EmptyState />
      ) : (
        <>
          {(() => {
            const today = new Date().toISOString().split('T')[0];
            const upcoming = trainings
              .filter((t) => t.date > today)
              .sort((a, b) => a.date.localeCompare(b.date));
            const past = trainings.filter((t) => t.date <= today);

            return (
              <>
                {upcoming.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Nadchodzące ({upcoming.length})
                    </h2>
                    {upcoming.map((training) => (
                      <TrainingCard key={training.id} training={training} />
                    ))}
                  </div>
                )}

                {past.length > 0 && (
                  <div className="space-y-3">
                    {upcoming.length > 0 && (
                      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-2">
                        Historia
                      </h2>
                    )}
                    {past.map((training) => (
                      <TrainingCard key={training.id} training={training} />
                    ))}
                  </div>
                )}
              </>
            );
          })()}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="secondary" onClick={handleLoadMore} isLoading={isLoading}>
                Załaduj więcej
              </Button>
            </div>
          )}
        </>
      )}
    </div>
    </ErrorBoundary>
  );
}
