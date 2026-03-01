import { z } from 'zod';

export const createGoalSchema = z.object({
  title: z
    .string()
    .min(3, 'Tytuł musi mieć co najmniej 3 znaki')
    .max(100, 'Tytuł może mieć maksymalnie 100 znaków'),
  description: z.string().max(500, 'Opis może mieć maksymalnie 500 znaków').optional(),
  targetValue: z.number().min(1, 'Wartość docelowa musi być większa od 0').optional(),
  currentValue: z.number().min(0, 'Aktualny postęp nie może być ujemny').optional(),
  unit: z.string().max(20, 'Jednostka może mieć maksymalnie 20 znaków').optional(),
  deadline: z.string().optional().refine(
    (date) => {
      if (!date) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      return selectedDate >= today && selectedDate.getFullYear() <= 2099;
    },
    { message: 'Podaj prawidłową datę (dziś lub w przyszłości, maksymalnie rok 2099)' }
  ),
  lowerIsBetter: z.boolean().optional(),
});

export const updateGoalSchema = createGoalSchema.partial().extend({
  currentValue: z.number().optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
