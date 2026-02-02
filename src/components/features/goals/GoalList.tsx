import { useState, useEffect } from 'react';
import { GoalCard } from './GoalCard';
import { GoalForm } from './GoalForm';
import { GoalLimitInfo } from './GoalLimitInfo';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { safeJsonParse } from '@/lib/client-helpers';

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
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const fetchGoals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/goals');
      if (response.ok) {
        const data = await safeJsonParse(response);
        if (data) {
          setGoals(data);
        }
      }
    } catch {
      // Error fetching goals - silent fail
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
    setEditingGoal(null);
    fetchGoals();
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 animate-pulse"
          >
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
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
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Aktywne cele ({activeGoals.length}/{MAX_ACTIVE_GOALS})
          </h2>
          {canAddGoal && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <svg
                className="w-4 h-4 lg:w-5 lg:h-5 mr-1"
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
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <svg
              className="mx-auto h-12 w-12 lg:h-14 lg:w-14 text-gray-400 dark:text-gray-600"
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
            <p className="mt-2 text-sm lg:text-base text-gray-600 dark:text-gray-400">Brak aktywnych celów</p>
            <Button size="sm" className="mt-4" onClick={() => setShowForm(true)}>
              Dodaj pierwszy cel
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onUpdate={fetchGoals} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </div>

      {/* Achieved Goals */}
      {achievedGoals.length > 0 && (
        <div>
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Osiągnięte cele ({achievedGoals.length})
          </h2>
          <div className="space-y-3">
            {achievedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onUpdate={fetchGoals} onEdit={handleEdit} />
            ))}
          </div>
        </div>
      )}

      {/* Archived Goals Toggle */}
      {archivedGoals.length > 0 && (
        <div>
          <button
            type="button"
            className="flex items-center gap-2 text-sm lg:text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={() => setShowArchived(!showArchived)}
          >
            <svg
              className={`w-4 h-4 lg:w-5 lg:h-5 transition-transform ${showArchived ? 'rotate-180' : ''}`}
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
                <GoalCard key={goal.id} goal={goal} onUpdate={fetchGoals} onEdit={handleEdit} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Goal Dialog */}
      <Dialog
        isOpen={showForm || !!editingGoal}
        onClose={() => {
          setShowForm(false);
          setEditingGoal(null);
        }}
        title={editingGoal ? 'Edytuj cel' : 'Dodaj nowy cel'}
      >
        <GoalForm
          goal={editingGoal || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingGoal(null);
          }}
        />
      </Dialog>
    </div>
  );
}
