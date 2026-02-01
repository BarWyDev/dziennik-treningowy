import { useState, useEffect } from 'react';

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
          const result = await response.json();
          // Endpoint zwraca { data, page, limit } po dodaniu paginacji
          const types = result.data || result;
          setTrainingTypes(Array.isArray(types) ? types : []);
        }
      } catch {
        console.error('Error fetching training types');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainingTypes();
  }, []);

  return { trainingTypes, isLoading };
}
