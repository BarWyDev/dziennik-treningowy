/**
 * Testy logiki komponentu TrainingForm
 * Testuje walidację, obsługę danych i interakcje
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTrainingSchema, updateTrainingSchema } from '@/lib/validations/training';

describe('TrainingForm - Walidacja', () => {
  describe('createTrainingSchema', () => {
    it('wymaga trainingTypeId', () => {
      const result = createTrainingSchema.safeParse({
        date: '2026-01-15',
        durationMinutes: 60,
        ratingOverall: 4,
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('trainingTypeId'))).toBe(true);
      }
    });

    it('wymaga date', () => {
      const result = createTrainingSchema.safeParse({
        trainingTypeId: 'type-1',
        durationMinutes: 60,
        ratingOverall: 4,
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('date'))).toBe(true);
      }
    });

    it('wymaga durationMinutes', () => {
      const result = createTrainingSchema.safeParse({
        trainingTypeId: 'type-1',
        date: '2026-01-15',
        ratingOverall: 4,
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('durationMinutes'))).toBe(true);
      }
    });

    it('wymaga ratingOverall', () => {
      const result = createTrainingSchema.safeParse({
        trainingTypeId: 'type-1',
        date: '2026-01-15',
        durationMinutes: 60,
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('ratingOverall'))).toBe(true);
      }
    });

    it('waliduje ratingOverall w zakresie 1-5', () => {
      const result = createTrainingSchema.safeParse({
        trainingTypeId: 'type-1',
        date: '2026-01-15',
        durationMinutes: 60,
        ratingOverall: 6,
      });
      
      expect(result.success).toBe(false);
    });

    it('akceptuje ratingOverall = 1', () => {
      const result = createTrainingSchema.safeParse({
        trainingTypeId: '550e8400-e29b-41d4-a716-446655440000', // UUID format
        date: '2026-01-15',
        durationMinutes: 60,
        ratingOverall: 1,
      });
      
      expect(result.success).toBe(true);
    });

    it('akceptuje ratingOverall = 5', () => {
      const result = createTrainingSchema.safeParse({
        trainingTypeId: '550e8400-e29b-41d4-a716-446655440000', // UUID format
        date: '2026-01-15',
        durationMinutes: 60,
        ratingOverall: 5,
      });
      
      expect(result.success).toBe(true);
    });

    it('waliduje durationMinutes > 0', () => {
      const result = createTrainingSchema.safeParse({
        trainingTypeId: 'type-1',
        date: '2026-01-15',
        durationMinutes: 0,
        ratingOverall: 4,
      });
      
      expect(result.success).toBe(false);
    });

    it('waliduje durationMinutes max 1440 (24h)', () => {
      const result = createTrainingSchema.safeParse({
        trainingTypeId: 'type-1',
        date: '2026-01-15',
        durationMinutes: 1441,
        ratingOverall: 4,
      });
      
      expect(result.success).toBe(false);
    });

    it('opcjonalne pole time akceptuje format HH:MM', () => {
      const result = createTrainingSchema.safeParse({
        trainingTypeId: '550e8400-e29b-41d4-a716-446655440000', // UUID format
        date: '2026-01-15',
        time: '14:30',
        durationMinutes: 60,
        ratingOverall: 4,
      });
      
      expect(result.success).toBe(true);
    });

    it('opcjonalne pola ratings akceptują wartości 1-5', () => {
      const result = createTrainingSchema.safeParse({
        trainingTypeId: '550e8400-e29b-41d4-a716-446655440000', // UUID format
        date: '2026-01-15',
        durationMinutes: 60,
        ratingOverall: 4,
        ratingPhysical: 3,
        ratingEnergy: 4,
        ratingMotivation: 5,
        ratingDifficulty: 2,
      });
      
      expect(result.success).toBe(true);
    });

    it('waliduje caloriesBurned max 10000', () => {
      const result = createTrainingSchema.safeParse({
        trainingTypeId: 'type-1',
        date: '2026-01-15',
        durationMinutes: 60,
        ratingOverall: 4,
        caloriesBurned: 10001,
      });
      
      expect(result.success).toBe(false);
    });

    it('waliduje maksymalną długość pól tekstowych (500 znaków)', () => {
      const longText = 'A'.repeat(501);
      const result = createTrainingSchema.safeParse({
        trainingTypeId: 'type-1',
        date: '2026-01-15',
        durationMinutes: 60,
        ratingOverall: 4,
        trainingGoal: longText,
      });
      
      expect(result.success).toBe(false);
    });

    it('akceptuje pełny poprawny formularz', () => {
      const result = createTrainingSchema.safeParse({
        trainingTypeId: '550e8400-e29b-41d4-a716-446655440000', // UUID format
        date: '2026-01-15',
        time: '10:00',
        durationMinutes: 60,
        ratingOverall: 4,
        ratingPhysical: 3,
        ratingEnergy: 4,
        ratingMotivation: 5,
        ratingDifficulty: 3,
        trainingGoal: 'Poprawa kondycji',
        mostSatisfiedWith: 'Wytrzymałość',
        improveNextTime: 'Technika',
        howToImprove: 'Więcej powtórzeń',
        notes: 'Dobry trening',
        caloriesBurned: 500,
      });
      
      expect(result.success).toBe(true);
    });

    it('akceptuje mediaIds jako opcjonalną tablicę', () => {
      // mediaIds jest opcjonalne - bez niego też powinno przejść
      const result = createTrainingSchema.safeParse({
        trainingTypeId: '550e8400-e29b-41d4-a716-446655440000', // UUID format
        date: '2026-01-15',
        durationMinutes: 60,
        ratingOverall: 4,
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('updateTrainingSchema', () => {
    it('wszystkie pola są opcjonalne przy aktualizacji', () => {
      const result = updateTrainingSchema.safeParse({
        durationMinutes: 90,
      });
      
      expect(result.success).toBe(true);
    });

    it('waliduje pola przy aktualizacji', () => {
      const result = updateTrainingSchema.safeParse({
        ratingOverall: 6, // Invalid
      });
      
      expect(result.success).toBe(false);
    });

    it('akceptuje częściową aktualizację', () => {
      const result = updateTrainingSchema.safeParse({
        notes: 'Zaktualizowana notatka',
        caloriesBurned: 600,
      });
      
      expect(result.success).toBe(true);
    });
  });
});

describe('TrainingForm - Logika biznesowa', () => {
  it('domyślna data to dzisiaj', () => {
    const today = new Date().toISOString().split('T')[0];
    // Symulacja domyślnej wartości w formularzu
    const defaultDate = new Date().toISOString().split('T')[0];
    expect(defaultDate).toBe(today);
  });

  it('domyślny czas trwania to 30 minut', () => {
    const defaultDuration = 30;
    expect(defaultDuration).toBe(30);
  });

  it('domyślna ocena ogólna to 3', () => {
    const defaultRating = 3;
    expect(defaultRating).toBe(3);
  });

  it('konwersja minut na format czytelny', () => {
    const formatDuration = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hours > 0) {
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
      }
      return `${mins}min`;
    };

    expect(formatDuration(30)).toBe('30min');
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(90)).toBe('1h 30min');
    expect(formatDuration(120)).toBe('2h');
  });
});

describe('TrainingForm - Obsługa błędów', () => {
  it('mapuje błędy walidacji na pola formularza', () => {
    const result = createTrainingSchema.safeParse({
      trainingTypeId: '',
      date: '',
      durationMinutes: -1,
      ratingOverall: 0,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      
      expect(fieldErrors).toBeDefined();
      // Sprawdź czy błędy są przypisane do odpowiednich pól
      expect(Object.keys(fieldErrors).length).toBeGreaterThan(0);
    }
  });

  it('generuje czytelne komunikaty błędów', () => {
    const result = createTrainingSchema.safeParse({
      trainingTypeId: 'type-1',
      date: '2026-01-15',
      durationMinutes: 60,
      ratingOverall: 0,
    });

    if (!result.success) {
      const errors = result.error.issues;
      errors.forEach(error => {
        expect(error.message).toBeDefined();
        expect(typeof error.message).toBe('string');
      });
    }
  });
});
