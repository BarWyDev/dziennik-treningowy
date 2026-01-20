import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function createPDF(): jsPDF {
  const doc = new jsPDF();

  // Set default font
  doc.setFont('helvetica');

  return doc;
}

export function addHeader(doc: jsPDF, title: string, subtitle?: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // primary-600
  doc.text(title, pageWidth / 2, 20, { align: 'center' });

  // Subtitle
  if (subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text(subtitle, pageWidth / 2, 28, { align: 'center' });
    return 40;
  }

  return 32;
}

export function addFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // gray-400

    // Page number
    doc.text(`Strona ${i} z ${pageCount}`, pageWidth / 2, pageHeight - 10, {
      align: 'center',
    });

    // Generation date
    const date = new Date().toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.text(`Wygenerowano: ${date}`, 14, pageHeight - 10);

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
