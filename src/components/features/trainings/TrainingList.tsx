import { useState, useEffect } from 'react';
import { TrainingCard } from './TrainingCard';
import { TrainingFilters } from './TrainingFilters';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/ui/Button';

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

interface Filters {
  startDate?: string;
  endDate?: string;
  trainingTypeId?: string;
}

export function TrainingList() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTrainings = async (currentPage: number, currentFilters: Filters, append = false) => {
    setIsLoading(true);

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
        const data = await response.json();
        setTrainings(append ? [...trainings, ...data.data] : data.data);
        setHasMore(data.data.length === 20);
      }
    } catch {
      console.error('Error fetching trainings');
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
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TrainingFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {trainings.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="space-y-3">
            {trainings.map((training) => (
              <TrainingCard key={training.id} training={training} />
            ))}
          </div>

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
  );
}
