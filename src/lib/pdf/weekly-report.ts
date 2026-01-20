import { createPDF, addHeader, addFooter, formatDateRange, formatDuration } from './common';

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

interface WeeklyReportData {
  trainings: Training[];
  startDate: Date;
  endDate: Date;
}

export function generateWeeklyReport({ trainings, startDate, endDate }: WeeklyReportData): void {
  const doc = createPDF();

  const dateRange = formatDateRange(startDate, endDate);
  let yPos = addHeader(doc, 'Raport tygodniowy', dateRange);

  // Summary
  const totalDuration = trainings.reduce((acc, t) => acc + t.durationMinutes, 0);
  const totalCalories = trainings.reduce((acc, t) => acc + (t.caloriesBurned || 0), 0);
  const avgRating =
    trainings.filter((t) => t.rating).reduce((acc, t) => acc + (t.rating || 0), 0) /
      trainings.filter((t) => t.rating).length || 0;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Podsumowanie', 14, yPos);
  yPos += 8;

  const summaryData = [
    ['Liczba treningów', trainings.length.toString()],
    ['Łączny czas', formatDuration(totalDuration)],
    ['Spalone kalorie', totalCalories > 0 ? `${totalCalories} kcal` : '-'],
    ['Średnia ocena', avgRating > 0 ? avgRating.toFixed(1) + '/5' : '-'],
  ];

  doc.autoTable({
    startY: yPos,
    head: [],
    body: summaryData,
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' },
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Trainings table
  if (trainings.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Lista treningów', 14, yPos);
    yPos += 8;

    const tableData = trainings.map((t) => [
      new Date(t.date).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'short',
      }),
      t.trainingType?.name || 'Trening',
      formatDuration(t.durationMinutes),
      t.rating ? `${t.rating}/5` : '-',
      t.caloriesBurned ? `${t.caloriesBurned}` : '-',
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Data', 'Typ', 'Czas', 'Ocena', 'Kalorie']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 },
      },
      margin: { left: 14, right: 14 },
    });
  } else {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('Brak treningów w tym tygodniu.', 14, yPos);
  }

  addFooter(doc);

  const weekNum = getWeekNumber(startDate);
  const fileName = `raport_tygodniowy_${startDate.getFullYear()}_T${weekNum}.pdf`;
  doc.save(fileName);
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
