import { useState, useEffect } from 'react';
import { safeJsonParse } from '@/lib/client-helpers';

interface TrainingType {
  id: string;
  name: string;
  isDefault: boolean;
}

export function useTrainingTypes() {
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrainingTypes = async () => {
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainingTypes();
  }, []);

  return { trainingTypes, isLoading };
}
