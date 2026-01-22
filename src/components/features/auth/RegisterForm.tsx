import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUp } from '@/lib/auth-client';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result.error) {
        setError(result.error.message || 'Wystąpił błąd podczas rejestracji');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Wystąpił błąd podczas rejestracji');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <Alert variant="success" title="Rejestracja zakończona!">
          <p>
            Na Twój adres email został wysłany link aktywacyjny. Sprawdź swoją
            skrzynkę pocztową i kliknij w link, aby aktywować konto.
          </p>
        </Alert>
        <p className="mt-6 text-sm lg:text-base text-gray-600 dark:text-gray-400">
          <a href="/auth/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium">
            Wróć do strony logowania
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <Label htmlFor="name" required>
          Imię
        </Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Jan"
          error={errors.name?.message}
          {...register('name')}
        />
      </div>

      <div>
        <Label htmlFor="email" required>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="jan@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div>
        <Label htmlFor="password" required>
          Hasło
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <p className="mt-1 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
          Min. 8 znaków, wielka i mała litera oraz cyfra
        </p>
      </div>

      <div>
        <Label htmlFor="confirmPassword" required>
          Potwierdź hasło
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Zarejestruj się
      </Button>

      <p className="text-center text-sm lg:text-base text-gray-600 dark:text-gray-400">
        Masz już konto?{' '}
        <a href="/auth/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium">
          Zaloguj się
        </a>
      </p>
    </form>
  );
}
