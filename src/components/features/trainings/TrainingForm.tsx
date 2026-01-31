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
import { MediaUpload } from '@/components/features/media/MediaUpload';
import type { UploadedFile } from '@/lib/validations/media';

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
  const [trainingTypes, setTrainingTypes] = useState<TrainingType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedFile[]>([]);

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

      console.log('Wysyłanie treningu z mediami:', {
        uploadedMedia,
        mediaIds: payload.mediaIds,
        payload,
      });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const handleMediaUpload = (files: UploadedFile[]) => {
    setUploadedMedia(files);
  };

  const handleMediaRemove = async (fileId: string) => {
    try {
      await fetch(`/api/media/${fileId}`, { method: 'DELETE' });
      setUploadedMedia((prev) => prev.filter((f) => f.id !== fileId));
    } catch (error) {
      console.error('Error removing media:', error);
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

      {/* Training Goal */}
      <div>
        <Label htmlFor="trainingGoal">Mój cel na trening (mentalny i fizyczny)</Label>
        <textarea
          id="trainingGoal"
          rows={2}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Co chcesz osiągnąć podczas tego treningu?"
          {...register('trainingGoal')}
        />
        {errors.trainingGoal && (
          <p className="mt-1 text-sm lg:text-base text-error-600 dark:text-error-400">{errors.trainingGoal.message}</p>
        )}
      </div>

      {/* Multi-category Ratings */}
      <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="font-medium text-base lg:text-lg text-gray-900 dark:text-gray-100">Oceny (skala 1-5)</h3>

        <div>
          <Label required>Ogólne zadowolenie</Label>
          <Controller
            name="ratingOverall"
            control={control}
            render={({ field }) => (
              <RatingInput
                value={field.value}
                onChange={field.onChange}
                error={errors.ratingOverall?.message}
              />
            )}
          />
        </div>

        <div>
          <Label>Samopoczucie fizyczne (opcjonalnie)</Label>
          <Controller
            name="ratingPhysical"
            control={control}
            render={({ field }) => (
              <RatingInput
                value={field.value}
                onChange={field.onChange}
                error={errors.ratingPhysical?.message}
              />
            )}
          />
        </div>

        <div>
          <Label>Poziom energii (opcjonalnie)</Label>
          <Controller
            name="ratingEnergy"
            control={control}
            render={({ field }) => (
              <RatingInput
                value={field.value}
                onChange={field.onChange}
                error={errors.ratingEnergy?.message}
              />
            )}
          />
        </div>

        <div>
          <Label>Motywacja (opcjonalnie)</Label>
          <Controller
            name="ratingMotivation"
            control={control}
            render={({ field }) => (
              <RatingInput
                value={field.value}
                onChange={field.onChange}
                error={errors.ratingMotivation?.message}
              />
            )}
          />
        </div>

        <div>
          <Label>Trudność treningu (opcjonalnie)</Label>
          <Controller
            name="ratingDifficulty"
            control={control}
            render={({ field }) => (
              <RatingInput
                value={field.value}
                onChange={field.onChange}
                error={errors.ratingDifficulty?.message}
              />
            )}
          />
        </div>
      </div>

      {/* Reflection Fields */}
      <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="font-medium text-base lg:text-lg text-gray-900 dark:text-gray-100">Refleksja po treningu</h3>

        <div>
          <Label htmlFor="mostSatisfiedWith">Z czego jestem najbardziej zadowolony?</Label>
          <textarea
            id="mostSatisfiedWith"
            rows={2}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Co poszło najlepiej?"
            {...register('mostSatisfiedWith')}
          />
          {errors.mostSatisfiedWith && (
            <p className="mt-1 text-sm lg:text-base text-error-600 dark:text-error-400">{errors.mostSatisfiedWith.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="improveNextTime">Co następnym razem chcę zrobić lepiej?</Label>
          <textarea
            id="improveNextTime"
            rows={2}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Nad czym chcesz popracować?"
            {...register('improveNextTime')}
          />
          {errors.improveNextTime && (
            <p className="mt-1 text-sm lg:text-base text-error-600 dark:text-error-400">{errors.improveNextTime.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="howToImprove">Jak mogę to zrobić?</Label>
          <textarea
            id="howToImprove"
            rows={2}
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Konkretne kroki do poprawy..."
            {...register('howToImprove')}
          />
          {errors.howToImprove && (
            <p className="mt-1 text-sm lg:text-base text-error-600 dark:text-error-400">{errors.howToImprove.message}</p>
          )}
        </div>
      </div>

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
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
