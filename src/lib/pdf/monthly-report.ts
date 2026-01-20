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

interface MonthlyReportData {
  trainings: Training[];
  year: number;
  month: number;
}

export function generateMonthlyReport({ trainings, year, month }: MonthlyReportData): void {
  const doc = createPDF();

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('pl-PL', {
    month: 'long',
    year: 'numeric',
  });

  let yPos = addHeader(doc, 'Raport miesięczny', monthName.charAt(0).toUpperCase() + monthName.slice(1));

  // Summary
  const totalDuration = trainings.reduce((acc, t) => acc + t.durationMinutes, 0);
  const totalCalories = trainings.reduce((acc, t) => acc + (t.caloriesBurned || 0), 0);
  const avgRating =
    trainings.filter((t) => t.rating).reduce((acc, t) => acc + (t.rating || 0), 0) /
      trainings.filter((t) => t.rating).length || 0;

  // Training types breakdown
  const typeBreakdown = trainings.reduce(
    (acc, t) => {
      const type = t.trainingType?.name || 'Inne';
      if (!acc[type]) {
        acc[type] = { count: 0, duration: 0 };
      }
      acc[type].count++;
      acc[type].duration += t.durationMinutes;
      return acc;
    },
    {} as Record<string, { count: number; duration: number }>
  );

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Podsumowanie', 14, yPos);
  yPos += 8;

  const summaryData = [
    ['Liczba treningów', trainings.length.toString()],
    ['Łączny czas', formatDuration(totalDuration)],
    ['Średni czas treningu', trainings.length > 0 ? formatDuration(Math.round(totalDuration / trainings.length)) : '-'],
    ['Spalone kalorie', totalCalories > 0 ? `${totalCalories} kcal` : '-'],
    ['Średnia ocena', avgRating > 0 ? avgRating.toFixed(1) + '/5' : '-'],
  ];

  doc.autoTable({
    startY: yPos,
    head: [],
    body: summaryData,
    theme: 'striped',
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 'auto' },
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Training types breakdown
  if (Object.keys(typeBreakdown).length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Podział wg typu treningu', 14, yPos);
    yPos += 8;

    const typeData = Object.entries(typeBreakdown)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([type, data]) => [type, data.count.toString(), formatDuration(data.duration)]);

    doc.autoTable({
      startY: yPos,
      head: [['Typ', 'Liczba', 'Czas']],
      body: typeData,
      theme: 'striped',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

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
    doc.text('Brak treningów w tym miesiącu.', 14, yPos);
  }

  addFooter(doc);

  const monthStr = month.toString().padStart(2, '0');
  const fileName = `raport_miesięczny_${year}_${monthStr}.pdf`;
  doc.save(fileName);
}
