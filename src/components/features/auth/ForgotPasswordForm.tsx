import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestPasswordReset } from '@/lib/auth-client';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestPasswordReset({
        email: data.email,
        redirectTo: '/auth/reset-password',
      });

      if (result.error) {
        if (result.error.status === 429) {
          setError('Zbyt wiele prób. Spróbuj ponownie za kilka minut.');
        } else {
          setError(result.error.message || 'Wystąpił błąd');
        }
        return;
      }

      setSuccess(true);
    } catch {
      setError('Wystąpił błąd podczas wysyłania emaila');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <Alert variant="success" title="Email wysłany!">
          <p>
            Jeśli konto z podanym adresem email istnieje, otrzymasz wiadomość z
            linkiem do resetowania hasła.
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

      <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
        Podaj swój adres email, a wyślemy Ci link do resetowania hasła.
      </p>

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

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Wyślij link resetujący
      </Button>

      <p className="text-center text-sm lg:text-base text-gray-600 dark:text-gray-400">
        <a href="/auth/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium">
          Wróć do logowania
        </a>
      </p>
    </form>
  );
}
