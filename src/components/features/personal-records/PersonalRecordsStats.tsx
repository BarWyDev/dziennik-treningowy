import { useState, useEffect } from 'react';

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
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="text-center py-4">Ładowanie statystyk...</div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-md">
        <p className="text-blue-100 text-sm font-medium mb-2">Łączna liczba rekordów</p>
        <p className="text-4xl font-bold">{stats.totalCount}</p>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-md">
        <p className="text-green-100 text-sm font-medium mb-2">Ostatnio dodany rekord</p>
        {stats.lastRecord ? (
          <div>
            <p className="text-xl font-bold">{stats.lastRecord.activityName}</p>
            <p className="text-green-100 text-sm mt-1">
              {stats.lastRecord.result} {stats.lastRecord.unit}
              {' • '}
              {new Date(stats.lastRecord.date).toLocaleDateString('pl-PL')}
            </p>
          </div>
        ) : (
          <p className="text-lg">Brak rekordów</p>
        )}
      </div>
    </div>
  );
}
