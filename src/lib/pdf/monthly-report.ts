import { createPDF, addHeader, addFooter, formatDuration, sanitizePolishText, generateStarRating, STAR_COLOR, loadPDFLibraries, ensurePageSpace } from './common';

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

interface Goal {
  title: string;
  targetValue?: number | null;
  currentValue?: number | null;
  unit?: string | null;
  deadline?: string | null;
  status: string;
  achievedAt?: string | null;
  lowerIsBetter?: boolean | null;
}

interface MonthlyReportData {
  trainings: Training[];
  goals: Goal[];
  year: number;
  month: number;
}

function getGoalProgress(
  current: number | null | undefined,
  target: number | null | undefined,
  lowerIsBetter: boolean | null | undefined
): number {
  if (!target || target === 0) return 0;
  if (lowerIsBetter) {
    const currentVal = current || 0;
    if (currentVal === 0) return 0;
    return Math.min(100, Math.round((target / currentVal) * 100));
  }
  const currentVal = current || 0;
  return Math.min(100, Math.round((currentVal / target) * 100));
}

export async function generateMonthlyReport({ trainings, goals, year, month }: MonthlyReportData): Promise<void> {
  const { autoTable } = await loadPDFLibraries();
  const doc = await createPDF();

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

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(sanitizePolishText('Podsumowanie'), 14, yPos);
  yPos += 10;

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
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { cellWidth: 'auto' },
    },
    styles: {
      fontSize: 11,
      cellPadding: 4,
    },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

  // Training types breakdown
  if (Object.keys(typeBreakdown).length > 0) {
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text(sanitizePolishText('Podzial wg typu treningu'), 14, yPos);
    yPos += 10;

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
        fontSize: 11,
      },
      styles: {
        fontSize: 11,
        cellPadding: 4,
      },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;
  }

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
    doc.text(sanitizePolishText('Brak treningow w tym miesiacu.'), 14, yPos);
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

  // Goals section
  if (goals.length > 0) {
    yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;
    yPos = ensurePageSpace(doc, yPos, 25);

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(sanitizePolishText('Cele treningowe'), 14, yPos);
    yPos += 10;

    // Goals achieved this month (highlighted separately)
    const achievedThisMonth = goals.filter((g) => {
      if (!g.achievedAt) return false;
      const d = new Date(g.achievedAt);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });

    const activeGoals = goals.filter((g) => g.status === 'active');
    const otherAchieved = goals.filter(
      (g) => g.status === 'achieved' && !achievedThisMonth.includes(g)
    );

    const buildRow = (g: Goal) => {
      const hasTarget = g.targetValue && g.targetValue > 0;
      const progress = hasTarget ? getGoalProgress(g.currentValue, g.targetValue, g.lowerIsBetter) : null;

      let progressCell = '-';
      if (hasTarget) {
        const currentDisplay = g.currentValue ?? 0;
        progressCell = g.lowerIsBetter
          ? `${currentDisplay} / cel: <=${g.targetValue} ${g.unit || ''}`.trim()
          : `${currentDisplay} / ${g.targetValue} ${g.unit || ''}`.trim();
        progressCell = sanitizePolishText(progressCell);
      }

      const statusLabel = g.status === 'achieved'
        ? sanitizePolishText('Osiagniety')
        : sanitizePolishText('Aktywny');

      const deadlineLabel = g.deadline
        ? new Date(g.deadline).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })
        : '-';

      return [
        sanitizePolishText(g.title),
        progressCell,
        progress !== null ? `${progress}%` : '-',
        statusLabel,
        sanitizePolishText(deadlineLabel),
      ];
    };

    if (achievedThisMonth.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 163, 74); // green-600
      doc.text(sanitizePolishText('Osiagniete w tym miesiacu'), 14, yPos);
      yPos += 8;

      autoTable(doc, {
        startY: yPos,
        head: [['Cel', sanitizePolishText('Postep'), '%', 'Status', 'Termin']],
        body: achievedThisMonth.map(buildRow),
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold', fontSize: 11 },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 65 },
          1: { cellWidth: 45 },
          2: { cellWidth: 15, halign: 'right' },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 },
        },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc.lastAutoTable?.finalY ?? yPos) + 12;
    }

    const remainingGoals = [...activeGoals, ...otherAchieved];
    if (remainingGoals.length > 0) {
      if (achievedThisMonth.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text(sanitizePolishText('Pozostale cele'), 14, yPos);
        yPos += 8;
      }

      autoTable(doc, {
        startY: yPos,
        head: [['Cel', sanitizePolishText('Postep'), '%', 'Status', 'Termin']],
        body: remainingGoals.map(buildRow),
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 11 },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 65 },
          1: { cellWidth: 45 },
          2: { cellWidth: 15, halign: 'right' },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 },
        },
        margin: { left: 14, right: 14 },
      });
    }
  }

  addFooter(doc);

  const monthStr = month.toString().padStart(2, '0');
  const fileName = sanitizePolishText(`raport_miesieczny_${year}_${monthStr}.pdf`);
  doc.save(fileName);
}
