import { z } from 'zod';

export const createTrainingTypeSchema = z.object({
  name: z
    .string()
    .min(2, 'Nazwa musi mieć co najmniej 2 znaki')
    .max(50, 'Nazwa może mieć maksymalnie 50 znaków'),
  description: z.string().max(200, 'Opis może mieć maksymalnie 200 znaków').optional(),
  icon: z.string().max(50).optional(),
});

export const updateTrainingTypeSchema = createTrainingTypeSchema.partial();

// Schemat dla query params (paginacja)
export const trainingTypesQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, 'Strona musi być liczbą')
    .optional()
    .transform((val) => parseInt(val || '1', 10))
    .pipe(z.number().min(1, 'Strona musi być większa od 0')),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit musi być liczbą')
    .optional()
    .transform((val) => parseInt(val || '50', 10))
    .pipe(z.number().min(1, 'Limit musi być większy od 0').max(100, 'Limit nie może przekraczać 100')),
});

export type CreateTrainingTypeInput = z.infer<typeof createTrainingTypeSchema>;
export type UpdateTrainingTypeInput = z.infer<typeof updateTrainingTypeSchema>;
