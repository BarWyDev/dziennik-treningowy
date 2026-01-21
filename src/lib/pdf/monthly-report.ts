import { createPDF, addHeader, addFooter, formatDuration, sanitizePolishText } from './common';
import autoTable from 'jspdf-autotable';

interface TrainingType {
  name: string;
}

interface Training {
  date: string;
  time?: string | null;
  durationMinutes: number;
  ratingOverall: number;
  ratingPhysical?: number | null;
  ratingEnergy?: number | null;
  ratingMotivation?: number | null;
  ratingDifficulty?: number | null;
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
  const avgOverall = trainings.reduce((acc, t) => acc + t.ratingOverall, 0) / trainings.length || 0;

  const physicalRatings = trainings.filter((t) => t.ratingPhysical);
  const avgPhysical = physicalRatings.length > 0
    ? physicalRatings.reduce((acc, t) => acc + (t.ratingPhysical || 0), 0) / physicalRatings.length
    : 0;

  const energyRatings = trainings.filter((t) => t.ratingEnergy);
  const avgEnergy = energyRatings.length > 0
    ? energyRatings.reduce((acc, t) => acc + (t.ratingEnergy || 0), 0) / energyRatings.length
    : 0;

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
  doc.setFont('times', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(sanitizePolishText('Podsumowanie'), 14, yPos);
  yPos += 8;

  const summaryData = [
    ['Liczba treningow', trainings.length.toString()],
    ['Laczny czas', formatDuration(totalDuration)],
    ['Sredni czas treningu', trainings.length > 0 ? formatDuration(Math.round(totalDuration / trainings.length)) : '-'],
    ['Spalone kalorie', totalCalories > 0 ? `${totalCalories} kcal` : '-'],
    ['Sr. zadowolenie', avgOverall > 0 ? avgOverall.toFixed(1) + '/5' : '-'],
    ['Sr. samopoczucie', avgPhysical > 0 ? avgPhysical.toFixed(1) + '/5' : '-'],
    ['Sr. energia', avgEnergy > 0 ? avgEnergy.toFixed(1) + '/5' : '-'],
  ].map(row => row.map(cell => sanitizePolishText(cell)));

  autoTable(doc, {
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
    doc.setFont('times', 'bold');
    doc.text(sanitizePolishText('Podzial wg typu treningu'), 14, yPos);
    yPos += 8;

    const typeData = Object.entries(typeBreakdown)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([type, data]) => [sanitizePolishText(type), data.count.toString(), formatDuration(data.duration)]);

    autoTable(doc, {
      startY: yPos,
      head: [[sanitizePolishText('Typ'), 'Liczba', 'Czas']],
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
    doc.setFont('times', 'bold');
    doc.text(sanitizePolishText('Lista treningow'), 14, yPos);
    yPos += 8;

    const tableData = trainings.map((t) => [
      new Date(t.date).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'short',
      }),
      sanitizePolishText(t.trainingType?.name || 'Trening'),
      formatDuration(t.durationMinutes),
      `${t.ratingOverall}/5`,
      t.caloriesBurned ? `${t.caloriesBurned}` : '-',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [[sanitizePolishText('Data'), sanitizePolishText('Typ'), 'Czas', 'Ocena', 'Kalorie']],
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
    doc.setFont('times', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(sanitizePolishText('Brak treningow w tym miesiacu.'), 14, yPos);
  }

  addFooter(doc);

  const monthStr = month.toString().padStart(2, '0');
  const fileName = sanitizePolishText(`raport_miesieczny_${year}_${monthStr}.pdf`);
  doc.save(fileName);
}
