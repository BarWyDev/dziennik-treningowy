import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { generateWeeklyReport } from '@/lib/pdf/weekly-report';
import { generateMonthlyReport } from '@/lib/pdf/monthly-report';

interface Training {
  id: string;
  date: string;
  durationMinutes: number;
  notes?: string | null;
  rating?: number | null;
  caloriesBurned?: number | null;
  trainingType?: {
    name: string;
  } | null;
}

interface PeriodExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReportType = 'weekly' | 'monthly';

export function PeriodExportDialog({ isOpen, onClose }: PeriodExportDialogProps) {
  const [reportType, setReportType] = useState<ReportType>('weekly');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const now = new Date();
    return getWeekString(now);
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let startDate: string;
      let endDate: string;

      if (reportType === 'weekly') {
        const [year, week] = selectedWeek.split('-W').map(Number);
        const dates = getWeekDates(year, week);
        startDate = dates.start.toISOString().split('T')[0];
        endDate = dates.end.toISOString().split('T')[0];
      } else {
        const [year, month] = selectedMonth.split('-').map(Number);
        startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
      }

      const response = await fetch(
        `/api/trainings?startDate=${startDate}&endDate=${endDate}&limit=100`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch trainings');
      }

      const data = await response.json();
      const trainings: Training[] = data.data;

      if (reportType === 'weekly') {
        const [year, week] = selectedWeek.split('-W').map(Number);
        const dates = getWeekDates(year, week);
        generateWeeklyReport({
          trainings,
          startDate: dates.start,
          endDate: dates.end,
        });
      } else {
        const [year, month] = selectedMonth.split('-').map(Number);
        generateMonthlyReport({
          trainings,
          year,
          month,
        });
      }

      onClose();
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Eksportuj raport">
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              reportType === 'weekly'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setReportType('weekly')}
          >
            Tygodniowy
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              reportType === 'monthly'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setReportType('monthly')}
          >
            Miesięczny
          </button>
        </div>

        {reportType === 'weekly' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wybierz tydzień
            </label>
            <input
              type="week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wybierz miesiąc
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button onClick={handleExport} isLoading={isExporting} className="flex-1">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Eksportuj PDF
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Anuluj
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function getWeekString(date: Date): string {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getWeekDates(year: number, week: number): { start: Date; end: Date } {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const start = new Date(simple);
  if (dow <= 4) {
    start.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    start.setDate(simple.getDate() + 8 - simple.getDay());
  }
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}
