import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

function sanitizePolishText(text) {
  const charMap = {
    "ą": "a",
    "ć": "c",
    "ę": "e",
    "ł": "l",
    "ń": "n",
    "ó": "o",
    "ś": "s",
    "ź": "z",
    "ż": "z",
    "Ą": "A",
    "Ć": "C",
    "Ę": "E",
    "Ł": "L",
    "Ń": "N",
    "Ó": "O",
    "Ś": "S",
    "Ź": "Z",
    "Ż": "Z"
  };
  return text.split("").map((char) => charMap[char] || char).join("");
}
function createPDF() {
  const doc = new jsPDF({
    putOnlyUsedFonts: true,
    compress: true
  });
  doc.setFont("helvetica", "normal");
  return doc;
}
function addHeader(doc, title, subtitle) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text(sanitizePolishText(title), pageWidth / 2, 20, { align: "center" });
  if (subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text(sanitizePolishText(subtitle), pageWidth / 2, 28, { align: "center" });
    return 40;
  }
  return 32;
}
function addFooter(doc) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(sanitizePolishText(`Strona ${i} z ${pageCount}`), pageWidth / 2, pageHeight - 10, {
      align: "center"
    });
    const date = (/* @__PURE__ */ new Date()).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    doc.text(sanitizePolishText(`Wygenerowano: ${date}`), 14, pageHeight - 10);
    doc.text("Dziennik Treningowy", pageWidth - 14, pageHeight - 10, {
      align: "right"
    });
  }
}
function formatDateRange(startDate, endDate) {
  const formatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric"
  };
  const start = startDate.toLocaleDateString("pl-PL", formatOptions);
  const end = endDate.toLocaleDateString("pl-PL", formatOptions);
  return `${start} - ${end}`;
}
function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
  return `${mins}min`;
}

export { addHeader as a, addFooter as b, createPDF as c, formatDateRange as d, formatDuration as f, sanitizePolishText as s };
