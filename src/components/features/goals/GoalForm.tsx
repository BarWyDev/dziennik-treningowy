import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createGoalSchema, updateGoalSchema, type CreateGoalInput, type UpdateGoalInput } from '@/lib/validations/goal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';

interface Goal {
  id: string;
  title: string;
  description?: string | null;
  targetValue?: number | null;
  currentValue?: number | null;
  unit?: string | null;
  deadline?: string | null;
  status: string;
}

interface GoalFormProps {
  goal?: Goal;
  onSuccess: () => void;
  onCancel: () => void;
}

export function GoalForm({ goal, onSuccess, onCancel }: GoalFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!goal;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGoalInput | UpdateGoalInput>({
    resolver: zodResolver(isEditMode ? updateGoalSchema : createGoalSchema),
    defaultValues: goal ? {
      title: goal.title,
      description: goal.description || '',
      targetValue: goal.targetValue || undefined,
      currentValue: goal.currentValue || 0,
      unit: goal.unit || '',
      deadline: goal.deadline || '',
    } : {
      currentValue: 0,
    },
  });

  const onSubmit = async (data: CreateGoalInput | UpdateGoalInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = isEditMode ? `/api/goals/${goal.id}` : '/api/goals';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Wystąpił błąd');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <Label htmlFor="title" required>
          Tytuł celu
        </Label>
        <Input
          id="title"
          placeholder="np. Przebiec maraton"
          error={errors.title?.message}
          {...register('title')}
        />
      </div>

      <div>
        <Label htmlFor="description">Opis (opcjonalnie)</Label>
        <textarea
          id="description"
          rows={2}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Krótki opis celu..."
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm lg:text-base text-error-600 dark:text-error-400">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="targetValue">Wartość docelowa</Label>
          <Input
            id="targetValue"
            type="number"
            min="1"
            placeholder="np. 42"
            error={errors.targetValue?.message}
            {...register('targetValue', { valueAsNumber: true })}
          />
        </div>
        <div>
          <Label htmlFor="unit">Jednostka</Label>
          <Input
            id="unit"
            placeholder="np. km"
            error={errors.unit?.message}
            {...register('unit')}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="currentValue">Aktualny postęp</Label>
        <Input
          id="currentValue"
          type="number"
          min="0"
          placeholder="np. 0"
          error={errors.currentValue?.message}
          {...register('currentValue', { valueAsNumber: true })}
        />
        <p className="mt-1 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
          Wprowadź ile już osiągnąłeś z wartości docelowej (domyślnie 0)
        </p>
      </div>

      <div>
        <Label htmlFor="deadline">Termin (opcjonalnie)</Label>
        <Input
          id="deadline"
          type="date"
          min={new Date().toISOString().split('T')[0]}
          error={errors.deadline?.message}
          {...register('deadline')}
        />
        <p className="mt-1 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
          Data nie może być wcześniejsza niż dzisiaj
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {isEditMode ? 'Zapisz zmiany' : 'Dodaj cel'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Anuluj
        </Button>
      </div>
    </form>
  );
}
