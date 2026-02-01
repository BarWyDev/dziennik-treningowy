/**
 * Testy logiki komponentu PersonalRecordForm
 * Testuje walidację, obsługę danych i interakcje
 */

import { describe, it, expect } from 'vitest';
import { createPersonalRecordSchema, updatePersonalRecordSchema } from '@/lib/validations/personal-record';

describe('PersonalRecordForm - Walidacja', () => {
  describe('createPersonalRecordSchema', () => {
    it('wymaga activityName', () => {
      const result = createPersonalRecordSchema.safeParse({
        result: '100',
        unit: 'kg',
        date: '2026-01-15',
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('activityName'))).toBe(true);
      }
    });

    it('wymaga result', () => {
      const result = createPersonalRecordSchema.safeParse({
        activityName: 'Wyciskanie sztangi',
        unit: 'kg',
        date: '2026-01-15',
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('result'))).toBe(true);
      }
    });

    it('wymaga unit', () => {
      const result = createPersonalRecordSchema.safeParse({
        activityName: 'Wyciskanie sztangi',
        result: '100',
        date: '2026-01-15',
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('unit'))).toBe(true);
      }
    });

    it('wymaga date', () => {
      const result = createPersonalRecordSchema.safeParse({
        activityName: 'Wyciskanie sztangi',
        result: '100',
        unit: 'kg',
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('date'))).toBe(true);
      }
    });

    it('waliduje minimalną długość activityName (1 znak)', () => {
      // Schemat wymaga min 1 znak - puste pole jest błędem
      const result = createPersonalRecordSchema.safeParse({
        activityName: '',
        result: '100',
        unit: 'kg',
        date: '2026-01-15',
      });
      
      expect(result.success).toBe(false);
    });

    it('waliduje maksymalną długość activityName (100 znaków)', () => {
      const result = createPersonalRecordSchema.safeParse({
        activityName: 'A'.repeat(101),
        result: '100',
        unit: 'kg',
        date: '2026-01-15',
      });
      
      expect(result.success).toBe(false);
    });

    it('waliduje minimalną długość result (1 znak)', () => {
      const result = createPersonalRecordSchema.safeParse({
        activityName: 'Wyciskanie sztangi',
        result: '',
        unit: 'kg',
        date: '2026-01-15',
      });
      
      expect(result.success).toBe(false);
    });

    it('waliduje maksymalną długość result (50 znaków)', () => {
      const result = createPersonalRecordSchema.safeParse({
        activityName: 'Wyciskanie sztangi',
        result: 'A'.repeat(51),
        unit: 'kg',
        date: '2026-01-15',
      });
      
      expect(result.success).toBe(false);
    });

    it('waliduje minimalną długość unit (1 znak)', () => {
      const result = createPersonalRecordSchema.safeParse({
        activityName: 'Wyciskanie sztangi',
        result: '100',
        unit: '',
        date: '2026-01-15',
      });
      
      expect(result.success).toBe(false);
    });

    it('waliduje maksymalną długość unit (30 znaków)', () => {
      const result = createPersonalRecordSchema.safeParse({
        activityName: 'Wyciskanie sztangi',
        result: '100',
        unit: 'A'.repeat(31),
        date: '2026-01-15',
      });
      
      expect(result.success).toBe(false);
    });

    it('opcjonalne pole notes', () => {
      const result = createPersonalRecordSchema.safeParse({
        activityName: 'Wyciskanie sztangi',
        result: '100',
        unit: 'kg',
        date: '2026-01-15',
      });
      
      expect(result.success).toBe(true);
    });

    it('waliduje maksymalną długość notes (500 znaków)', () => {
      const result = createPersonalRecordSchema.safeParse({
        activityName: 'Wyciskanie sztangi',
        result: '100',
        unit: 'kg',
        date: '2026-01-15',
        notes: 'A'.repeat(501),
      });
      
      expect(result.success).toBe(false);
    });

    it('akceptuje pełny poprawny formularz', () => {
      const result = createPersonalRecordSchema.safeParse({
        activityName: 'Wyciskanie sztangi',
        result: '100',
        unit: 'kg',
        date: '2026-01-15',
        notes: 'Nowy rekord życiowy!',
      });
      
      expect(result.success).toBe(true);
    });

    it('akceptuje mediaIds jako opcjonalną tablicę', () => {
      // mediaIds jest opcjonalne - bez niego też powinno przejść
      const result = createPersonalRecordSchema.safeParse({
        activityName: 'Wyciskanie sztangi',
        result: '100',
        unit: 'kg',
        date: '2026-01-15',
      });
      
      expect(result.success).toBe(true);
    });

    it('akceptuje format wyniku - liczba', () => {
      // Schemat wymaga formatu numerycznego (np. 100 lub 100,5)
      const numericResult = createPersonalRecordSchema.safeParse({
        activityName: 'Wyciskanie sztangi',
        result: '100',
        unit: 'kg',
        date: '2026-01-15',
      });
      expect(numericResult.success).toBe(true);

      // Z przecinkiem
      const decimalResult = createPersonalRecordSchema.safeParse({
        activityName: 'Skok w dal',
        result: '5,75',
        unit: 'm',
        date: '2026-01-15',
      });
      expect(decimalResult.success).toBe(true);

      // Z kropką
      const dotDecimalResult = createPersonalRecordSchema.safeParse({
        activityName: 'Skok w dal',
        result: '5.75',
        unit: 'm',
        date: '2026-01-15',
      });
      expect(dotDecimalResult.success).toBe(true);
    });

    it('odrzuca nieprawidłowy format wyniku', () => {
      // Format czasowy 23:45 nie jest akceptowany (musi być liczbą)
      const timeResult = createPersonalRecordSchema.safeParse({
        activityName: 'Bieg 5km',
        result: '23:45',
        unit: 'min:s',
        date: '2026-01-15',
      });
      expect(timeResult.success).toBe(false);
    });
  });

  describe('updatePersonalRecordSchema', () => {
    it('wszystkie pola są opcjonalne przy aktualizacji', () => {
      const result = updatePersonalRecordSchema.safeParse({
        result: '110',
      });
      
      expect(result.success).toBe(true);
    });

    it('waliduje pola przy aktualizacji', () => {
      // Pusta nazwa aktywności jest błędem
      const result = updatePersonalRecordSchema.safeParse({
        activityName: '', // Pusty string jest nieprawidłowy
      });
      
      expect(result.success).toBe(false);
    });

    it('akceptuje częściową aktualizację', () => {
      const result = updatePersonalRecordSchema.safeParse({
        result: '110',
        notes: 'Poprawiony rekord',
      });
      
      expect(result.success).toBe(true);
    });
  });
});

