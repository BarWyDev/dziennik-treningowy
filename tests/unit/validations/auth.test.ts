/**
 * Testy walidacji - Schematy autoryzacji
 * 
 * Testuje:
 * - loginSchema - walidacja logowania
 * - registerSchema - walidacja rejestracji (silne hasło)
 * - forgotPasswordSchema - walidacja resetu hasła
 * - resetPasswordSchema - walidacja nowego hasła
 * 
 * KRYTYCZNE: Zapewnienie poprawności danych autoryzacyjnych.
 */

import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validations/auth';

const validRegisterBase = {
  acceptTerms: true as const,
  acceptHealthData: true as const,
};

describe('Auth Validation - loginSchema', () => {
  describe('email field', () => {
    it('powinien zaakceptować poprawny email', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'haslo123',
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić niepoprawny email', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'haslo123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nieprawidłowy adres email');
      }
    });

    it('powinien odrzucić pusty email', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'haslo123',
      });
      expect(result.success).toBe(false);
    });

    it('powinien odrzucić email bez domeny', () => {
      const result = loginSchema.safeParse({
        email: 'user@',
        password: 'haslo123',
      });
      expect(result.success).toBe(false);
    });

    it('powinien odrzucić email bez @', () => {
      const result = loginSchema.safeParse({
        email: 'userexample.com',
        password: 'haslo123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('password field', () => {
    it('powinien zaakceptować niepuste hasło', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'a',
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić puste hasło', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Hasło jest wymagane');
      }
    });
  });
});

