import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPassword } from '@/lib/auth-client';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await resetPassword({
        newPassword: data.password,
        token,
      });

      if (result.error) {
        setError(result.error.message || 'Wystąpił błąd podczas resetowania hasła');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Wystąpił błąd podczas resetowania hasła');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Alert variant="error" title="Nieprawidłowy link">
        <p>
          Link do resetowania hasła jest nieprawidłowy lub wygasł. Spróbuj
          ponownie zresetować hasło.
        </p>
        <a
          href="/auth/forgot-password"
          className="mt-4 inline-block text-primary-600 hover:text-primary-500 font-medium"
        >
          Zresetuj hasło ponownie
        </a>
      </Alert>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <Alert variant="success" title="Hasło zmienione!">
          <p>Twoje hasło zostało pomyślnie zmienione. Możesz się teraz zalogować.</p>
        </Alert>
        <a
          href="/auth/login"
          className="mt-6 inline-block text-primary-600 hover:text-primary-500 font-medium"
        >
          Przejdź do logowania
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      <div>
        <Label htmlFor="password" required>
          Nowe hasło
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <p className="mt-1 text-xs text-gray-500">
          Min. 8 znaków, wielka i mała litera oraz cyfra
        </p>
      </div>

      <div>
        <Label htmlFor="confirmPassword" required>
          Potwierdź nowe hasło
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
        Zmień hasło
      </Button>
    </form>
  );
}
