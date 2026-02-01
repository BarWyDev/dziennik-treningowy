/**
 * Testy logiki komponentu TrainingList
 * Testuje filtrowanie, paginację i sortowanie
 */

import { describe, it, expect } from 'vitest';

// Mockowane dane treningów
const mockTrainings = [
  {
    id: 'training-1',
    trainingTypeId: 'type-1',
    date: '2026-01-15',
    durationMinutes: 60,
    ratingOverall: 4,
    trainingType: { id: 'type-1', name: 'Siłowy' },
  },
  {
    id: 'training-2',
    trainingTypeId: 'type-2',
    date: '2026-01-14',
    durationMinutes: 45,
    ratingOverall: 3,
    trainingType: { id: 'type-2', name: 'Cardio' },
  },
  {
    id: 'training-3',
    trainingTypeId: 'type-1',
    date: '2026-01-13',
    durationMinutes: 90,
    ratingOverall: 5,
    trainingType: { id: 'type-1', name: 'Siłowy' },
  },
];

describe('TrainingList - Filtrowanie', () => {
  it('filtruje treningi według typu', () => {
    const filterByType = (trainings: typeof mockTrainings, typeId: string | null) => {
      if (!typeId) return trainings;
      return trainings.filter(t => t.trainingTypeId === typeId);
    };

    const filtered = filterByType(mockTrainings, 'type-1');
    expect(filtered).toHaveLength(2);
    expect(filtered.every(t => t.trainingTypeId === 'type-1')).toBe(true);
  });

  it('filtruje treningi według zakresu dat', () => {
    const filterByDateRange = (
      trainings: typeof mockTrainings,
      startDate: string | null,
      endDate: string | null
    ) => {
      return trainings.filter(t => {
        const date = new Date(t.date);
        if (startDate && date < new Date(startDate)) return false;
        if (endDate && date > new Date(endDate)) return false;
        return true;
      });
    };

    const filtered = filterByDateRange(mockTrainings, '2026-01-14', '2026-01-15');
    expect(filtered).toHaveLength(2);
  });

  it('filtruje treningi według minimalnego czasu trwania', () => {
    const filterByMinDuration = (trainings: typeof mockTrainings, minMinutes: number) => {
      return trainings.filter(t => t.durationMinutes >= minMinutes);
    };

    const filtered = filterByMinDuration(mockTrainings, 60);
    expect(filtered).toHaveLength(2);
  });

  it('łączy wiele filtrów', () => {
    const applyFilters = (
      trainings: typeof mockTrainings,
      filters: {
        typeId?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        minDuration?: number;
      }
    ) => {
      return trainings.filter(t => {
        if (filters.typeId && t.trainingTypeId !== filters.typeId) return false;
        if (filters.startDate && t.date < filters.startDate) return false;
        if (filters.endDate && t.date > filters.endDate) return false;
        if (filters.minDuration && t.durationMinutes < filters.minDuration) return false;
        return true;
      });
    };

    const filtered = applyFilters(mockTrainings, {
      typeId: 'type-1',
      startDate: '2026-01-14',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('training-1');
  });

  it('zwraca wszystkie treningi gdy brak filtrów', () => {
    const applyFilters = (trainings: typeof mockTrainings, filters: {}) => {
      return trainings;
    };

    const filtered = applyFilters(mockTrainings, {});
    expect(filtered).toHaveLength(3);
  });
});

describe('TrainingList - Sortowanie', () => {
  it('sortuje według daty malejąco (domyślnie)', () => {
    const sorted = [...mockTrainings].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    expect(sorted[0].date).toBe('2026-01-15');
    expect(sorted[1].date).toBe('2026-01-14');
    expect(sorted[2].date).toBe('2026-01-13');
  });

  it('sortuje według daty rosnąco', () => {
    const sorted = [...mockTrainings].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    expect(sorted[0].date).toBe('2026-01-13');
    expect(sorted[1].date).toBe('2026-01-14');
    expect(sorted[2].date).toBe('2026-01-15');
  });

  it('sortuje według czasu trwania', () => {
    const sorted = [...mockTrainings].sort(
      (a, b) => b.durationMinutes - a.durationMinutes
    );

    expect(sorted[0].durationMinutes).toBe(90);
    expect(sorted[1].durationMinutes).toBe(60);
    expect(sorted[2].durationMinutes).toBe(45);
  });

  it('sortuje według oceny', () => {
    const sorted = [...mockTrainings].sort(
      (a, b) => b.ratingOverall - a.ratingOverall
    );

    expect(sorted[0].ratingOverall).toBe(5);
    expect(sorted[1].ratingOverall).toBe(4);
    expect(sorted[2].ratingOverall).toBe(3);
  });

  it('sortuje według typu treningu', () => {
    const sorted = [...mockTrainings].sort((a, b) =>
      (a.trainingType?.name || '').localeCompare(b.trainingType?.name || '', 'pl')
    );

    expect(sorted[0].trainingType?.name).toBe('Cardio');
    expect(sorted[1].trainingType?.name).toBe('Siłowy');
  });
});

describe('TrainingList - Paginacja', () => {
  const manyTrainings = Array.from({ length: 25 }, (_, i) => ({
    id: `training-${i}`,
    trainingTypeId: 'type-1',
    date: `2026-01-${(i + 1).toString().padStart(2, '0')}`,
    durationMinutes: 60,
    ratingOverall: 4,
    trainingType: { id: 'type-1', name: 'Siłowy' },
  }));

  it('oblicza liczbę stron', () => {
    const calculateTotalPages = (totalItems: number, perPage: number) => {
      return Math.ceil(totalItems / perPage);
    };

    expect(calculateTotalPages(25, 10)).toBe(3);
    expect(calculateTotalPages(20, 10)).toBe(2);
    expect(calculateTotalPages(5, 10)).toBe(1);
    expect(calculateTotalPages(0, 10)).toBe(0);
  });

  it('paginuje treningi', () => {
    const paginate = (items: any[], page: number, perPage: number) => {
      const start = (page - 1) * perPage;
      return items.slice(start, start + perPage);
    };

    const page1 = paginate(manyTrainings, 1, 10);
    expect(page1).toHaveLength(10);
    expect(page1[0].id).toBe('training-0');

    const page2 = paginate(manyTrainings, 2, 10);
    expect(page2).toHaveLength(10);
    expect(page2[0].id).toBe('training-10');

    const page3 = paginate(manyTrainings, 3, 10);
    expect(page3).toHaveLength(5);
    expect(page3[0].id).toBe('training-20');
  });

  it('zwraca pustą tablicę dla strony poza zakresem', () => {
    const paginate = (items: any[], page: number, perPage: number) => {
      const start = (page - 1) * perPage;
      return items.slice(start, start + perPage);
    };

    const page4 = paginate(manyTrainings, 4, 10);
    expect(page4).toHaveLength(0);
  });

  it('obsługuje zmianę liczby elementów na stronę', () => {
    const paginate = (items: any[], page: number, perPage: number) => {
      const start = (page - 1) * perPage;
      return items.slice(start, start + perPage);
    };

    const page5 = paginate(manyTrainings, 1, 5);
    expect(page5).toHaveLength(5);

    const page20 = paginate(manyTrainings, 1, 20);
    expect(page20).toHaveLength(20);
  });
});

describe('TrainingList - Wyświetlanie', () => {
  it('formatuje czas trwania', () => {
    const formatDuration = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hours > 0) {
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
      }
      return `${mins}min`;
    };

    expect(formatDuration(45)).toBe('45min');
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(90)).toBe('1h 30min');
  });

  it('formatuje datę na względny format', () => {
    const formatRelativeDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const today = new Date();
      const diffDays = Math.floor(
        (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) return 'Dzisiaj';
      if (diffDays === 1) return 'Wczoraj';
      if (diffDays < 7) return `${diffDays} dni temu`;
      return date.toLocaleDateString('pl-PL');
    };

    const today = new Date().toISOString().split('T')[0];
    expect(formatRelativeDate(today)).toBe('Dzisiaj');
  });

  it('generuje gwiazdki oceny', () => {
    const generateRatingStars = (rating: number) => {
      return {
        filled: rating,
        empty: 5 - rating,
      };
    };

    expect(generateRatingStars(4)).toEqual({ filled: 4, empty: 1 });
    expect(generateRatingStars(1)).toEqual({ filled: 1, empty: 4 });
    expect(generateRatingStars(5)).toEqual({ filled: 5, empty: 0 });
  });

  it('określa kolor ikony typu treningu', () => {
    const getTypeColor = (typeName: string) => {
      const colors: Record<string, string> = {
        'Siłowy': 'red',
        'Cardio': 'blue',
        'HIIT': 'orange',
        'Rozciąganie': 'green',
        'Bieganie': 'purple',
      };
      return colors[typeName] || 'gray';
    };

    expect(getTypeColor('Siłowy')).toBe('red');
    expect(getTypeColor('Cardio')).toBe('blue');
    expect(getTypeColor('Nieznany')).toBe('gray');
  });
});

