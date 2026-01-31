import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

// Convert Polish characters to ASCII equivalents for PDF compatibility
export function sanitizePolishText(text: string): string {
  const charMap: Record<string, string> = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
  };
  
  return text.split('').map(char => charMap[char] || char).join('');
}

export function createPDF(): jsPDF {
  const doc = new jsPDF({
    putOnlyUsedFonts: true,
    compress: true,
  });

  // Using helvetica for best compatibility
  doc.setFont('helvetica', 'normal');

  return doc;
}

// Generate star rating visualization with circles (dots)
export function generateStarRating(rating: number): string {
  // Using filled circles for rated and small circles for unrated
  const filled = '\u2022'; // • (bullet point)
  const empty = '\u00B7'; // · (middle dot - smaller)

  let result = '';
  for (let i = 0; i < 5; i++) {
    if (i > 0) result += ' '; // Add space between dots
    result += i < rating ? filled : empty;
  }
  return result;
}

// Yellow/gold color for rating indicators (matching UI yellow-500)
export const STAR_COLOR = [234, 179, 8] as const; // yellow-500

export function addHeader(doc: jsPDF, title: string, subtitle?: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235); // primary-600
  doc.text(sanitizePolishText(title), pageWidth / 2, 20, { align: 'center' });

  // Subtitle
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text(sanitizePolishText(subtitle), pageWidth / 2, 30, { align: 'center' });
    return 42;
  }

  return 34;
}

export function addFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175); // gray-400

    // Page number
    doc.text(sanitizePolishText(`Strona ${i} z ${pageCount}`), pageWidth / 2, pageHeight - 10, {
      align: 'center',
    });

    // Generation date
    const date = new Date().toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.text(sanitizePolishText(`Wygenerowano: ${date}`), 14, pageHeight - 10);

    // App name
    doc.text('Dziennik Treningowy', pageWidth - 14, pageHeight - 10, {
      align: 'right',
    });
  }
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  const start = startDate.toLocaleDateString('pl-PL', formatOptions);
  const end = endDate.toLocaleDateString('pl-PL', formatOptions);

  return `${start} - ${end}`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  return `${mins}min`;
}
