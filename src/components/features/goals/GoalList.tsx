import { useState, useEffect } from 'react';
import { GoalCard } from './GoalCard';
import { GoalForm } from './GoalForm';
import { GoalLimitInfo } from './GoalLimitInfo';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

interface Goal {
  id: string;
  title: string;
  description?: string | null;
  targetValue?: number | null;
  currentValue?: number | null;
  unit?: string | null;
  deadline?: string | null;
  status: string;
  isArchived: boolean;
  achievedAt?: string | null;
}

const MAX_ACTIVE_GOALS = 5;

export function GoalList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch {
      console.error('Error fetching goals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const activeGoals = goals.filter((g) => !g.isArchived && g.status === 'active');
  const achievedGoals = goals.filter((g) => !g.isArchived && g.status === 'achieved');
  const archivedGoals = goals.filter((g) => g.isArchived);

  const canAddGoal = activeGoals.length < MAX_ACTIVE_GOALS;

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchGoals();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse"
          >
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GoalLimitInfo activeCount={activeGoals.length} maxGoals={MAX_ACTIVE_GOALS} />

      {/* Active Goals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Aktywne cele ({activeGoals.length}/{MAX_ACTIVE_GOALS})
          </h2>
          {canAddGoal && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <svg
                className="w-4 h-4 mr-1"
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
              Dodaj cel
            </Button>
          )}
        </div>

        {activeGoals.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <p className="mt-2 text-gray-600">Brak aktywnych celów</p>
            <Button size="sm" className="mt-4" onClick={() => setShowForm(true)}>
              Dodaj pierwszy cel
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onUpdate={fetchGoals} />
            ))}
          </div>
        )}
      </div>

      {/* Achieved Goals */}
      {achievedGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Osiągnięte cele ({achievedGoals.length})
          </h2>
          <div className="space-y-3">
            {achievedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onUpdate={fetchGoals} />
            ))}
          </div>
        </div>
      )}

      {/* Archived Goals Toggle */}
      {archivedGoals.length > 0 && (
        <div>
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            onClick={() => setShowArchived(!showArchived)}
          >
            <svg
              className={`w-4 h-4 transition-transform ${showArchived ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            {showArchived ? 'Ukryj' : 'Pokaż'} zarchiwizowane ({archivedGoals.length})
          </button>

          {showArchived && (
            <div className="mt-4 space-y-3 opacity-60">
              {archivedGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onUpdate={fetchGoals} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Goal Dialog */}
      <Dialog isOpen={showForm} onClose={() => setShowForm(false)} title="Dodaj nowy cel">
        <GoalForm onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />
      </Dialog>
    </div>
  );
}
