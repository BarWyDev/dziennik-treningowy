import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTrainingSchema, type CreateTrainingInput } from '@/lib/validations/training';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { RatingInput } from './RatingInput';
import { DurationPicker } from './DurationPicker';

interface TrainingType {
  id: string;
  name: string;
  isDefault: boolean;
}

interface Training {
  id: string;
  trainingTypeId: string;
  date: string;
  durationMinutes: number;
  notes?: string | null;
  rating?: number | null;
  caloriesBurned?: number | null;
}

interface TrainingFormProps {
  training?: Training;
  onSuccess?: () => void;
}

export function TrainingForm({ training, onSuccess }: TrainingFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);

  const isEditing = !!training;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CreateTrainingInput>({
    resolver: zodResolver(createTrainingSchema),
    defaultValues: {
      trainingTypeId: training?.trainingTypeId || '',
      date: training?.date || new Date().toISOString().split('T')[0],
      durationMinutes: training?.durationMinutes || 30,
      notes: training?.notes || '',
      rating: training?.rating || undefined,
      caloriesBurned: training?.caloriesBurned || undefined,
    },
  });

  useEffect(() => {
    const fetchTrainingTypes = async () => {
      try {
        const response = await fetch('/api/training-types');
        if (response.ok) {
          const data = await response.json();
          setTrainingTypes(data);
        }
      } catch {
        console.error('Error fetching training types');
      } finally {
        setIsLoadingTypes(false);
      }
    };

    fetchTrainingTypes();
  }, []);

  const onSubmit = async (data: CreateTrainingInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = isEditing ? `/api/trainings/${training.id}` : '/api/trainings';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Wystąpił błąd');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = '/trainings';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setIsLoading(false);
    }
  };

  const typeOptions = trainingTypes.map((type) => ({
    value: type.id,
    label: type.name,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <Label htmlFor="trainingTypeId" required>
          Typ treningu
        </Label>
        {isLoadingTypes ? (
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <Select
            id="trainingTypeId"
            options={typeOptions}
            placeholder="Wybierz typ treningu"
            error={errors.trainingTypeId?.message}
            {...register('trainingTypeId')}
          />
        )}
      </div>

      <div>
        <Label htmlFor="date" required>
          Data
        </Label>
        <Input
          id="date"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
      </div>

      <div>
        <Label required>Czas trwania</Label>
        <Controller
          name="durationMinutes"
          control={control}
          render={({ field }) => (
            <DurationPicker
              value={field.value}
              onChange={field.onChange}
              error={errors.durationMinutes?.message}
            />
          )}
        />
      </div>

      <div>
        <Label>Ocena samopoczucia</Label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <RatingInput
              value={field.value}
              onChange={field.onChange}
              error={errors.rating?.message}
            />
          )}
        />
      </div>

      <div>
        <Label htmlFor="caloriesBurned">Spalone kalorie (opcjonalnie)</Label>
        <Input
          id="caloriesBurned"
          type="number"
          min="0"
          max="10000"
          placeholder="np. 300"
          error={errors.caloriesBurned?.message}
          {...register('caloriesBurned', { valueAsNumber: true })}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notatki (opcjonalnie)</Label>
        <textarea
          id="notes"
          rows={3}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Opisz swój trening..."
          {...register('notes')}
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-error-600">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex gap-4">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {isEditing ? 'Zapisz zmiany' : 'Dodaj trening'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          Anuluj
        </Button>
      </div>
    </form>
  );
}
