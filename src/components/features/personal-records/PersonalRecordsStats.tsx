import { useState, useEffect } from 'react';
import { safeJsonParse } from '@/lib/client-helpers';

interface PersonalRecord {
  id: string;
  activityName: string;
  result: string;
  unit: string;
  date: string;
  createdAt: Date | string;
}

interface Stats {
  totalCount: number;
  lastRecord: PersonalRecord | null;
}

export function PersonalRecordsStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/personal-records/stats');
        if (response.ok) {
          const data = await safeJsonParse(response);
          if (data) {
            setStats(data);
          }
        }
      } catch {
        // Error fetching stats - silent fail
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="text-center py-4 text-gray-600 dark:text-gray-400 text-base lg:text-lg">Ładowanie statystyk...</div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg p-6 shadow-md">
        <p className="text-blue-100 dark:text-blue-200 text-sm lg:text-base font-medium mb-2">Łączna liczba rekordów</p>
        <p className="text-4xl lg:text-5xl font-bold">{stats.totalCount}</p>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-lg p-6 shadow-md">
        <p className="text-green-100 dark:text-green-200 text-sm lg:text-base font-medium mb-2">Ostatnio dodany rekord</p>
        {stats.lastRecord ? (
          <div>
            <p className="text-xl lg:text-2xl font-bold">{stats.lastRecord.activityName}</p>
            <p className="text-green-100 dark:text-green-200 text-sm lg:text-base mt-1">
              {stats.lastRecord.result} {stats.lastRecord.unit}
              {' • '}
              {new Date(stats.lastRecord.date).toLocaleDateString('pl-PL')}
            </p>
          </div>
        ) : (
          <p className="text-lg lg:text-xl">Brak rekordów</p>
        )}
      </div>
    </div>
  );
}
