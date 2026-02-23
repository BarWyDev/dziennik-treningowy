interface PersonalRecord {
  id: string;
  activityName: string;
  result: string | number;
  unit?: string | null;
  date: string;
}

interface PersonalRecordsWidgetProps {
  totalCount: number;
  lastRecord: PersonalRecord | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function PersonalRecordsWidget({ totalCount, lastRecord }: PersonalRecordsWidgetProps) {
  return (
    <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 xl:p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base lg:text-lg xl:text-lg font-semibold text-gray-900 dark:text-gray-100">
          Rekordy osobiste
        </h2>
        <div className="flex items-center gap-2">
          {totalCount > 0 && (
            <span className="text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
              {totalCount}
            </span>
          )}
          <a
            href="/personal-records"
            className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Wszystkie →
          </a>
        </div>
      </div>

      {!lastRecord ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4 gap-3">
          <svg
            className="w-10 h-10 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M5 3l14 9-14 9V3z"
            />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">Brak rekordów osobistych</p>
          <a
            href="/personal-records"
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            Dodaj pierwszy rekord →
          </a>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-3">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
            Ostatni rekord
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex flex-col gap-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {lastRecord.activityName}
            </p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {lastRecord.result}
              {lastRecord.unit && (
                <span className="text-base font-medium ml-1">{lastRecord.unit}</span>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(lastRecord.date)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
