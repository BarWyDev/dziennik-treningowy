/**
 * Magic bytes (file signatures) dla różnych typów plików
 * Używane do weryfikacji rzeczywistego typu pliku (ochrona przed MIME type spoofing)
 */

// Magic bytes dla obrazów
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const WEBP_SIGNATURE = [0x52, 0x49, 0x46, 0x46]; // RIFF (WebP zaczyna się od RIFF)
const HEIC_SIGNATURE = [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]; // ftyp box

// Magic bytes dla filmów
const MP4_SIGNATURE = [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]; // ftyp box (może być różny)
const MP4_SIGNATURE_ALT = [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]; // alternatywny
const QUICKTIME_SIGNATURE = [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]; // MOV używa podobnego formatu
const WEBM_SIGNATURE = [0x1a, 0x45, 0xdf, 0xa3]; // EBML header

interface FileSignature {
  bytes: number[];
  mimeType: string;
  fileType: 'image' | 'video';
}

const SIGNATURES: FileSignature[] = [
  { bytes: JPEG_SIGNATURE, mimeType: 'image/jpeg', fileType: 'image' },
  { bytes: PNG_SIGNATURE, mimeType: 'image/png', fileType: 'image' },
  { bytes: WEBP_SIGNATURE, mimeType: 'image/webp', fileType: 'image' },
  { bytes: HEIC_SIGNATURE, mimeType: 'image/heic', fileType: 'image' },
  { bytes: MP4_SIGNATURE, mimeType: 'video/mp4', fileType: 'video' },
  { bytes: MP4_SIGNATURE_ALT, mimeType: 'video/mp4', fileType: 'video' },
  { bytes: QUICKTIME_SIGNATURE, mimeType: 'video/quicktime', fileType: 'video' },
  { bytes: WEBM_SIGNATURE, mimeType: 'video/webm', fileType: 'video' },
];

/**
 * Sprawdza magic bytes pliku i zwraca rzeczywisty typ MIME
 * @param file Plik do sprawdzenia
 * @returns Typ MIME lub null jeśli nie rozpoznano
 */
export async function verifyFileSignature(file: File): Promise<{ mimeType: string; fileType: 'image' | 'video' } | null> {
  // Pobierz pierwsze bajty pliku (wystarczy 12 bajtów dla większości formatów)
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Sprawdź każdy signature
  for (const signature of SIGNATURES) {
    if (bytes.length < signature.bytes.length) continue;

    let matches = true;
    for (let i = 0; i < signature.bytes.length; i++) {
      if (bytes[i] !== signature.bytes[i]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return {
        mimeType: signature.mimeType,
        fileType: signature.fileType,
      };
    }
  }

  // Specjalne sprawdzenie dla WebP (może być w różnych miejscach)
  if (bytes.length >= 4 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    // Sprawdź czy to WebP (RIFF...WEBP)
    const webpBuffer = await file.slice(0, 12).arrayBuffer();
    const webpBytes = new Uint8Array(webpBuffer);
    if (webpBytes.length >= 8) {
      const webpString = String.fromCharCode(...webpBytes.slice(4, 8));
      if (webpString === 'WEBP') {
        return { mimeType: 'image/webp', fileType: 'image' };
      }
    }
  }

  return null;
}

/**
 * Weryfikuje czy rzeczywisty typ pliku (magic bytes) zgadza się z deklarowanym MIME type
 * @param file Plik do sprawdzenia
 * @returns true jeśli typ się zgadza, false w przeciwnym razie
 */
export async function validateFileSignature(file: File): Promise<boolean> {
  const actualType = await verifyFileSignature(file);
  
  if (!actualType) {
    // Jeśli nie rozpoznano typu, odrzuć plik (bezpieczniejsze)
    return false;
  }

  // Porównaj z deklarowanym typem
  return actualType.mimeType === file.type;
}
