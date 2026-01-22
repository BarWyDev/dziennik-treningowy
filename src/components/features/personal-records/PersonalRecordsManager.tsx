import { useState } from 'react';
import { PersonalRecordForm } from './PersonalRecordForm';
import { PersonalRecordList } from './PersonalRecordList';
import { PersonalRecordsStats } from './PersonalRecordsStats';

export function PersonalRecordsManager() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRecordAdded = () => {
    // Increment trigger to force re-fetch in list and stats
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Rekordy osobiste</h1>
        <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg">
          Śledź swoje najlepsze osiągnięcia i obserwuj postępy
        </p>
      </div>

      <PersonalRecordsStats key={`stats-${refreshTrigger}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#161b22] rounded-lg shadow-md border border-gray-200 dark:border-gray-800 p-6 sticky top-4">
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Dodaj nowy rekord</h2>
            <PersonalRecordForm onSuccess={handleRecordAdded} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#161b22] rounded-lg shadow-md border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Wszystkie rekordy</h2>
            <PersonalRecordList key={`list-${refreshTrigger}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
