import { Button } from '@/components/ui/Button';

export function EmptyState() {
  return (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-16 w-16 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <h3 className="mt-4 text-lg font-medium text-gray-900">Brak treningów</h3>
      <p className="mt-2 text-sm text-gray-500">
        Nie masz jeszcze żadnych zapisanych treningów. Zacznij śledzić swoje postępy!
      </p>
      <div className="mt-6">
        <a href="/trainings/new">
          <Button>
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Dodaj pierwszy trening
          </Button>
        </a>
      </div>
    </div>
  );
}
