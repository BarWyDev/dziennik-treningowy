/**
 * Testy walidacji - Schematy rekordów osobistych
 * 
 * Testuje:
 * - createPersonalRecordSchema - tworzenie rekordu
 * - updatePersonalRecordSchema - aktualizacja rekordu
 * 
 * Pola:
 * - activityName (1-100 znaków)
 * - result (1-50 znaków, musi być liczbą)
 * - unit (1-20 znaków)
 * - date (wymagana)
 * - notes (max 500 znaków, optional)
 * - mediaIds (optional)
 * 
 * KRYTYCZNE: Zapewnienie poprawności danych rekordów.
 */

import { describe, it, expect } from 'vitest';
import {
  createPersonalRecordSchema,
  updatePersonalRecordSchema,
} from '@/lib/validations/personal-record';

describe('Personal Record Validation - createPersonalRecordSchema', () => {
  // Prawidłowe dane bazowe
  const validRecord = {
    activityName: 'Przysiad',
    result: '150',
    unit: 'kg',
    date: '2025-01-15',
  };

  describe('activityName field', () => {
    it('powinien zaakceptować poprawną nazwę aktywności', () => {
      const result = createPersonalRecordSchema.safeParse(validRecord);
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować nazwę z 1 znakiem (minimum)', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        activityName: 'A',
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować nazwę z 100 znakami (maksimum)', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        activityName: 'a'.repeat(100),
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić pustą nazwę', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        activityName: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nazwa aktywności jest wymagana');
      }
    });

    it('powinien odrzucić nazwę z 101 znakami', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        activityName: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Nazwa aktywności nie może być dłuższa niż 100 znaków');
      }
    });

    it('powinien zaakceptować typowe nazwy aktywności', () => {
      const activities = [
        'Przysiad',
        'Martwy ciąg',
        'Wyciskanie na ławce',
        'Bieg 5km',
        'Podciąganie',
        'Pompki',
      ];
      activities.forEach((activity) => {
        const result = createPersonalRecordSchema.safeParse({
          ...validRecord,
          activityName: activity,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('result field (musi być liczbą)', () => {
    it('powinien zaakceptować liczbę całkowitą jako string', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        result: '150',
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować liczbę z przecinkiem', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        result: '150,5',
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować liczbę z kropką', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        result: '150.5',
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować 0', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        result: '0',
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić tekst zamiast liczby', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        result: 'sto pięćdziesiąt',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Wynik musi być liczbą (np. 100 lub 100,5)');
      }
    });

    it('powinien odrzucić liczbę z jednostką', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        result: '150kg',
      });
      expect(result.success).toBe(false);
    });

    it('powinien odrzucić pusty result', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        result: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Wynik jest wymagany');
      }
    });

    it('powinien odrzucić result z 51 znakami', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        result: '1'.repeat(51),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Wynik nie może być dłuższy niż 50 znaków');
      }
    });

    it('powinien odrzucić ujemną liczbę', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        result: '-50',
      });
      expect(result.success).toBe(false);
    });

    it('powinien odrzucić liczbę z wieloma kropkami', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        result: '150.5.5',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('unit field', () => {
    it('powinien zaakceptować typowe jednostki', () => {
      const units = ['kg', 'km', 'min', 's', 'm', 'powtórzeń', 'reps'];
      units.forEach((unit) => {
        const result = createPersonalRecordSchema.safeParse({
          ...validRecord,
          unit,
        });
        expect(result.success).toBe(true);
      });
    });

    it('powinien zaakceptować jednostkę z 1 znakiem', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        unit: 's',
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować jednostkę z 20 znakami', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        unit: 'a'.repeat(20),
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić pustą jednostkę', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        unit: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Jednostka jest wymagana');
      }
    });

    it('powinien odrzucić jednostkę z 21 znakami', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        unit: 'a'.repeat(21),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Jednostka nie może być dłuższa niż 20 znaków');
      }
    });
  });

  describe('date field', () => {
    it('powinien zaakceptować poprawną datę', () => {
      const result = createPersonalRecordSchema.safeParse(validRecord);
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować datę z przeszłości', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        date: '2020-01-01',
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować datę z przyszłości', () => {
      // Rekordy mogą być planowane
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        date: '2030-12-31',
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić pustą datę', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        date: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Data jest wymagana');
      }
    });
  });

  describe('notes field (optional, max 500)', () => {
    it('powinien zaakceptować brak notes', () => {
      const result = createPersonalRecordSchema.safeParse(validRecord);
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować pusty notes', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        notes: '',
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować notes z 500 znakami', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        notes: 'a'.repeat(500),
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić notes z 501 znakami', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        notes: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Notatki nie mogą być dłuższe niż 500 znaków');
      }
    });
  });

  describe('mediaIds field (optional)', () => {
    it('powinien zaakceptować brak mediaIds', () => {
      const result = createPersonalRecordSchema.safeParse(validRecord);
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować pustą tablicę mediaIds', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        mediaIds: [],
      });
      expect(result.success).toBe(true);
    });

    it('powinien zaakceptować tablicę z prawidłowymi UUID', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        mediaIds: [
          '550e8400-e29b-41d4-a716-446655440001',
          '550e8400-e29b-41d4-a716-446655440002',
        ],
      });
      expect(result.success).toBe(true);
    });

    it('powinien odrzucić tablicę z nieprawidłowymi UUID', () => {
      const result = createPersonalRecordSchema.safeParse({
        ...validRecord,
        mediaIds: ['not-a-uuid'],
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Personal Record Validation - updatePersonalRecordSchema', () => {
  it('powinien zaakceptować częściową aktualizację (tylko result)', () => {
    const result = updatePersonalRecordSchema.safeParse({
      result: '160',
    });
    expect(result.success).toBe(true);
  });

  it('powinien zaakceptować pusty obiekt', () => {
    const result = updatePersonalRecordSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('powinien walidować pola które są przekazane', () => {
    const result = updatePersonalRecordSchema.safeParse({
      result: 'niepoprawny-wynik',
    });
    expect(result.success).toBe(false);
  });

  it('powinien zaakceptować aktualizację notatek', () => {
    const result = updatePersonalRecordSchema.safeParse({
      notes: 'Nowe notatki po sesji',
    });
    expect(result.success).toBe(true);
  });
});

describe('Personal Record Validation - Complete record examples', () => {
  it('powinien zaakceptować rekord siłowy (przysiad)', () => {
    const result = createPersonalRecordSchema.safeParse({
      activityName: 'Przysiad ze sztangą',
      result: '150',
      unit: 'kg',
      date: '2025-01-15',
      notes: 'Osiągnięty po 6 miesiącach treningu. Forma idealna.',
    });
    expect(result.success).toBe(true);
  });

  it('powinien zaakceptować rekord biegowy', () => {
    const result = createPersonalRecordSchema.safeParse({
      activityName: 'Bieg 5km',
      result: '22,5',
      unit: 'min',
      date: '2025-01-10',
    });
    expect(result.success).toBe(true);
  });

  it('powinien zaakceptować rekord pływacki', () => {
    const result = createPersonalRecordSchema.safeParse({
      activityName: '100m kraul',
      result: '65',
      unit: 's',
      date: '2025-01-08',
      notes: 'Zawody klubowe',
    });
    expect(result.success).toBe(true);
  });

  it('powinien zaakceptować rekord z dużą liczbą dziesiętną', () => {
    const result = createPersonalRecordSchema.safeParse({
      activityName: 'Maraton',
      result: '3,5',
      unit: 'godziny',
      date: '2025-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('powinien zaakceptować rekord kalisteniczny', () => {
    const result = createPersonalRecordSchema.safeParse({
      activityName: 'Podciąganie na drążku',
      result: '25',
      unit: 'powtórzeń',
      date: '2025-01-12',
    });
    expect(result.success).toBe(true);
  });
});
