import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { safeJsonParse } from '@/lib/client-helpers';

interface TrainingType {
  id: string;
  name: string;
}

interface Filters {
  startDate?: string;
  endDate?: string;
  trainingTypeId?: string;
}

interface TrainingFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function TrainingFilters({ filters, onFiltersChange }: TrainingFiltersProps) {
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await fetch('/api/training-types');
        if (response.ok) {
          const result = await safeJsonParse(response);
          if (result) {
            // Endpoint zwraca { data, page, limit } po dodaniu paginacji
            const types = result.data || result;
            setTrainingTypes(Array.isArray(types) ? types : []);
          }
        }
      } catch {
        // Error fetching training types - silent fail
      }
    };

    fetchTypes();
  }, []);

  const typeOptions = [
    { value: '', label: 'Wszystkie typy' },
    ...trainingTypes.map((type) => ({
      value: type.id,
      label: type.name,
    })),
  ];

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.startDate || filters.endDate || filters.trainingTypeId;

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
      <button
        type="button"
        className="flex items-center justify-between w-full"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="font-medium text-gray-700 dark:text-gray-300 text-base lg:text-lg">Filtry</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs lg:text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">
              Aktywne
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 lg:w-6 lg:h-6 text-gray-400 dark:text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                Od daty
              </label>
              <Input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, startDate: e.target.value || undefined })
                }
              />
            </div>
            <div>
              <label className="block text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                Do daty
              </label>
              <Input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, endDate: e.target.value || undefined })
                }
              />
            </div>
            <div>
              <label className="block text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                Typ treningu
              </label>
              <Select
                options={typeOptions}
                value={filters.trainingTypeId || ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    trainingTypeId: e.target.value || undefined,
                  })
                }
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Wyczyść filtry
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
