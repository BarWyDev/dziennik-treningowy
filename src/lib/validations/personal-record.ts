import { z } from 'zod';

export const createPersonalRecordSchema = z.object({
  activityName: z
    .string()
    .min(1, 'Nazwa aktywności jest wymagana')
    .max(100, 'Nazwa aktywności nie może być dłuższa niż 100 znaków'),
  result: z
    .string()
    .min(1, 'Wynik jest wymagany')
    .max(50, 'Wynik nie może być dłuższy niż 50 znaków')
    .refine((val) => {
      // Allow numbers with optional decimal point
      return /^\d+([.,]\d+)?$/.test(val);
    }, 'Wynik musi być liczbą (np. 100 lub 100,5)'),
  unit: z
    .string()
    .min(1, 'Jednostka jest wymagana')
    .max(20, 'Jednostka nie może być dłuższa niż 20 znaków'),
  date: z.string().min(1, 'Data jest wymagana'),
  notes: z.string().max(500, 'Notatki nie mogą być dłuższe niż 500 znaków').optional(),
});

export const updatePersonalRecordSchema = createPersonalRecordSchema.partial();

export type CreatePersonalRecordInput = z.infer<typeof createPersonalRecordSchema>;
export type UpdatePersonalRecordInput = z.infer<typeof updatePersonalRecordSchema>;
