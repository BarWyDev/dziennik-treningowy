/**
 * Vitest setup file
 * Konfiguruje środowisko testowe przed uruchomieniem testów
 */

import { vi } from 'vitest';

// Mock dla Better Auth - używany we wszystkich testach API
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

// Mock dla bazy danych
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => ({
              offset: vi.fn(() => Promise.resolve([])),
            })),
          })),
        })),
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(() => Promise.resolve([])),
              })),
            })),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  },
  trainings: {},
  trainingTypes: {},
  goals: {},
  personalRecords: {},
  mediaAttachments: {},
}));

// Mock dla storage
vi.mock('@/lib/storage', () => ({
  storage: {
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
    getFile: vi.fn(),
  },
}));
