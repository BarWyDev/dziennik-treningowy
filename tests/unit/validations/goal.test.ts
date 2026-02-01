/**
 * Testy walidacji - Schematy celów
 * 
 * Testuje:
 * - createGoalSchema - tworzenie celu
 * - updateGoalSchema - aktualizacja celu
 * 
 * Pola:
 * - title (3-100 znaków)
 * - description (max 500 znaków, optional)
 * - targetValue (min 1, optional)
 * - currentValue (min 0, optional)
 * - unit (max 20 znaków, optional)
 * - deadline (data w przyszłości lub dziś, optional)
 * 
 * KRYTYCZNE: Zapewnienie poprawności danych celów.
 */

import { describe, it, expect } from 'vitest';
import { createGoalSchema, updateGoalSchema } from '@/lib/validations/goal';

describe('Goal Validation - createGoalSchema', () => {
  // Prawidłowe dane bazowe
  const validGoal = {
    title: 'Schudnąć 5kg',
  };

  describe('title field (required)', () => {
    it('powinien zaakceptować tytuł z 3 znakami (minimum)', () => {
      const result = createGoalSchema.safeParse({
        title: 'Cel',
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować tytuł z 100 znakami (maksimum)', () => {
      const result = createGoalSchema.safeParse({
        title: 'a'.repeat(100),
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić tytuł z 2 znakami', () => {
      const result = createGoalSchema.safeParse({
        title: 'Ce',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Tytuł musi mieć co najmniej 3 znaki');
      }
    });

    it('powinien odrzucić tytuł z 101 znakami', () => {
      const result = createGoalSchema.safeParse({
        title: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Tytuł może mieć maksymalnie 100 znaków');
      }
    });

    it('powinien odrzucić pusty tytuł', () => {
      const result = createGoalSchema.safeParse({
        title: '',
      });
      expect(result.success).toBe(false);
    });

    it('powinien odrzucić brak tytułu', () => {
      const result = createGoalSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('description field (optional, max 500)', () => {
    it('powinien zaakceptować brak description', () => {
      const result = createGoalSchema.safeParse(validGoal);
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować pusty description', () => {
      const result = createGoalSchema.safeParse({
        ...validGoal,
        description: '',
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować description z 500 znakami', () => {
      const result = createGoalSchema.safeParse({
        ...validGoal,
        description: 'a'.repeat(500),
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić description z 501 znakami', () => {
      const result = createGoalSchema.safeParse({
        ...validGoal,
        description: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Opis może mieć maksymalnie 500 znaków');
      }
    });
  });

  describe('targetValue field (optional, min 1)', () => {
    it('powinien zaakceptować brak targetValue', () => {
      const result = createGoalSchema.safeParse(validGoal);
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować targetValue = 1 (minimum)', () => {
      const result = createGoalSchema.safeParse({
        ...validGoal,
        targetValue: 1,
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować duże targetValue', () => {
      const result = createGoalSchema.safeParse({
        ...validGoal,
        targetValue: 1000000,
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić targetValue = 0', () => {
      const result = createGoalSchema.safeParse({
        ...validGoal,
        targetValue: 0,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Wartość docelowa musi być większa od 0');
      }
    });

    it('powinien odrzucić ujemne targetValue', () => {
      const result = createGoalSchema.safeParse({
        ...validGoal,
        targetValue: -10,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('currentValue field (optional, min 0)', () => {
    it('powinien zaakceptować brak currentValue', () => {
      const result = createGoalSchema.safeParse(validGoal);
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować currentValue = 0', () => {
      const result = createGoalSchema.safeParse({
        ...validGoal,
        currentValue: 0,
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować currentValue większy od targetValue', () => {
      // To jest dozwolone - cel może być przekroczony
      const result = createGoalSchema.safeParse({
        ...validGoal,
        targetValue: 100,
        currentValue: 150,
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić ujemne currentValue', () => {
      const result = createGoalSchema.safeParse({
        ...validGoal,
        currentValue: -5,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Aktualny postęp nie może być ujemny');
      }
    });
  });

  describe('unit field (optional, max 20)', () => {
    it('powinien zaakceptować brak unit', () => {
      const result = createGoalSchema.safeParse(validGoal);
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować unit z 20 znakami', () => {
      const result = createGoalSchema.safeParse({
        ...validGoal,
        unit: 'a'.repeat(20),
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować typowe jednostki', () => {
      const units = ['kg', 'km', 'min', 'powtórzeń', 'treningów'];
      units.forEach((unit) => {
        const result = createGoalSchema.safeParse({
          ...validGoal,
          unit,
        });
        expect(result.success).toBe(true);
      });
    });

    it('powinien odrzucić unit z 21 znakami', () => {
      const result = createGoalSchema.safeParse({
        ...validGoal,
        unit: 'a'.repeat(21),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Jednostka może mieć maksymalnie 20 znaków');
      }
    });
  });

  describe('deadline field (optional, must be today or future)', () => {
    // Helper do formatowania daty
    const formatDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    it('powinien zaakceptować brak deadline', () => {
      const result = createGoalSchema.safeParse(validGoal);
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować deadline = dzisiaj', () => {
      const result = createGoalSchema.safeParse({
        ...validGoal,
        deadline: formatDate(today),
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować deadline = jutro', () => {
      const result = createGoalSchema.safeParse({
        ...validGoal,
        deadline: formatDate(tomorrow),
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować deadline za rok', () => {
      const nextYear = new Date(today);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const result = createGoalSchema.safeParse({
        ...validGoal,
        deadline: formatDate(nextYear),
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić deadline = wczoraj', () => {
      const result = createGoalSchema.safeParse({
        ...validGoal,
        deadline: formatDate(yesterday),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Data deadline nie może być wcześniejsza niż dzisiaj');
      }
    });

    it('powinien odrzucić deadline w przeszłości', () => {
      const result = createGoalSchema.safeParse({
        ...validGoal,
        deadline: '2020-01-01',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Goal Validation - updateGoalSchema', () => {
  it('powinien zaakceptować częściową aktualizację (tylko currentValue)', () => {
    const result = updateGoalSchema.safeParse({
      currentValue: 50,
    });
    expect(result.success).toBe(true);
  });

  it('powinien zaakceptować pusty obiekt', () => {
    const result = updateGoalSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('powinien zaakceptować aktualizację tytułu', () => {
    const result = updateGoalSchema.safeParse({
      title: 'Nowy tytuł celu',
    });
    expect(result.success).toBe(true);
  });

  it('powinien walidować pola które są przekazane', () => {
    const result = updateGoalSchema.safeParse({
      currentValue: -10, // niepoprawne
    });
    expect(result.success).toBe(false);
  });

  it('powinien odrzucić za krótki tytuł przy aktualizacji', () => {
    const result = updateGoalSchema.safeParse({
      title: 'AB', // za krótki
    });
    expect(result.success).toBe(false);
  });
});

describe('Goal Validation - Complete goal examples', () => {
  it('powinien zaakceptować kompletny cel z wszystkimi polami', () => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setMonth(futureDate.getMonth() + 3);

    const result = createGoalSchema.safeParse({
      title: 'Schudnąć 10kg do lata',
      description: 'Chcę zrzucić 10kg przed wakacjami przez regularny trening cardio i dietę.',
      targetValue: 10,
      currentValue: 2,
      unit: 'kg',
      deadline: futureDate.toISOString().split('T')[0],
    });
    expect(result.success).toBe(true);
  });

  it('powinien zaakceptować minimalny cel (tylko tytuł)', () => {
    const result = createGoalSchema.safeParse({
      title: 'Być zdrowszym',
    });
    expect(result.success).toBe(true);
  });

  it('powinien zaakceptować cel treningowy', () => {
    const result = createGoalSchema.safeParse({
      title: 'Przebiec maraton',
      targetValue: 42,
      unit: 'km',
    });
    expect(result.success).toBe(true);
  });

  it('powinien zaakceptować cel siłowy', () => {
    const result = createGoalSchema.safeParse({
      title: 'Wyciskanie 100kg na klatę',
      targetValue: 100,
      currentValue: 80,
      unit: 'kg',
    });
    expect(result.success).toBe(true);
  });
});
