import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Label } from '@/components/ui/Label';
import { RatingInput } from './RatingInput';
import type { CreateTrainingInput } from '@/lib/validations/training';

interface RatingsSectionProps {
  control: Control<CreateTrainingInput>;
  errors: {
    ratingOverall?: { message?: string };
    ratingPhysical?: { message?: string };
    ratingEnergy?: { message?: string };
    ratingMotivation?: { message?: string };
    ratingDifficulty?: { message?: string };
  };
}

export function RatingsSection({ control, errors }: RatingsSectionProps) {
  return (
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
  );
}
