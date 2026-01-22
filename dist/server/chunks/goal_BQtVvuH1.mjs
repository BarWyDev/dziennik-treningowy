import { z } from 'zod';

const createGoalSchema = z.object({
  title: z.string().min(3, "Tytuł musi mieć co najmniej 3 znaki").max(100, "Tytuł może mieć maksymalnie 100 znaków"),
  description: z.string().max(500, "Opis może mieć maksymalnie 500 znaków").optional(),
  targetValue: z.number().min(1, "Wartość docelowa musi być większa od 0").optional(),
  unit: z.string().max(20, "Jednostka może mieć maksymalnie 20 znaków").optional(),
  deadline: z.string().optional()
});
const updateGoalSchema = createGoalSchema.partial().extend({
  currentValue: z.number().min(0).optional()
});

export { createGoalSchema as c, updateGoalSchema as u };
