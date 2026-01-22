import { z } from 'zod';

const createTrainingTypeSchema = z.object({
  name: z.string().min(2, "Nazwa musi mieć co najmniej 2 znaki").max(50, "Nazwa może mieć maksymalnie 50 znaków"),
  description: z.string().max(200, "Opis może mieć maksymalnie 200 znaków").optional(),
  icon: z.string().max(50).optional()
});
const updateTrainingTypeSchema = createTrainingTypeSchema.partial();

export { createTrainingTypeSchema as c, updateTrainingTypeSchema as u };
