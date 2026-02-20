import type { UseFormRegister, FieldErrors, Control } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { Label } from '@/components/ui/Label';
import type { CreateTrainingInput } from '@/lib/validations/training';

interface ReflectionFieldsProps {
  register: UseFormRegister<CreateTrainingInput>;
  errors: FieldErrors<CreateTrainingInput>;
  control: Control<CreateTrainingInput>;
}

const MAX = 500;
const charCount = (val: string | null | undefined) => (val ?? '').length;

export function ReflectionFields({ register, errors, control }: ReflectionFieldsProps) {
  const mostSatisfiedWithValue = useWatch({ control, name: 'mostSatisfiedWith' });
  const improveNextTimeValue = useWatch({ control, name: 'improveNextTime' });
  const howToImproveValue = useWatch({ control, name: 'howToImprove' });

  return (
    <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
      <h3 className="font-medium text-base lg:text-lg text-gray-900 dark:text-gray-100">Refleksja po treningu</h3>

      <div>
        <Label htmlFor="mostSatisfiedWith">Z czego jestem najbardziej zadowolony?</Label>
        <textarea
          id="mostSatisfiedWith"
          rows={2}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 break-words resize-y"
          placeholder="Co poszło najlepiej?"
          {...register('mostSatisfiedWith')}
        />
        <div className="flex justify-between mt-1">
          {errors.mostSatisfiedWith
            ? <p className="text-sm lg:text-base text-error-600 dark:text-error-400">{errors.mostSatisfiedWith.message}</p>
            : <span />}
          <span className={`text-xs ${charCount(mostSatisfiedWithValue) > MAX ? 'text-error-600 dark:text-error-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
            {charCount(mostSatisfiedWithValue)}/{MAX}
          </span>
        </div>
      </div>

      <div>
        <Label htmlFor="improveNextTime">Co następnym razem chcę zrobić lepiej?</Label>
        <textarea
          id="improveNextTime"
          rows={2}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 break-words resize-y"
          placeholder="Nad czym chcesz popracować?"
          {...register('improveNextTime')}
        />
        <div className="flex justify-between mt-1">
          {errors.improveNextTime
            ? <p className="text-sm lg:text-base text-error-600 dark:text-error-400">{errors.improveNextTime.message}</p>
            : <span />}
          <span className={`text-xs ${charCount(improveNextTimeValue) > MAX ? 'text-error-600 dark:text-error-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
            {charCount(improveNextTimeValue)}/{MAX}
          </span>
        </div>
      </div>

      <div>
        <Label htmlFor="howToImprove">Jak mogę to zrobić?</Label>
        <textarea
          id="howToImprove"
          rows={2}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 break-words resize-y"
          placeholder="Konkretne kroki do poprawy..."
          {...register('howToImprove')}
        />
        <div className="flex justify-between mt-1">
          {errors.howToImprove
            ? <p className="text-sm lg:text-base text-error-600 dark:text-error-400">{errors.howToImprove.message}</p>
            : <span />}
          <span className={`text-xs ${charCount(howToImproveValue) > MAX ? 'text-error-600 dark:text-error-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
            {charCount(howToImproveValue)}/{MAX}
          </span>
        </div>
      </div>
    </div>
  );
}
