import { useState, useEffect } from 'react';
import { WelcomeMessage } from './WelcomeMessage';
import { WeekSummary } from './WeekSummary';
import { RecentTrainings } from './RecentTrainings';
import { ActiveGoals } from './ActiveGoals';
import { QuickAddButton } from './QuickAddButton';
import { PersonalRecordsWidget } from './PersonalRecordsWidget';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { safeJsonParse, parseErrorResponse } from '@/lib/client-helpers';

interface TrainingType {
  id: string;
  name: string;
}

interface MediaAttachment {
  id: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
}

interface Training {
  id: string;
  date: string;
  durationMinutes: number;
  trainingType?: TrainingType | null;
  media?: MediaAttachment[];
}

interface Goal {
  id: string;
  title: string;
  targetValue?: number | null;
  currentValue?: number | null;
  unit?: string | null;
  deadline?: string | null;
  createdAt: string;
  lowerIsBetter?: boolean | null;
}

interface PersonalRecord {
  id: string;
  activityName: string;
  result: string | number;
  unit?: string | null;
  date: string;
}

interface DashboardData {
  recentTrainings: Training[];
  weekSummary: {
    trainingsCount: number;
    totalDuration: number;
    totalCalories: number;
  };
  activeGoals: Goal[];
  totalStats: {
    trainingsCount: number;
    totalDuration: number;
  };
  personalRecordsStats: {
    totalCount: number;
    lastRecord: PersonalRecord | null;
  };
  streak: number;
}

interface DashboardProps {
  userName: string;
}

export function Dashboard({ userName }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const dashboardData = await safeJsonParse(response);
        if (dashboardData) {
          setData(dashboardData);
        }
      } else {
        const errorMessage = await parseErrorResponse(response);
        setError(errorMessage);
      }
    } catch (err) {
      setError('Nie udało się pobrać danych. Sprawdź połączenie z internetem.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4 xl:space-y-5">
        <div className="h-14 xl:h-16 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-5">
          <div className="h-32 xl:h-36 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="lg:col-span-2 h-32 xl:h-36 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-5">
          <div className="h-56 xl:h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-56 xl:h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 xl:space-y-5">
        <WelcomeMessage userName={userName} />
        <Alert variant="error">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="secondary" onClick={fetchData}>
              Spróbuj ponownie
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return <div className="text-gray-900 dark:text-gray-100">Nie udało się załadować danych</div>;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4 xl:space-y-5">
        <WelcomeMessage userName={userName} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-5">
          <QuickAddButton />
          <div className="lg:col-span-2">
            <WeekSummary
              trainingsCount={data.weekSummary.trainingsCount}
              totalDuration={data.weekSummary.totalDuration}
              totalCalories={data.weekSummary.totalCalories}
              streak={data.streak}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-5">
          <RecentTrainings trainings={data.recentTrainings} />
          <ActiveGoals goals={data.activeGoals} />
          <PersonalRecordsWidget
            totalCount={data.personalRecordsStats.totalCount}
            lastRecord={data.personalRecordsStats.lastRecord}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
