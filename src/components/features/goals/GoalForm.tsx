import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createGoalSchema, type CreateGoalInput } from '@/lib/validations/goal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';

interface GoalFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function GoalForm({ onSuccess, onCancel }: GoalFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGoalInput>({
    resolver: zodResolver(createGoalSchema),
  });

  const onSubmit = async (data: CreateGoalInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
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
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Krótki opis celu..."
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
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
        <Label htmlFor="deadline">Termin (opcjonalnie)</Label>
        <Input
          id="deadline"
          type="date"
          error={errors.deadline?.message}
          {...register('deadline')}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          Dodaj cel
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Anuluj
        </Button>
      </div>
    </form>
  );
}
