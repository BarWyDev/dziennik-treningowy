/**
 * Testy walidacji - Schematy treningów
 * 
 * Testuje:
 * - createTrainingSchema - tworzenie treningu
 * - updateTrainingSchema - aktualizacja treningu
 * - trainingFiltersSchema - filtrowanie listy
 * 
 * Pola:
 * - trainingTypeId (UUID)
 * - date (YYYY-MM-DD)
 * - time (HH:MM)
 * - durationMinutes (1-600)
 * - ratings (1-5, overall wymagany)
 * - reflection fields (max 500 znaków)
 * - notes (max 1000 znaków)
 * - caloriesBurned (0-10000)
 * 
 * KRYTYCZNE: Zapewnienie poprawności danych treningowych.
 */

import { describe, it, expect } from 'vitest';
import {
  createTrainingSchema,
  updateTrainingSchema,
  trainingFiltersSchema,
} from '@/lib/validations/training';

describe('Training Validation - createTrainingSchema', () => {
  // Prawidłowe dane bazowe
  const validTraining = {
    trainingTypeId: '550e8400-e29b-41d4-a716-446655440000',
    date: '2025-01-15',
    durationMinutes: 60,
    ratingOverall: 4,
  };

  describe('trainingTypeId field', () => {
    it('powinien zaakceptować poprawny UUID', () => {
      const result = createTrainingSchema.safeParse(validTraining);
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić niepoprawny UUID', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        trainingTypeId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Wybierz typ treningu');
      }
    });

    it('powinien odrzucić pusty trainingTypeId', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        trainingTypeId: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('date field', () => {
    it('powinien zaakceptować poprawny format daty YYYY-MM-DD', () => {
      const result = createTrainingSchema.safeParse(validTraining);
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować datę z przeszłości', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        date: '2020-01-01',
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować datę z przyszłości', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        date: '2030-12-31',
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić niepoprawny format daty DD-MM-YYYY', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        date: '15-01-2025',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nieprawidłowy format daty');
      }
    });

    it('powinien odrzucić datę z slashami', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        date: '2025/01/15',
      });
      expect(result.success).toBe(false);
    });

    it('powinien odrzucić pustą datę', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        date: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('time field (optional)', () => {
    it('powinien zaakceptować brak time', () => {
      const { time, ...trainingWithoutTime } = validTraining as any;
      const result = createTrainingSchema.safeParse(trainingWithoutTime);
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować pusty string jako time', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        time: '',
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować poprawny format HH:MM', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        time: '14:30',
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować czas 00:00', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        time: '00:00',
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować czas 23:59', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        time: '23:59',
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować czas jednocyfrową godzinę', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        time: '9:30',
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić niepoprawny format czasu', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        time: '14:30:00',
      });
      expect(result.success).toBe(false);
    });

    it('powinien odrzucić czas 25:00', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        time: '25:00',
      });
      expect(result.success).toBe(false);
    });

    it('powinien odrzucić czas 14:60', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        time: '14:60',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('durationMinutes field', () => {
    it('powinien zaakceptować 1 minutę (minimum)', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        durationMinutes: 1,
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować 600 minut (10 godzin, maksimum)', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        durationMinutes: 600,
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić 0 minut', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        durationMinutes: 0,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Czas trwania musi wynosić co najmniej 1 minutę');
      }
    });

    it('powinien odrzucić ujemny czas', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        durationMinutes: -30,
      });
      expect(result.success).toBe(false);
    });

    it('powinien odrzucić więcej niż 600 minut', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        durationMinutes: 601,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Czas trwania nie może przekraczać 10 godzin');
      }
    });
  });

  describe('ratingOverall field (required)', () => {
    it('powinien zaakceptować ocenę 1', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        ratingOverall: 1,
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować ocenę 5', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        ratingOverall: 5,
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować ocenę 3', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        ratingOverall: 3,
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić ocenę 0', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        ratingOverall: 0,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Ocena musi być w skali 1-5');
      }
    });

    it('powinien odrzucić ocenę 6', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        ratingOverall: 6,
      });
      expect(result.success).toBe(false);
    });

    it('powinien odrzucić brak ratingOverall', () => {
      const { ratingOverall, ...trainingWithoutRating } = validTraining;
      const result = createTrainingSchema.safeParse(trainingWithoutRating);
      expect(result.success).toBe(false);
    });
  });

  describe('optional ratings (ratingPhysical, ratingEnergy, ratingMotivation, ratingDifficulty)', () => {
    const optionalRatings = ['ratingPhysical', 'ratingEnergy', 'ratingMotivation', 'ratingDifficulty'];

    optionalRatings.forEach((ratingField) => {
      describe(`${ratingField}`, () => {
        it(`powinien zaakceptować brak ${ratingField}`, () => {
          const result = createTrainingSchema.safeParse(validTraining);
          expect(result.success).toBe(true);
        });

        it(`powinien zaakceptować ${ratingField} = 1`, () => {
          const result = createTrainingSchema.safeParse({
            ...validTraining,
            [ratingField]: 1,
          });
          expect(result.success).toBe(true);
        });

        it(`powinien zaakceptować ${ratingField} = 5`, () => {
          const result = createTrainingSchema.safeParse({
            ...validTraining,
            [ratingField]: 5,
          });
          expect(result.success).toBe(true);
        });

        it(`powinien odrzucić ${ratingField} = 0`, () => {
          const result = createTrainingSchema.safeParse({
            ...validTraining,
            [ratingField]: 0,
          });
          expect(result.success).toBe(false);
        });

        it(`powinien odrzucić ${ratingField} = 6`, () => {
          const result = createTrainingSchema.safeParse({
            ...validTraining,
            [ratingField]: 6,
          });
          expect(result.success).toBe(false);
        });
      });
    });
  });

  describe('reflection fields (max 500 chars)', () => {
    const reflectionFields = ['trainingGoal', 'mostSatisfiedWith', 'improveNextTime', 'howToImprove'];

    reflectionFields.forEach((field) => {
      describe(`${field}`, () => {
        it(`powinien zaakceptować brak ${field}`, () => {
          const result = createTrainingSchema.safeParse(validTraining);
          expect(result.success).toBe(true);
        });

        it(`powinien zaakceptować ${field} z 500 znakami`, () => {
          const result = createTrainingSchema.safeParse({
            ...validTraining,
            [field]: 'a'.repeat(500),
          });
          expect(result.success).toBe(true);
        });

        it(`powinien odrzucić ${field} z 501 znakami`, () => {
          const result = createTrainingSchema.safeParse({
            ...validTraining,
            [field]: 'a'.repeat(501),
          });
          expect(result.success).toBe(false);
        });

        it(`powinien zaakceptować pusty ${field}`, () => {
          const result = createTrainingSchema.safeParse({
            ...validTraining,
            [field]: '',
          });
          expect(result.success).toBe(true);
        });
      });
    });
  });

  describe('notes field (max 1000 chars)', () => {
    it('powinien zaakceptować brak notes', () => {
      const result = createTrainingSchema.safeParse(validTraining);
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować notes z 1000 znakami', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        notes: 'a'.repeat(1000),
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić notes z 1001 znakami', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        notes: 'a'.repeat(1001),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Notatki mogą mieć maksymalnie 1000 znaków');
      }
    });
  });

  describe('caloriesBurned field', () => {
    it('powinien zaakceptować brak caloriesBurned', () => {
      const result = createTrainingSchema.safeParse(validTraining);
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować 0 kalorii', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        caloriesBurned: 0,
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować 10000 kalorii (max)', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        caloriesBurned: 10000,
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić ujemne kalorie', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        caloriesBurned: -100,
      });
      expect(result.success).toBe(false);
    });

    it('powinien odrzucić więcej niż 10000 kalorii', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        caloriesBurned: 10001,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Wartość kalorii jest za wysoka');
      }
    });

    it('powinien transformować NaN do undefined', () => {
      const result = createTrainingSchema.safeParse({
        ...validTraining,
        caloriesBurned: NaN,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.caloriesBurned).toBeUndefined();
      }
    });
  });
});

