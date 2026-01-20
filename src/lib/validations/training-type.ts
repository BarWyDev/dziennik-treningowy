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

export type CreateTrainingTypeInput = z.infer<typeof createTrainingTypeSchema>;
export type UpdateTrainingTypeInput = z.infer<typeof updateTrainingTypeSchema>;
