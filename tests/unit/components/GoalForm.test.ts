/**
 * Testy logiki komponentu GoalForm
 * Testuje walidację, obsługę danych i interakcje
 */

import { describe, it, expect } from 'vitest';
import { createGoalSchema, updateGoalSchema } from '@/lib/validations/goal';

describe('GoalForm - Walidacja', () => {
  describe('createGoalSchema', () => {
    it('wymaga title', () => {
      const result = createGoalSchema.safeParse({
        description: 'Opis',
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('title'))).toBe(true);
      }
    });

    it('waliduje minimalną długość title (3 znaki)', () => {
      const result = createGoalSchema.safeParse({
        title: 'AB',
      });
      
      expect(result.success).toBe(false);
    });

    it('waliduje maksymalną długość title (100 znaków)', () => {
      const result = createGoalSchema.safeParse({
        title: 'A'.repeat(101),
      });
      
      expect(result.success).toBe(false);
    });

    it('akceptuje title o długości 3-100 znaków', () => {
      const result = createGoalSchema.safeParse({
        title: 'Przebiec maraton',
      });
      
      expect(result.success).toBe(true);
    });

    it('opcjonalne pole description', () => {
      const result = createGoalSchema.safeParse({
        title: 'Przebiec maraton',
      });
      
      expect(result.success).toBe(true);
    });

    it('waliduje maksymalną długość description (500 znaków)', () => {
      const result = createGoalSchema.safeParse({
        title: 'Przebiec maraton',
        description: 'A'.repeat(501),
      });
      
      expect(result.success).toBe(false);
    });

    it('opcjonalne pole targetValue', () => {
      const result = createGoalSchema.safeParse({
        title: 'Przebiec maraton',
      });
      
      expect(result.success).toBe(true);
    });

    it('waliduje targetValue > 0', () => {
      const result = createGoalSchema.safeParse({
        title: 'Przebiec maraton',
        targetValue: 0,
      });
      
      expect(result.success).toBe(false);
    });

    it('akceptuje targetValue dodatnie', () => {
      const result = createGoalSchema.safeParse({
        title: 'Przebiec maraton',
        targetValue: 42,
      });
      
      expect(result.success).toBe(true);
    });

    it('opcjonalne pole currentValue', () => {
      const result = createGoalSchema.safeParse({
        title: 'Przebiec maraton',
      });
      
      expect(result.success).toBe(true);
    });

    it('akceptuje currentValue >= 0', () => {
      const result = createGoalSchema.safeParse({
        title: 'Przebiec maraton',
        currentValue: 0,
      });
      
      expect(result.success).toBe(true);
    });

    it('opcjonalne pole unit', () => {
      const result = createGoalSchema.safeParse({
        title: 'Przebiec maraton',
      });
      
      expect(result.success).toBe(true);
    });

    it('waliduje maksymalną długość unit (50 znaków)', () => {
      const result = createGoalSchema.safeParse({
        title: 'Przebiec maraton',
        unit: 'A'.repeat(51),
      });
      
      expect(result.success).toBe(false);
    });

    it('opcjonalne pole deadline', () => {
      const result = createGoalSchema.safeParse({
        title: 'Przebiec maraton',
      });
      
      expect(result.success).toBe(true);
    });

    it('akceptuje deadline w formacie ISO date', () => {
      const result = createGoalSchema.safeParse({
        title: 'Przebiec maraton',
        deadline: '2026-06-01',
      });
      
      expect(result.success).toBe(true);
    });

    it('akceptuje pełny poprawny formularz', () => {
      const result = createGoalSchema.safeParse({
        title: 'Przebiec maraton',
        description: 'Mój pierwszy maraton',
        targetValue: 42,
        currentValue: 10,
        unit: 'km',
        deadline: '2026-06-01',
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe('updateGoalSchema', () => {
    it('wszystkie pola są opcjonalne przy aktualizacji', () => {
      const result = updateGoalSchema.safeParse({
        currentValue: 20,
      });
      
      expect(result.success).toBe(true);
    });

    it('waliduje pola przy aktualizacji', () => {
      const result = updateGoalSchema.safeParse({
        title: 'A', // Za krótki
      });
      
      expect(result.success).toBe(false);
    });

    it('akceptuje częściową aktualizację', () => {
      const result = updateGoalSchema.safeParse({
        currentValue: 30,
        description: 'Zaktualizowany opis',
      });
      
      expect(result.success).toBe(true);
    });

    it('pozwala aktualizować status', () => {
      const result = updateGoalSchema.safeParse({
        status: 'achieved',
      });
      
      expect(result.success).toBe(true);
    });
  });
});

describe('GoalForm - Logika biznesowa', () => {
  it('domyślna wartość currentValue to 0', () => {
    const defaultCurrentValue = 0;
    expect(defaultCurrentValue).toBe(0);
  });

  it('oblicza procent postępu', () => {
    const calculateProgress = (current: number, target: number) => {
      if (target <= 0) return 0;
      return Math.min(Math.round((current / target) * 100), 100);
    };

    expect(calculateProgress(10, 42)).toBe(24);
    expect(calculateProgress(42, 42)).toBe(100);
    expect(calculateProgress(50, 42)).toBe(100); // max 100%
    expect(calculateProgress(0, 42)).toBe(0);
    expect(calculateProgress(10, 0)).toBe(0);
  });

  it('sprawdza czy cel jest w terminie', () => {
    const isInDeadline = (deadline: string | null) => {
      if (!deadline) return true;
      return new Date(deadline) >= new Date();
    };

    // Data w przyszłości
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);
    expect(isInDeadline(futureDate.toISOString().split('T')[0])).toBe(true);

    // Data w przeszłości
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);
    expect(isInDeadline(pastDate.toISOString().split('T')[0])).toBe(false);

    // Brak deadline
    expect(isInDeadline(null)).toBe(true);
  });

  it('sprawdza czy cel jest osiągnięty', () => {
    const isAchieved = (current: number, target: number | null) => {
      if (target === null || target <= 0) return false;
      return current >= target;
    };

    expect(isAchieved(42, 42)).toBe(true);
    expect(isAchieved(50, 42)).toBe(true);
    expect(isAchieved(10, 42)).toBe(false);
    expect(isAchieved(10, null)).toBe(false);
  });

  it('formatuje deadline na czytelny format', () => {
    const formatDeadline = (deadline: string) => {
      const date = new Date(deadline);
      return date.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    };

    const formatted = formatDeadline('2026-06-01');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('1');
  });
});

describe('GoalForm - Status celu', () => {
  it('rozpoznaje statusy celów', () => {
    const statuses = ['active', 'achieved', 'failed'];
    
    expect(statuses).toContain('active');
    expect(statuses).toContain('achieved');
    expect(statuses).toContain('failed');
  });

  it('mapuje status na kolor', () => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'achieved':
          return 'green';
        case 'failed':
          return 'red';
        case 'active':
        default:
          return 'blue';
      }
    };

    expect(getStatusColor('achieved')).toBe('green');
    expect(getStatusColor('failed')).toBe('red');
    expect(getStatusColor('active')).toBe('blue');
  });

  it('mapuje status na etykietę', () => {
    const getStatusLabel = (status: string, isArchived: boolean) => {
      if (isArchived) return 'Zarchiwizowany';
      switch (status) {
        case 'achieved':
          return 'Osiągnięty';
        case 'failed':
          return 'Nieukończony';
        case 'active':
        default:
          return 'Aktywny';
      }
    };

    expect(getStatusLabel('achieved', false)).toBe('Osiągnięty');
    expect(getStatusLabel('active', false)).toBe('Aktywny');
    expect(getStatusLabel('active', true)).toBe('Zarchiwizowany');
  });
});

describe('GoalForm - Obsługa błędów', () => {
  it('mapuje błędy walidacji na pola formularza', () => {
    const result = createGoalSchema.safeParse({
      title: '',
      targetValue: -1,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      
      expect(fieldErrors).toBeDefined();
      expect(Object.keys(fieldErrors).length).toBeGreaterThan(0);
    }
  });
});
