import { useState, useEffect } from 'react';
import { WelcomeMessage } from './WelcomeMessage';
import { WeekSummary } from './WeekSummary';
import { RecentTrainings } from './RecentTrainings';
import { ActiveGoals } from './ActiveGoals';
import { QuickAddButton } from './QuickAddButton';

interface TrainingType {
  id: string;
  name: string;
}

interface Training {
  id: string;
  date: string;
  durationMinutes: number;
  trainingType?: TrainingType | null;
}

interface Goal {
  id: string;
  title: string;
  targetValue?: number | null;
  currentValue?: number | null;
  unit?: string | null;
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
}

interface DashboardProps {
  userName: string;
}

export function Dashboard({ userName }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (response.ok) {
          const dashboardData = await response.json();
          setData(dashboardData);
        }
      } catch {
        console.error('Error fetching dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-40 bg-gray-200 rounded-xl animate-pulse" />
          <div className="lg:col-span-2 h-40 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) {
    return <div>Nie udało się załadować danych</div>;
  }

  return (
    <div className="space-y-6">
      <WelcomeMessage userName={userName} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickAddButton />
        <div className="lg:col-span-2">
          <WeekSummary
            trainingsCount={data.weekSummary.trainingsCount}
            totalDuration={data.weekSummary.totalDuration}
            totalCalories={data.weekSummary.totalCalories}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTrainings trainings={data.recentTrainings} />
        <ActiveGoals goals={data.activeGoals} />
      </div>
    </div>
  );
}
