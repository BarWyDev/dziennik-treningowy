import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { generateWeeklyReport } from '@/lib/pdf/weekly-report';
import { generateMonthlyReport } from '@/lib/pdf/monthly-report';
import { safeJsonParse } from '@/lib/client-helpers';

interface Training {
  id: string;
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
  trainingType?: {
    name: string;
  } | null;
}

interface Goal {
  id: string;
  title: string;
  targetValue?: number | null;
  currentValue?: number | null;
  unit?: string | null;
  deadline?: string | null;
  status: string;
  isArchived: boolean;
  achievedAt?: string | null;
  lowerIsBetter?: boolean | null;
}

type ReportType = 'weekly' | 'monthly';

export function PeriodExportDialog() {
  const [isOpen, setIsOpen] = useState(false);
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

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-period-export', handleOpen);
    return () => window.removeEventListener('open-period-export', handleOpen);
  }, []);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let startDate: string;
      let endDate: string;

      if (reportType === 'weekly') {
        const [year, week] = selectedWeek.split('-W').map(Number);
        const dates = getWeekDates(year, week);
        startDate = formatLocalDate(dates.start);
        endDate = formatLocalDate(dates.end);
      } else {
        const [year, month] = selectedMonth.split('-').map(Number);
        startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
      }

      const [trainingsResponse, goalsResponse] = await Promise.all([
        fetch(`/api/trainings?startDate=${startDate}&endDate=${endDate}&limit=100`),
        fetch('/api/goals?limit=100'),
      ]);

      if (!trainingsResponse.ok || !goalsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const trainingsData = await safeJsonParse<{ data: Training[] }>(trainingsResponse);
      const goalsData = await safeJsonParse<{ goals: Goal[] }>(goalsResponse);

      if (!trainingsData || !goalsData) {
        throw new Error('Invalid response from server');
      }

      const trainings: Training[] = trainingsData.data;
      const goals: Goal[] = goalsData.goals.filter((g) => !g.isArchived);

      if (reportType === 'weekly') {
        const [year, week] = selectedWeek.split('-W').map(Number);
        const dates = getWeekDates(year, week);
        generateWeeklyReport({
          trainings,
          goals,
          startDate: dates.start,
          endDate: dates.end,
        });
      } else {
        const [year, month] = selectedMonth.split('-').map(Number);
        generateMonthlyReport({
          trainings,
          goals,
          year,
          month,
        });
      }

      setIsOpen(false);
    } catch {
      // Error exporting report - silent fail
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Eksportuj raport">
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-lg text-sm lg:text-base font-medium transition-colors ${
              reportType === 'weekly'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            onClick={() => setReportType('weekly')}
          >
            Tygodniowy
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-lg text-sm lg:text-base font-medium transition-colors ${
              reportType === 'monthly'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            onClick={() => setReportType('monthly')}
          >
            Miesięczny
          </button>
        </div>

        {reportType === 'weekly' ? (
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
              Wybierz tydzień
            </label>
            <input
              type="week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
              Wybierz miesiąc
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
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
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Anuluj
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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
