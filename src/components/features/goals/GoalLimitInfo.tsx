import { Alert } from '@/components/ui/Alert';

interface GoalLimitInfoProps {
  activeCount: number;
  maxGoals: number;
}

export function GoalLimitInfo({ activeCount, maxGoals }: GoalLimitInfoProps) {
  const remaining = maxGoals - activeCount;

  if (remaining > 2) return null;

  if (remaining === 0) {
    return (
      <Alert variant="warning" title="Limit celów osiągnięty">
        Masz maksymalną liczbę aktywnych celów ({maxGoals}). Oznacz cel jako osiągnięty
        lub zarchiwizuj, aby dodać nowy.
      </Alert>
    );
  }

  return (
    <Alert variant="info">
      Pozostało {remaining} {remaining === 1 ? 'miejsce' : 'miejsca'} na aktywne cele
      (maks. {maxGoals}).
    </Alert>
  );
}
