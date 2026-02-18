import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Label } from '@/components/ui/Label';
import type { CreateTrainingInput } from '@/lib/validations/training';

interface ReflectionFieldsProps {
  register: UseFormRegister<CreateTrainingInput>;
  errors: FieldErrors<CreateTrainingInput>;
}

export function ReflectionFields({ register, errors }: ReflectionFieldsProps) {
  return (
    <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
      <h3 className="font-medium text-base lg:text-lg text-gray-900 dark:text-gray-100">Refleksja po treningu</h3>

      <div>
        <Label htmlFor="mostSatisfiedWith">Z czego jestem najbardziej zadowolony?</Label>
        <textarea
          id="mostSatisfiedWith"
          rows={2}
          maxLength={500}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 break-words resize-y"
          placeholder="Co poszło najlepiej?"
          {...register('mostSatisfiedWith')}
        />
        {errors.mostSatisfiedWith && (
          <p className="mt-1 text-sm lg:text-base text-error-600 dark:text-error-400">
            {errors.mostSatisfiedWith.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="improveNextTime">Co następnym razem chcę zrobić lepiej?</Label>
        <textarea
          id="improveNextTime"
          rows={2}
          maxLength={500}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 break-words resize-y"
          placeholder="Nad czym chcesz popracować?"
          {...register('improveNextTime')}
        />
        {errors.improveNextTime && (
          <p className="mt-1 text-sm lg:text-base text-error-600 dark:text-error-400">
            {errors.improveNextTime.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="howToImprove">Jak mogę to zrobić?</Label>
        <textarea
          id="howToImprove"
          rows={2}
          maxLength={500}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 break-words resize-y"
          placeholder="Konkretne kroki do poprawy..."
          {...register('howToImprove')}
        />
        {errors.howToImprove && (
          <p className="mt-1 text-sm lg:text-base text-error-600 dark:text-error-400">
            {errors.howToImprove.message}
          </p>
        )}
      </div>
    </div>
  );
}
