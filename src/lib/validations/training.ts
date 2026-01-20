import { z } from 'zod';

export const createTrainingSchema = z.object({
  trainingTypeId: z.string().uuid('Wybierz typ treningu'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Nieprawidłowy format daty'),
  durationMinutes: z
    .number()
    .min(1, 'Czas trwania musi wynosić co najmniej 1 minutę')
    .max(600, 'Czas trwania nie może przekraczać 10 godzin'),
  notes: z.string().max(1000, 'Notatki mogą mieć maksymalnie 1000 znaków').optional(),
  rating: z.number().min(1).max(5).optional(),
  caloriesBurned: z.number().min(0).max(10000).optional(),
});

export const updateTrainingSchema = createTrainingSchema.partial();

export const trainingFiltersSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  trainingTypeId: z.string().uuid().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type CreateTrainingInput = z.infer<typeof createTrainingSchema>;
export type UpdateTrainingInput = z.infer<typeof updateTrainingSchema>;
export type TrainingFilters = z.infer<typeof trainingFiltersSchema>;