describe('Auth Validation - registerSchema', () => {
  describe('name field', () => {
    it('powinien zaakceptować imię z 2 znakami', () => {
      const result = registerSchema.safeParse({
        name: 'Jo',
        email: 'user@example.com',
        password: 'Haslo123',
        confirmPassword: 'Haslo123',
        ...validRegisterBase,
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić imię z 1 znakiem', () => {
      const result = registerSchema.safeParse({
        name: 'J',
        email: 'user@example.com',
        password: 'Haslo123',
        confirmPassword: 'Haslo123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Imię musi mieć co najmniej 2 znaki');
      }
    });

    it('powinien odrzucić puste imię', () => {
      const result = registerSchema.safeParse({
        name: '',
        email: 'user@example.com',
        password: 'Haslo123',
        confirmPassword: 'Haslo123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('password strength requirements', () => {
    it('powinien zaakceptować silne hasło (wielka + mała + cyfra + 8 znaków)', () => {
      const result = registerSchema.safeParse({
        name: 'Jan',
        email: 'jan@example.com',
        password: 'Silne123',
        confirmPassword: 'Silne123',
        ...validRegisterBase,
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić hasło krótsze niż 8 znaków', () => {
      const result = registerSchema.safeParse({
        name: 'Jan',
        email: 'jan@example.com',
        password: 'Sil123',
        confirmPassword: 'Sil123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain('Hasło musi mieć co najmniej 8 znaków');
      }
    });

    it('powinien odrzucić hasło bez wielkiej litery', () => {
      const result = registerSchema.safeParse({
        name: 'Jan',
        email: 'jan@example.com',
        password: 'slabe123',
        confirmPassword: 'slabe123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain('Hasło musi zawierać co najmniej jedną wielką literę');
      }
    });

    it('powinien odrzucić hasło bez małej litery', () => {
      const result = registerSchema.safeParse({
        name: 'Jan',
        email: 'jan@example.com',
        password: 'SLABE123',
        confirmPassword: 'SLABE123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain('Hasło musi zawierać co najmniej jedną małą literę');
      }
    });

    it('powinien odrzucić hasło bez cyfry', () => {
      const result = registerSchema.safeParse({
        name: 'Jan',
        email: 'jan@example.com',
        password: 'SlabeHaslo',
        confirmPassword: 'SlabeHaslo',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain('Hasło musi zawierać co najmniej jedną cyfrę');
      }
    });

    it('powinien zaakceptować hasło z dodatkowymi znakami specjalnymi', () => {
      const result = registerSchema.safeParse({
        name: 'Jan',
        email: 'jan@example.com',
        password: 'Silne123!@#',
        confirmPassword: 'Silne123!@#',
        ...validRegisterBase,
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować bardzo długie hasło', () => {
      const result = registerSchema.safeParse({
        name: 'Jan',
        email: 'jan@example.com',
        password: 'BardzoSilneHaslo123!'.repeat(5),
        confirmPassword: 'BardzoSilneHaslo123!'.repeat(5),
        ...validRegisterBase,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('confirmPassword field', () => {
    it('powinien zaakceptować gdy hasła są identyczne', () => {
      const result = registerSchema.safeParse({
        name: 'Jan',
        email: 'jan@example.com',
        password: 'Silne123',
        confirmPassword: 'Silne123',
        ...validRegisterBase,
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić gdy hasła są różne', () => {
      const result = registerSchema.safeParse({
        name: 'Jan',
        email: 'jan@example.com',
        password: 'Silne123',
        confirmPassword: 'Inne123',
        ...validRegisterBase,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmPasswordError = result.error.issues.find(
          (i) => i.path.includes('confirmPassword')
        );
        expect(confirmPasswordError?.message).toBe('Hasła nie są identyczne');
      }
    });

    it('powinien odrzucić gdy confirmPassword jest puste', () => {
      const result = registerSchema.safeParse({
        name: 'Jan',
        email: 'jan@example.com',
        password: 'Silne123',
        confirmPassword: '',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Auth Validation - forgotPasswordSchema', () => {
  it('powinien zaakceptować poprawny email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'user@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('powinien odrzucić niepoprawny email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: 'invalid-email',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nieprawidłowy adres email');
    }
  });

  it('powinien odrzucić pusty email', () => {
    const result = forgotPasswordSchema.safeParse({
      email: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('Auth Validation - resetPasswordSchema', () => {
  describe('password strength (same as register)', () => {
    it('powinien zaakceptować silne hasło', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'NoweHaslo1',
        confirmPassword: 'NoweHaslo1',
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić słabe hasło', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'slabe',
        confirmPassword: 'slabe',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('confirmPassword match', () => {
    it('powinien odrzucić gdy hasła się nie zgadzają', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'Silne123',
        confirmPassword: 'Inne456',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmPasswordError = result.error.issues.find(
          (i) => i.path.includes('confirmPassword')
        );
        expect(confirmPasswordError?.message).toBe('Hasła nie są identyczne');
      }
    });
  });
});

describe('Auth Validation - Edge cases', () => {
  describe('email edge cases', () => {
    it('powinien zaakceptować email z subdomeną', () => {
      const result = loginSchema.safeParse({
        email: 'user@mail.example.com',
        password: 'haslo',
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować email z plusem', () => {
      const result = loginSchema.safeParse({
        email: 'user+tag@example.com',
        password: 'haslo',
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować email z cyframi', () => {
      const result = loginSchema.safeParse({
        email: 'user123@example456.com',
        password: 'haslo',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('password edge cases', () => {
    it('powinien zaakceptować hasło z polskimi znakami', () => {
      const result = registerSchema.safeParse({
        name: 'Jan',
        email: 'jan@example.com',
        password: 'Hasło123żółć',
        confirmPassword: 'Hasło123żółć',
        ...validRegisterBase,
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować hasło z emoji', () => {
      const result = registerSchema.safeParse({
        name: 'Jan',
        email: 'jan@example.com',
        password: 'Haslo123🔥',
        confirmPassword: 'Haslo123🔥',
        ...validRegisterBase,
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować hasło dokładnie 8 znaków', () => {
      const result = registerSchema.safeParse({
        name: 'Jan',
        email: 'jan@example.com',
        password: 'Haslo123', // exactly 8 chars
        confirmPassword: 'Haslo123',
        ...validRegisterBase,
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić hasło 7 znaków', () => {
      const result = registerSchema.safeParse({
        name: 'Jan',
        email: 'jan@example.com',
        password: 'Haslo12', // 7 chars
        confirmPassword: 'Haslo12',
      });
      expect(result.success).toBe(false);
    });
  });
});
