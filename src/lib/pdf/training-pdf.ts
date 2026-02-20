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
  description?: string | null;
  trainingGoal?: string | null;
  mostSatisfiedWith?: string | null;
  improveNextTime?: string | null;
  howToImprove?: string | null;
  notes?: string | null;
  caloriesBurned?: number | null;
  trainingType?: TrainingType | null;
}

export async function generateTrainingPDF(training: Training): Promise<void> {
  const { autoTable } = await loadPDFLibraries();
  const doc = await createPDF();

  let dateStr = new Date(training.date).toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (training.time) {
    dateStr += ` • ${training.time}`;
  }

  let yPos = addHeader(
    doc,
    training.trainingType?.name || 'Trening',
    dateStr
  );

  // Training details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(31, 41, 55); // gray-800

  const details = [
    { label: 'Czas trwania', value: formatDuration(training.durationMinutes) },
  ];

  if (training.caloriesBurned) {
    details.push({ label: 'Spalone kalorie', value: `${training.caloriesBurned} kcal` });
  }

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: details.map((d) => [sanitizePolishText(d.label), sanitizePolishText(d.value)]),
    theme: 'plain',
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 'auto' },
    },
    styles: {
      fontSize: 12,
      cellPadding: 5,
    },
    margin: { left: 14 },
  });

  yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

  const pageWidth = doc.internal.pageSize.getWidth();

  // Description
  if (training.description) {
    const descLines = doc.splitTextToSize(sanitizePolishText(training.description), pageWidth - 28);
    yPos = ensurePageSpace(doc, yPos, 20 + descLines.length * 5.5);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(sanitizePolishText('Opis treningu'), 14, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    yPos += 8;

    doc.text(descLines, 14, yPos);
    yPos += descLines.length * 5.5 + 10;
  }

  // Training Goal
  if (training.trainingGoal) {
    const goalLines = doc.splitTextToSize(sanitizePolishText(training.trainingGoal), pageWidth - 28);
    yPos = ensurePageSpace(doc, yPos, 20 + goalLines.length * 5.5);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text(sanitizePolishText('Cel treningu (mentalny i fizyczny)'), 14, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(11);
    yPos += 8;

    doc.text(goalLines, 14, yPos);
    yPos += goalLines.length * 5.5 + 10;
  }

  // Ratings Section
  yPos = ensurePageSpace(doc, yPos, 40);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(sanitizePolishText('Oceny (skala 1-5)'), 14, yPos);
  yPos += 10;

  const ratings = [
    { label: 'Ogólne zadowolenie', value: training.ratingOverall },
  ];

  if (training.ratingPhysical) {
    ratings.push({ label: 'Samopoczucie fizyczne', value: training.ratingPhysical });
  }
  if (training.ratingEnergy) {
    ratings.push({ label: 'Poziom energii', value: training.ratingEnergy });
  }
  if (training.ratingMotivation) {
    ratings.push({ label: 'Motywacja', value: training.ratingMotivation });
  }
  if (training.ratingDifficulty) {
    ratings.push({ label: 'Trudność treningu', value: training.ratingDifficulty });
  }

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: ratings.map((r) => [
      sanitizePolishText(r.label),
      `${r.value}/5`,
      generateStarRating(r.value)
    ]),
    theme: 'plain',
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 'auto', textColor: STAR_COLOR, fontSize: 16 },
    },
    styles: {
      fontSize: 12,
      cellPadding: 4,
    },
    margin: { left: 14 },
  });

  yPos = (doc.lastAutoTable?.finalY ?? yPos) + 15;

  // Reflection Section
  if (training.mostSatisfiedWith || training.improveNextTime || training.howToImprove) {
    yPos = ensurePageSpace(doc, yPos, 30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(sanitizePolishText('Refleksja po treningu'), 14, yPos);
    yPos += 10;

    if (training.mostSatisfiedWith) {
      const lines1 = doc.splitTextToSize(sanitizePolishText(training.mostSatisfiedWith), pageWidth - 28);
      yPos = ensurePageSpace(doc, yPos, 15 + lines1.length * 5.5);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 163, 74); // green-600
      doc.text(sanitizePolishText('Z czego jestem najbardziej zadowolony?'), 14, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      doc.text(lines1, 14, yPos);
      yPos += lines1.length * 5.5 + 8;
    }

    if (training.improveNextTime) {
      const lines2 = doc.splitTextToSize(sanitizePolishText(training.improveNextTime), pageWidth - 28);
      yPos = ensurePageSpace(doc, yPos, 15 + lines2.length * 5.5);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(217, 119, 6); // amber-600
      doc.text(sanitizePolishText('Co nastepnym razem chce zrobic lepiej?'), 14, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      doc.text(lines2, 14, yPos);
      yPos += lines2.length * 5.5 + 8;
    }

    if (training.howToImprove) {
      const lines3 = doc.splitTextToSize(sanitizePolishText(training.howToImprove), pageWidth - 28);
      yPos = ensurePageSpace(doc, yPos, 15 + lines3.length * 5.5);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(147, 51, 234); // purple-600
      doc.text(sanitizePolishText('Jak moge to zrobic?'), 14, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      doc.text(lines3, 14, yPos);
      yPos += lines3.length * 5.5 + 10;
    }
  }

  // Additional Notes
  if (training.notes) {
    const textLines = doc.splitTextToSize(sanitizePolishText(training.notes), pageWidth - 28);
    yPos = ensurePageSpace(doc, yPos, 20 + textLines.length * 5.5);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(sanitizePolishText('Dodatkowe uwagi i komentarze'), 14, yPos);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    yPos += 8;

    doc.text(textLines, 14, yPos);
  }

  addFooter(doc);

  // Download
  const fileName = `trening_${training.date}.pdf`;
  doc.save(fileName);
}