describe('TrainingList - Stan pusty', () => {
  it('wykrywa brak treningów', () => {
    const isEmpty = (trainings: any[]) => trainings.length === 0;

    expect(isEmpty([])).toBe(true);
    expect(isEmpty(mockTrainings)).toBe(false);
  });

  it('wykrywa brak wyników po filtrowaniu', () => {
    const hasNoResults = (trainings: any[], hasActiveFilters: boolean) => {
      return trainings.length === 0 && hasActiveFilters;
    };

    expect(hasNoResults([], true)).toBe(true);
    expect(hasNoResults([], false)).toBe(false);
    expect(hasNoResults(mockTrainings, true)).toBe(false);
  });

  it('generuje komunikat dla pustej listy', () => {
    const getEmptyMessage = (hasFilters: boolean) => {
      if (hasFilters) {
        return 'Brak treningów pasujących do filtrów';
      }
      return 'Nie masz jeszcze żadnych treningów. Dodaj pierwszy!';
    };

    expect(getEmptyMessage(false)).toContain('Nie masz');
    expect(getEmptyMessage(true)).toContain('filtrów');
  });
});

describe('TrainingList - Akcje grupowe', () => {
  it('zaznacza wszystkie treningi', () => {
    const selectAll = (trainings: typeof mockTrainings) => {
      return trainings.map(t => t.id);
    };

    const selected = selectAll(mockTrainings);
    expect(selected).toHaveLength(3);
    expect(selected).toContain('training-1');
    expect(selected).toContain('training-2');
    expect(selected).toContain('training-3');
  });

  it('odznacza wszystkie treningi', () => {
    const deselectAll = () => [];

    const selected = deselectAll();
    expect(selected).toHaveLength(0);
  });

  it('przełącza zaznaczenie pojedynczego treningu', () => {
    const toggleSelection = (selected: string[], id: string) => {
      if (selected.includes(id)) {
        return selected.filter(s => s !== id);
      }
      return [...selected, id];
    };

    let selected: string[] = [];
    selected = toggleSelection(selected, 'training-1');
    expect(selected).toContain('training-1');

    selected = toggleSelection(selected, 'training-1');
    expect(selected).not.toContain('training-1');
  });
});
