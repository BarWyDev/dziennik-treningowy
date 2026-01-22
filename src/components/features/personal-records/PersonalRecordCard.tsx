import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface PersonalRecord {
  id: string;
  activityName: string;
  result: string;
  unit: string;
  date: string;
  notes?: string | null;
  createdAt: Date | string;
}

interface PersonalRecordCardProps {
  record: PersonalRecord;
  onEdit: (record: PersonalRecord) => void;
  onDelete: (id: string) => void;
}

export function PersonalRecordCard({ record, onEdit, onDelete }: PersonalRecordCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Czy na pewno chcesz usunąć ten rekord?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(record.id);
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(record.date).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{record.activityName}</h3>
          <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">
            {record.result} <span className="text-sm font-normal text-gray-600">{record.unit}</span>
          </p>
        </div>
      </div>

      {record.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{record.notes}</p>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(record)}
        >
          Edytuj
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-700 hover:border-red-300"
        >
          {isDeleting ? 'Usuwanie...' : 'Usuń'}
        </Button>
      </div>
    </div>
  );
}
