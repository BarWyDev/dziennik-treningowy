import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTrainingSchema, type CreateTrainingInput } from '@/lib/validations/training';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { DurationPicker } from './DurationPicker';
import { RatingsSection } from './RatingsSection';
import { ReflectionFields } from './ReflectionFields';
import { useTrainingTypes } from './useTrainingTypes';
import { MediaUpload } from '@/components/features/media/MediaUpload';
import type { UploadedFile } from '@/lib/validations/media';
import { parseErrorResponse } from '@/lib/client-helpers';

interface TrainingType {
  id: string;
  name: string;
  isDefault: boolean;
}

interface MediaAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'video';
  mimeType: string;
  fileSize: number;
}

interface Training {
  id: string;
  trainingTypeId: string;
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
  description?: string | null;
  notes?: string | null;
  caloriesBurned?: number | null;
  media?: MediaAttachment[];
}

interface TrainingFormProps {
  training?: Training;
  onSuccess?: () => void;
}

export function TrainingForm({ training, onSuccess }: TrainingFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedFile[]>([]);
  const { trainingTypes, isLoading: isLoadingTypes } = useTrainingTypes();

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
      time: training?.time || '',
      durationMinutes: training?.durationMinutes || 30,
      description: training?.description || '',
      ratingOverall: training?.ratingOverall || 3,
      ratingPhysical: training?.ratingPhysical || undefined,
      ratingEnergy: training?.ratingEnergy || undefined,
      ratingMotivation: training?.ratingMotivation || undefined,
      ratingDifficulty: training?.ratingDifficulty || undefined,
      trainingGoal: training?.trainingGoal || '',
      mostSatisfiedWith: training?.mostSatisfiedWith || '',
      improveNextTime: training?.improveNextTime || '',
      howToImprove: training?.howToImprove || '',
      notes: training?.notes || '',
      caloriesBurned: training?.caloriesBurned || undefined,
    },
  });

  useEffect(() => {
    // Załaduj istniejące media podczas edycji
    if (training?.media) {
      setUploadedMedia(training.media);
    }
  }, [training]);

  const onSubmit = async (data: CreateTrainingInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = isEditing ? `/api/trainings/${training.id}` : '/api/trainings';
      const method = isEditing ? 'PUT' : 'POST';

      // Dodaj mediaIds do payload
      const payload = {
        ...data,
        mediaIds: uploadedMedia.map((m) => m.id),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
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

  const handleMediaUpload = (files: UploadedFile[]) => {
    setUploadedMedia(files);
  };

  const handleMediaRemove = async (fileId: string) => {
    try {
      const response = await fetch(`/api/media/${fileId}`, { method: 'DELETE' });

      if (!response.ok) {
        const errorMessage = await parseErrorResponse(response);
        throw new Error(errorMessage);
      }

      // Tylko jeśli sukces - usuń ze stanu
      setUploadedMedia((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się usunąć pliku');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <Label htmlFor="trainingTypeId" required>
          Typ treningu
        </Label>
        {isLoadingTypes ? (
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
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

      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="time">
            Godzina (opcjonalnie)
          </Label>
          <Input
            id="time"
            type="time"
            placeholder="HH:MM"
            error={errors.time?.message}
            {...register('time')}
          />
        </div>
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

      {/* Description */}
      <div>
        <Label htmlFor="description">Opis treningu (opcjonalnie)</Label>
        <textarea
          id="description"
          rows={3}
          maxLength={1000}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 break-words resize-y"
          placeholder="Opisz swój trening — ćwiczenia, serie, powtórzenia, obciążenia..."
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm lg:text-base text-error-600 dark:text-error-400">{errors.description.message}</p>
        )}
      </div>

      {/* Training Goal */}
      <div>
        <Label htmlFor="trainingGoal">Mój cel na trening (mentalny i fizyczny)</Label>
        <textarea
          id="trainingGoal"
          rows={2}
          maxLength={500}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 break-words resize-y"
          placeholder="Co chcesz osiągnąć podczas tego treningu?"
          {...register('trainingGoal')}
        />
        {errors.trainingGoal && (
          <p className="mt-1 text-sm lg:text-base text-error-600 dark:text-error-400">{errors.trainingGoal.message}</p>
        )}
      </div>

      {/* Multi-category Ratings */}
      <RatingsSection control={control} errors={errors} />

      {/* Reflection Fields */}
      <ReflectionFields register={register} errors={errors} />

      {/* Other Fields */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
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
      </div>

      <div>
        <Label htmlFor="notes">Dodatkowe uwagi i komentarze (opcjonalnie)</Label>
        <textarea
          id="notes"
          rows={3}
          maxLength={1000}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 break-words resize-y"
          placeholder="Inne obserwacje lub notatki..."
          {...register('notes')}
        />
        {errors.notes && (
          <p className="mt-1 text-sm lg:text-base text-error-600 dark:text-error-400">{errors.notes.message}</p>
        )}
      </div>

      {/* Media Upload */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <Label>Zdjęcia i filmy (opcjonalnie)</Label>
        <div className="mt-2">
          <MediaUpload
            entityType="training"
            entityId={training?.id}
            existingMedia={uploadedMedia}
            onUploadComplete={handleMediaUpload}
            onRemove={handleMediaRemove}
          />
        </div>
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
