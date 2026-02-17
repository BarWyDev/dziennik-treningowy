import { useState } from 'react';
import { PersonalRecordForm } from './PersonalRecordForm';
import { PersonalRecordList } from './PersonalRecordList';
import { PersonalRecordsStats } from './PersonalRecordsStats';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export function PersonalRecordsManager() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const handleRecordAdded = () => {
    // Increment trigger to force re-fetch in list and stats
    setRefreshTrigger((prev) => prev + 1);
    setShowForm(false);
  };

  return (
    <ErrorBoundary>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Rekordy osobiste</h1>
          <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg">
            Śledź swoje najlepsze osiągnięcia i obserwuj postępy
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <svg
            className="w-4 h-4 lg:w-5 lg:h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Dodaj rekord
        </Button>
      </div>

      <PersonalRecordsStats refreshTrigger={refreshTrigger} />

      <div className="bg-white dark:bg-[#161b22] rounded-lg shadow-md border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Wszystkie rekordy</h2>
        <PersonalRecordList refreshTrigger={refreshTrigger} />
      </div>

      {/* Add Record Dialog */}
      <Dialog
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Dodaj nowy rekord"
        size="lg"
      >
        <PersonalRecordForm
          onSuccess={handleRecordAdded}
          onCancel={() => setShowForm(false)}
        />
      </Dialog>
    </div>
    </ErrorBoundary>
  );
}
