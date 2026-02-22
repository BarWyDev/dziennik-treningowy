import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  password: z.string().min(1, 'Hasło jest wymagane'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki'),
    email: z.string().email('Nieprawidłowy adres email'),
    password: z
      .string()
      .min(8, 'Hasło musi mieć co najmniej 8 znaków')
      .regex(/[A-Z]/, 'Hasło musi zawierać co najmniej jedną wielką literę')
      .regex(/[a-z]/, 'Hasło musi zawierać co najmniej jedną małą literę')
      .regex(/[0-9]/, 'Hasło musi zawierać co najmniej jedną cyfrę'),
    confirmPassword: z.string(),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, { message: 'Musisz zaakceptować Regulamin i Politykę Prywatności' }),
    acceptHealthData: z
      .boolean()
      .refine((val) => val === true, { message: 'Zgoda na przetwarzanie danych zdrowotnych jest wymagana' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła nie są identyczne',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Hasło musi mieć co najmniej 8 znaków')
      .regex(/[A-Z]/, 'Hasło musi zawierać co najmniej jedną wielką literę')
      .regex(/[a-z]/, 'Hasło musi zawierać co najmniej jedną małą literę')
      .regex(/[0-9]/, 'Hasło musi zawierać co najmniej jedną cyfrę'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła nie są identyczne',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
