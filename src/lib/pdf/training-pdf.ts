import { createPDF, addHeader, addFooter, formatDuration } from './common';

interface TrainingType {
  name: string;
}

interface Training {
  date: string;
  durationMinutes: number;
  notes?: string | null;
  rating?: number | null;
  caloriesBurned?: number | null;
  trainingType?: TrainingType | null;
}

export function generateTrainingPDF(training: Training): void {
  const doc = createPDF();

  const date = new Date(training.date).toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let yPos = addHeader(
    doc,
    training.trainingType?.name || 'Trening',
    date
  );

  // Training details
  doc.setFontSize(12);
  doc.setTextColor(31, 41, 55); // gray-800

  const details = [
    { label: 'Czas trwania', value: formatDuration(training.durationMinutes) },
  ];

  if (training.rating) {
    details.push({ label: 'Ocena', value: `${training.rating}/5` });
  }

  if (training.caloriesBurned) {
    details.push({ label: 'Spalone kalorie', value: `${training.caloriesBurned} kcal` });
  }

  doc.autoTable({
    startY: yPos,
    head: [],
    body: details.map((d) => [d.label, d.value]),
    theme: 'plain',
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' },
    },
    styles: {
      fontSize: 11,
      cellPadding: 4,
    },
    margin: { left: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Notes
  if (training.notes) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Notatki', 14, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    yPos += 8;

    const pageWidth = doc.internal.pageSize.getWidth();
    const textLines = doc.splitTextToSize(training.notes, pageWidth - 28);
    doc.text(textLines, 14, yPos);
  }

  addFooter(doc);

  // Download
  const fileName = `trening_${training.date}.pdf`;
  doc.save(fileName);
}
