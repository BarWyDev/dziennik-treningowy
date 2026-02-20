import { createPDF, addHeader, addFooter, formatDateRange, formatDuration, sanitizePolishText, generateStarRating, STAR_COLOR, loadPDFLibraries, ensurePageSpace } from './common';

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
  notes?: string | null;
  trainingType?: TrainingType | null;
}

interface WeeklyReportData {
  trainings: Training[];
  startDate: Date;
  endDate: Date;
}

export async function generateWeeklyReport({ trainings, startDate, endDate }: WeeklyReportData): Promise<void> {
  const { autoTable } = await loadPDFLibraries();
  const doc = await createPDF();

  const dateRange = formatDateRange(startDate, endDate);
  let yPos = addHeader(doc, 'Raport tygodniowy', dateRange);

  // Summary
  const totalDuration = trainings.reduce((acc, t) => acc + t.durationMinutes, 0);
  const totalCalories = trainings.reduce((acc, t) => acc + (t.caloriesBurned || 0), 0);

  // Calculate average ratings for all categories
  const avgOverall = trainings.reduce((acc, t) => acc + t.ratingOverall, 0) / trainings.length || 0;

  const physicalRatings = trainings.filter((t) => t.ratingPhysical);
  const avgPhysical = physicalRatings.length > 0
    ? physicalRatings.reduce((acc, t) => acc + (t.ratingPhysical || 0), 0) / physicalRatings.length
    : 0;

  const energyRatings = trainings.filter((t) => t.ratingEnergy);
  const avgEnergy = energyRatings.length > 0
    ? energyRatings.reduce((acc, t) => acc + (t.ratingEnergy || 0), 0) / energyRatings.length
    : 0;

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(sanitizePolishText('Podsumowanie'), 14, yPos);
  yPos += 10;

  const summaryData = [
    ['Liczba treningow', trainings.length.toString()],
    ['Laczny czas', formatDuration(totalDuration)],
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
    headStyles: {
      fillColor: [37, 99, 235],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 'auto' },
    },
    styles: {
      fontSize: 11,
      cellPadding: 4,
    },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

  // Trainings table
  if (trainings.length > 0) {
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(sanitizePolishText('Lista treningow'), 14, yPos);
    yPos += 10;

    const tableData = trainings.map((t) => [
      new Date(t.date).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'short',
      }),
      sanitizePolishText(t.trainingType?.name || 'Trening'),
      formatDuration(t.durationMinutes),
      generateStarRating(t.ratingOverall),
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
        fontSize: 11,
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 35, textColor: STAR_COLOR, fontSize: 13 },
        4: { cellWidth: 25 },
      },
      margin: { left: 14, right: 14 },
    });
  } else {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(sanitizePolishText('Brak treningow w tym tygodniu.'), 14, yPos);
  }

  // Notes section
  const trainingsWithNotes = trainings.filter((t) => t.notes);
  if (trainingsWithNotes.length > 0) {
    yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;
    const pageWidth = doc.internal.pageSize.getWidth();

    yPos = ensurePageSpace(doc, yPos, 25);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(sanitizePolishText('Opisy treningow'), 14, yPos);
    yPos += 10;

    for (const t of trainingsWithNotes) {
      const dateStr = new Date(t.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
      const label = `${dateStr} (${sanitizePolishText(t.trainingType?.name || 'Trening')}):`;
      const lines = doc.splitTextToSize(sanitizePolishText(t.notes!), pageWidth - 28);

      yPos = ensurePageSpace(doc, yPos, 12 + lines.length * 5.5);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(label, 14, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      doc.text(lines, 14, yPos);
      yPos += lines.length * 5.5 + 8;
    }
  }

  addFooter(doc);

  const weekNum = getWeekNumber(startDate);
  const fileName = sanitizePolishText(`raport_tygodniowy_${startDate.getFullYear()}_T${weekNum}.pdf`);
  doc.save(fileName);
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
