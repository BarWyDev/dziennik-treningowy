import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Goal {
  id: string;
  title: string;
  description?: string | null;
  targetValue?: number | null;
  currentValue?: number | null;
  unit?: string | null;
  deadline?: string | null;
  status: string;
  achievedAt?: string | null;
}

interface GoalCardProps {
  goal: Goal;
  onUpdate: () => void;
  onEdit: (goal: Goal) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getProgress(current: number | null | undefined, target: number | null | undefined): number {
  if (!target || target === 0) return 0;
  const currentVal = current || 0;
  return Math.min(100, Math.round((currentVal / target) * 100));
}

export function GoalCard({ goal, onUpdate, onEdit }: GoalCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const progress = getProgress(goal.currentValue, goal.targetValue);
  const isAchieved = goal.status === 'achieved';
  const hasTarget = goal.targetValue && goal.targetValue > 0;

  const handleAchieve = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/goals/${goal.id}/achieve`, {
        method: 'PATCH',
      });
      if (response.ok) {
        onUpdate();
      }
    } catch {
      console.error('Error achieving goal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/goals/${goal.id}/archive`, {
        method: 'PATCH',
      });
      if (response.ok) {
        onUpdate();
      }
    } catch {
      console.error('Error archiving goal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Czy na pewno chcesz usunąć ten cel?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onUpdate();
      }
    } catch {
      console.error('Error deleting goal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-[#161b22] rounded-xl shadow-sm border p-5 ${
        isAchieved ? 'border-success-200 dark:border-success-700 bg-success-50/50 dark:bg-success-900/20' : 'border-gray-200 dark:border-gray-800'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isAchieved && (
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-success-500 dark:text-success-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <h3 className={`text-base lg:text-lg font-semibold ${isAchieved ? 'text-success-800 dark:text-success-300' : 'text-gray-900 dark:text-gray-100'}`}>
              {goal.title}
            </h3>
          </div>

          {goal.description && (
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
          )}

          {hasTarget && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm lg:text-base mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  {goal.currentValue || 0} / {goal.targetValue} {goal.unit}
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isAchieved ? 'bg-success-500 dark:bg-success-400' : 'bg-primary-600 dark:bg-primary-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {goal.deadline && (
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-2">
              Termin: {formatDate(goal.deadline)}
            </p>
          )}

          {goal.achievedAt && (
            <p className="text-xs lg:text-sm text-success-600 dark:text-success-400 mt-2">
              Osiągnięto: {formatDate(goal.achievedAt)}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          {!isAchieved && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAchieve}
              isLoading={isLoading}
              title="Oznacz jako osiągnięty"
            >
              <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(goal)}
            title="Edytuj cel"
          >
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleArchive}
            isLoading={isLoading}
            title="Zarchiwizuj"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            isLoading={isLoading}
            title="Usuń"
          >
            <svg className="w-4 h-4 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