describe('Training Validation - updateTrainingSchema', () => {
  it('powinien zaakceptować częściową aktualizację (tylko ratingOverall)', () => {
    const result = updateTrainingSchema.safeParse({
      ratingOverall: 5,
    });
    expect(result.success).toBe(true);
  });

  it('powinien zaakceptować pusty obiekt', () => {
    const result = updateTrainingSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('powinien walidować pola które są przekazane', () => {
    const result = updateTrainingSchema.safeParse({
      ratingOverall: 10, // niepoprawne
    });
    expect(result.success).toBe(false);
  });
});

describe('Training Validation - trainingFiltersSchema', () => {
  it('powinien zaakceptować puste filtry', () => {
    const result = trainingFiltersSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('powinien zaakceptować filtry z datami', () => {
    const result = trainingFiltersSchema.safeParse({
      startDate: '2025-01-01',
      endDate: '2025-01-31',
    });
    expect(result.success).toBe(true);
  });

  it('powinien zaakceptować filtr trainingTypeId', () => {
    const result = trainingFiltersSchema.safeParse({
      trainingTypeId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('powinien odrzucić niepoprawny trainingTypeId', () => {
    const result = trainingFiltersSchema.safeParse({
      trainingTypeId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('powinien odrzucić page < 1', () => {
    const result = trainingFiltersSchema.safeParse({
      page: 0,
    });
    expect(result.success).toBe(false);
  });

  it('powinien odrzucić limit > 100', () => {
    const result = trainingFiltersSchema.safeParse({
      limit: 101,
    });
    expect(result.success).toBe(false);
  });
});
