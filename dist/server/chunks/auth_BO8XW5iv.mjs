import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(1, "Hasło jest wymagane")
});
const registerSchema = z.object({
  name: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków").regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę").regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę").regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"]
});
const forgotPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email")
});
const resetPasswordSchema = z.object({
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków").regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę").regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę").regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"]
});

export { resetPasswordSchema as a, forgotPasswordSchema as f, loginSchema as l, registerSchema as r };
