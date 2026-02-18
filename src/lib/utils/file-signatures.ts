/**
 * Magic bytes (file signatures) dla różnych typów plików
 * Używane do weryfikacji rzeczywistego typu pliku (ochrona przed MIME type spoofing)
 */

// Magic bytes dla prostych formatów (stały nagłówek)
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46]; // RIFF (WebP)
const WEBM_SIGNATURE = [0x1a, 0x45, 0xdf, 0xa3]; // EBML header (WebM/MKV)

interface FileSignature {
  bytes: number[];
  mimeType: string;
  fileType: 'image' | 'video';
}

const SIMPLE_SIGNATURES: FileSignature[] = [
  { bytes: JPEG_SIGNATURE, mimeType: 'image/jpeg', fileType: 'image' },
  { bytes: PNG_SIGNATURE, mimeType: 'image/png', fileType: 'image' },
  { bytes: WEBM_SIGNATURE, mimeType: 'video/webm', fileType: 'video' },
];

// Podtypy ftyp box dla ISO Base Media Format (MP4, MOV, HEIC)
// Bajty 4-7 to zawsze "ftyp", bajty 8-11 to major brand
const FTYP_BRANDS: Record<string, { mimeType: string; fileType: 'image' | 'video' }> = {
  // QuickTime / MOV
  'qt  ': { mimeType: 'video/quicktime', fileType: 'video' },
  // MP4
  'isom': { mimeType: 'video/mp4', fileType: 'video' },
  'iso2': { mimeType: 'video/mp4', fileType: 'video' },
  'mp41': { mimeType: 'video/mp4', fileType: 'video' },
  'mp42': { mimeType: 'video/mp4', fileType: 'video' },
  'mp71': { mimeType: 'video/mp4', fileType: 'video' },
  'avc1': { mimeType: 'video/mp4', fileType: 'video' },
  'M4V ': { mimeType: 'video/mp4', fileType: 'video' },
  'M4A ': { mimeType: 'video/mp4', fileType: 'video' },
  'f4v ': { mimeType: 'video/mp4', fileType: 'video' },
  'mmp4': { mimeType: 'video/mp4', fileType: 'video' },
  'MSNV': { mimeType: 'video/mp4', fileType: 'video' },
  'dash': { mimeType: 'video/mp4', fileType: 'video' },
  // HEIC/HEIF
  'heic': { mimeType: 'image/heic', fileType: 'image' },
  'heix': { mimeType: 'image/heic', fileType: 'image' },
  'mif1': { mimeType: 'image/heic', fileType: 'image' },
};

/**
 * Sprawdza czy plik jest w formacie ISO Base Media (MP4/MOV/HEIC)
 * Format: [4 bajty rozmiar][ftyp][major brand 4 bajty]...
 */
function detectFtypFormat(bytes: Uint8Array): { mimeType: string; fileType: 'image' | 'video' } | null {
  if (bytes.length < 12) return null;

  // Bajty 4-7 muszą być "ftyp"
  const ftyp = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
  if (ftyp !== 'ftyp') return null;

  // Bajty 8-11 to major brand
  const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  return FTYP_BRANDS[brand] || null;
}

/**
 * Sprawdza magic bytes pliku i zwraca rzeczywisty typ MIME
 * @param file Plik do sprawdzenia
 * @returns Typ MIME lub null jeśli nie rozpoznano
 */
export async function verifyFileSignature(file: File): Promise<{ mimeType: string; fileType: 'image' | 'video' } | null> {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Sprawdź proste sygnatury (JPEG, PNG, WebM)
  for (const signature of SIMPLE_SIGNATURES) {
    if (bytes.length < signature.bytes.length) continue;

    let matches = true;
    for (let i = 0; i < signature.bytes.length; i++) {
      if (bytes[i] !== signature.bytes[i]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return { mimeType: signature.mimeType, fileType: signature.fileType };
    }
  }

  // Sprawdź RIFF/WebP
  if (bytes.length >= 12 && bytes[0] === RIFF_SIGNATURE[0] && bytes[1] === RIFF_SIGNATURE[1]
      && bytes[2] === RIFF_SIGNATURE[2] && bytes[3] === RIFF_SIGNATURE[3]) {
    const format = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    if (format === 'WEBP') {
      return { mimeType: 'image/webp', fileType: 'image' };
    }
  }

  // Sprawdź ISO Base Media Format (MP4, MOV, HEIC) — zmienny rozmiar ftyp box
  const ftypResult = detectFtypFormat(bytes);
  if (ftypResult) {
    return ftypResult;
  }

  return null;
}

// Grupy kompatybilnych typów MIME — przeglądarka może raportować inny wariant
const COMPATIBLE_MIME_GROUPS: string[][] = [
  ['video/mp4', 'video/quicktime'], // MOV i MP4 używają tego samego kontenera
];

/**
 * Weryfikuje czy rzeczywisty typ pliku (magic bytes) zgadza się z deklarowanym MIME type
 * @param file Plik do sprawdzenia
 * @returns true jeśli typ się zgadza, false w przeciwnym razie
 */
export async function validateFileSignature(file: File): Promise<boolean> {
  const actualType = await verifyFileSignature(file);

  if (!actualType) {
    return false;
  }

  // Dokładne dopasowanie
  if (actualType.mimeType === file.type) {
    return true;
  }

  // Sprawdź kompatybilne typy (np. MOV zgłoszony jako video/mp4)
  for (const group of COMPATIBLE_MIME_GROUPS) {
    if (group.includes(actualType.mimeType) && group.includes(file.type)) {
      return true;
    }
  }

  return false;
}