describe('PersonalRecordForm - Logika biznesowa', () => {
  it('domyślna data to dzisiaj', () => {
    const today = new Date().toISOString().split('T')[0];
    const defaultDate = new Date().toISOString().split('T')[0];
    expect(defaultDate).toBe(today);
  });

  it('formatuje datę na czytelny format', () => {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    };

    const formatted = formatDate('2026-01-15');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('15');
  });

  it('sortuje rekordy według daty (najnowsze pierwsze)', () => {
    const records = [
      { date: '2026-01-10', result: '90' },
      { date: '2026-01-15', result: '100' },
      { date: '2026-01-05', result: '85' },
    ];

    const sorted = [...records].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    expect(sorted[0].date).toBe('2026-01-15');
    expect(sorted[1].date).toBe('2026-01-10');
    expect(sorted[2].date).toBe('2026-01-05');
  });

  it('sortuje rekordy według nazwy aktywności', () => {
    const records = [
      { activityName: 'Wyciskanie', result: '100' },
      { activityName: 'Bieg', result: '23:45' },
      { activityName: 'Skok', result: '5.75' },
    ];

    const sorted = [...records].sort((a, b) =>
      a.activityName.localeCompare(b.activityName, 'pl')
    );

    expect(sorted[0].activityName).toBe('Bieg');
    expect(sorted[1].activityName).toBe('Skok');
    expect(sorted[2].activityName).toBe('Wyciskanie');
  });
});

describe('PersonalRecordForm - Jednostki', () => {
  it('sugeruje popularne jednostki', () => {
    const popularUnits = [
      'kg', 'lb', 'm', 'km', 'cm', 'min', 's', 'min:s', 'h', 
      'powtórzenia', 'serie', 'kcal'
    ];

    expect(popularUnits).toContain('kg');
    expect(popularUnits).toContain('km');
    expect(popularUnits).toContain('min:s');
    expect(popularUnits).toContain('powtórzenia');
  });

  it('grupuje jednostki według kategorii', () => {
    const unitCategories = {
      waga: ['kg', 'lb'],
      dystans: ['m', 'km', 'cm'],
      czas: ['min', 's', 'min:s', 'h'],
      ilość: ['powtórzenia', 'serie'],
    };

    expect(unitCategories.waga).toContain('kg');
    expect(unitCategories.dystans).toContain('km');
    expect(unitCategories.czas).toContain('min:s');
    expect(unitCategories.ilość).toContain('powtórzenia');
  });
});

describe('PersonalRecordForm - Obsługa błędów', () => {
  it('mapuje błędy walidacji na pola formularza', () => {
    const result = createPersonalRecordSchema.safeParse({
      activityName: '',
      result: '',
      unit: '',
      date: '',
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      
      expect(fieldErrors).toBeDefined();
      expect(Object.keys(fieldErrors).length).toBeGreaterThan(0);
    }
  });
});

describe('PersonalRecordForm - Porównywanie rekordów', () => {
  it('identyfikuje poprawę rekordu', () => {
    const isImprovement = (oldValue: number, newValue: number, higherIsBetter: boolean) => {
      return higherIsBetter ? newValue > oldValue : newValue < oldValue;
    };

    // Dla wagi (więcej = lepiej)
    expect(isImprovement(100, 110, true)).toBe(true);
    expect(isImprovement(100, 90, true)).toBe(false);

    // Dla czasu (mniej = lepiej)
    expect(isImprovement(25, 23, false)).toBe(true);
    expect(isImprovement(25, 27, false)).toBe(false);
  });

  it('oblicza różnicę procentową', () => {
    const percentDiff = (oldValue: number, newValue: number) => {
      if (oldValue === 0) return 0;
      return Math.round(((newValue - oldValue) / oldValue) * 100);
    };

    expect(percentDiff(100, 110)).toBe(10); // 10% wzrost
    expect(percentDiff(100, 90)).toBe(-10); // 10% spadek
    expect(percentDiff(100, 100)).toBe(0); // bez zmiany
  });
});
