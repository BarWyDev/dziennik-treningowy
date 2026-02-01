/**
 * Testy utility functions dla operacji na plikach
 * Pokrywa: formatowanie, walidacja, sanityzacja
 */

import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  validateFileType,
  validateFileSize,
  getFileExtension,
  sanitizeFileName,
  isImageFile,
  isVideoFile,
} from '@/lib/utils/file';

describe('formatFileSize', () => {
  it('formatuje 0 bajtów', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('formatuje bajty', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1)).toBe('1 B');
  });

  it('formatuje kilobajty', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(2048)).toBe('2 KB');
  });

  it('formatuje megabajty', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(1572864)).toBe('1.5 MB');
    expect(formatFileSize(5242880)).toBe('5 MB');
  });

  it('formatuje gigabajty', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
    expect(formatFileSize(2147483648)).toBe('2 GB');
  });

  it('zaokrągla do 2 miejsc po przecinku', () => {
    expect(formatFileSize(1536000)).toBe('1.46 MB');
  });
});

describe('validateFileType', () => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
  const videoTypes = ['video/mp4', 'video/webm'] as const;

  it('akceptuje dozwolone typy obrazów', () => {
    const file = { type: 'image/jpeg' } as File;
    expect(validateFileType(file, imageTypes)).toBe(true);
  });

  it('akceptuje dozwolone typy wideo', () => {
    const file = { type: 'video/mp4' } as File;
    expect(validateFileType(file, videoTypes)).toBe(true);
  });

  it('odrzuca niedozwolone typy', () => {
    const file = { type: 'application/pdf' } as File;
    expect(validateFileType(file, imageTypes)).toBe(false);
  });

  it('odrzuca puste typy', () => {
    const file = { type: '' } as File;
    expect(validateFileType(file, imageTypes)).toBe(false);
  });

  it('rozróżnia między obrazami a wideo', () => {
    const imageFile = { type: 'image/png' } as File;
    const videoFile = { type: 'video/mp4' } as File;

    expect(validateFileType(imageFile, imageTypes)).toBe(true);
    expect(validateFileType(imageFile, videoTypes)).toBe(false);
    expect(validateFileType(videoFile, videoTypes)).toBe(true);
    expect(validateFileType(videoFile, imageTypes)).toBe(false);
  });
});

describe('validateFileSize', () => {
  const maxSize = 10 * 1024 * 1024; // 10 MB

  it('akceptuje pliki mniejsze niż limit', () => {
    const file = { size: 5 * 1024 * 1024 } as File;
    expect(validateFileSize(file, maxSize)).toBe(true);
  });

  it('akceptuje pliki równe limitowi', () => {
    const file = { size: maxSize } as File;
    expect(validateFileSize(file, maxSize)).toBe(true);
  });

  it('odrzuca pliki większe niż limit', () => {
    const file = { size: 15 * 1024 * 1024 } as File;
    expect(validateFileSize(file, maxSize)).toBe(false);
  });

  it('akceptuje puste pliki', () => {
    const file = { size: 0 } as File;
    expect(validateFileSize(file, maxSize)).toBe(true);
  });
});

describe('getFileExtension', () => {
  it('pobiera rozszerzenie z nazwy pliku', () => {
    expect(getFileExtension('photo.jpg')).toBe('.jpg');
    expect(getFileExtension('document.pdf')).toBe('.pdf');
    expect(getFileExtension('video.mp4')).toBe('.mp4');
  });

  it('obsługuje wielokrotne kropki w nazwie', () => {
    expect(getFileExtension('my.photo.backup.jpg')).toBe('.jpg');
    expect(getFileExtension('file.name.with.dots.png')).toBe('.png');
  });

  it('zwraca pusty string dla pliku bez rozszerzenia', () => {
    expect(getFileExtension('filename')).toBe('');
    expect(getFileExtension('noextension')).toBe('');
  });

  it('obsługuje plik zaczynający się od kropki', () => {
    expect(getFileExtension('.gitignore')).toBe('.gitignore');
    expect(getFileExtension('.env')).toBe('.env');
  });

  it('obsługuje pusty string', () => {
    expect(getFileExtension('')).toBe('');
  });
});

describe('sanitizeFileName', () => {
  it('zachowuje bezpieczne znaki', () => {
    expect(sanitizeFileName('photo.jpg')).toBe('photo.jpg');
    expect(sanitizeFileName('file-name.png')).toBe('file-name.png');
    expect(sanitizeFileName('document123.pdf')).toBe('document123.pdf');
  });

  it('zastępuje spacje myślnikiem', () => {
    expect(sanitizeFileName('my photo.jpg')).toBe('my-photo.jpg');
    expect(sanitizeFileName('file name with spaces.png')).toBe('file-name-with-spaces.png');
  });

  it('zastępuje polskie znaki', () => {
    // Funkcja usuwa wielokrotne myślniki po zastąpieniu
    expect(sanitizeFileName('zdjęcie.jpg')).toBe('zdj-cie.jpg');
    expect(sanitizeFileName('żółć.png')).toBe('-.png');
  });

  it('zastępuje znaki specjalne', () => {
    // Funkcja usuwa wielokrotne myślniki po zastąpieniu
    expect(sanitizeFileName('file@#$%.jpg')).toBe('file-.jpg');
    expect(sanitizeFileName('photo!?.png')).toBe('photo-.png');
  });

  it('usuwa wielokrotne myślniki', () => {
    const result = sanitizeFileName('file---name.jpg');
    expect(result).toBe('file-name.jpg');
  });

  it('usuwa wielokrotne kropki', () => {
    const result = sanitizeFileName('file...name.jpg');
    expect(result).toBe('file.name.jpg');
  });

  it('ogranicza długość do 255 znaków', () => {
    const longName = 'a'.repeat(300) + '.jpg';
    expect(sanitizeFileName(longName).length).toBeLessThanOrEqual(255);
  });

  it('obsługuje pusty string', () => {
    expect(sanitizeFileName('')).toBe('');
  });
});

describe('isImageFile', () => {
  it('rozpoznaje typy obrazów', () => {
    expect(isImageFile('image/jpeg')).toBe(true);
    expect(isImageFile('image/png')).toBe(true);
    expect(isImageFile('image/gif')).toBe(true);
    expect(isImageFile('image/webp')).toBe(true);
    expect(isImageFile('image/svg+xml')).toBe(true);
  });

  it('odrzuca typy nie-obrazów', () => {
    expect(isImageFile('video/mp4')).toBe(false);
    expect(isImageFile('application/pdf')).toBe(false);
    expect(isImageFile('text/plain')).toBe(false);
  });

  it('obsługuje pusty string', () => {
    expect(isImageFile('')).toBe(false);
  });
});

describe('isVideoFile', () => {
  it('rozpoznaje typy wideo', () => {
    expect(isVideoFile('video/mp4')).toBe(true);
    expect(isVideoFile('video/webm')).toBe(true);
    expect(isVideoFile('video/ogg')).toBe(true);
    expect(isVideoFile('video/quicktime')).toBe(true);
  });

  it('odrzuca typy nie-wideo', () => {
    expect(isVideoFile('image/jpeg')).toBe(false);
    expect(isVideoFile('application/pdf')).toBe(false);
    expect(isVideoFile('audio/mp3')).toBe(false);
  });

  it('obsługuje pusty string', () => {
    expect(isVideoFile('')).toBe(false);
  });
});
