import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DeleteConfirmDialog } from '@/components/features/trainings/DeleteConfirmDialog';
import { MediaGallery } from '@/components/features/media/MediaGallery';
import type { MediaAttachment } from '@/lib/db/schema';

interface PersonalRecord {
  id: string;
  activityName: string;
  result: string;
  unit: string;
  date: string;
  notes?: string | null;
  media?: MediaAttachment[];
  createdAt: Date | string;
}

interface PersonalRecordCardProps {
  record: PersonalRecord;
  onEdit: (record: PersonalRecord) => void;
  onDelete: (id: string) => void;
}

export function PersonalRecordCard({ record, onEdit, onDelete }: PersonalRecordCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [media, setMedia] = useState<MediaAttachment[]>(record.media || []);

  const handleMediaDelete = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/media/${mediaId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Nie udało się usunąć pliku');
      }
      setMedia((prev) => prev.filter((m) => m.id !== mediaId));
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(record.id);
    } catch (error) {
      setIsDeleting(false);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const formattedDate = new Date(record.date).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100">{record.activityName}</h3>
          <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">{formattedDate}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400">
            {record.result} <span className="text-sm lg:text-base font-normal text-gray-600 dark:text-gray-400">{record.unit}</span>
          </p>
        </div>
      </div>

      {record.notes && (
        <div className="mb-4">
          <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">{record.notes}</p>
        </div>
      )}

      {media.length > 0 && (
        <div className="mb-4">
          <MediaGallery
            media={media}
            onDelete={handleMediaDelete}
            canDelete={true}
          />
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(record)}
        >
          Edytuj
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={isDeleting}
        >
          Usuń
        </Button>
      </div>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Usuń rekord osobisty"
        message="Czy na pewno chcesz usunąć ten rekord osobisty? Tej operacji nie można cofnąć."
      />
    </div>
  );
}
