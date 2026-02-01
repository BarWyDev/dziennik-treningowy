import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DeleteConfirmDialog } from '@/components/features/trainings/DeleteConfirmDialog';
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
  onView: (record: PersonalRecord) => void;
}

export function PersonalRecordCard({ record, onEdit, onDelete, onView }: PersonalRecordCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const images = record.media?.filter((m) => m.fileType === 'image') || [];
  const videos = record.media?.filter((m) => m.fileType === 'video') || [];
  const hasMedia = images.length > 0 || videos.length > 0;

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
        <div className="flex-1">
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
          <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-md line-clamp-2">{record.notes}</p>
        </div>
      )}

      {/* Ikony mediów */}
      {hasMedia && (
        <div className="mb-4 flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Zawiera multimedia</span>
          </div>
          {images.length > 0 && (
            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {images.length} {images.length === 1 ? 'zdjęcie' : 'zdjęć'}
            </span>
          )}
          {videos.length > 0 && (
            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {videos.length} {videos.length === 1 ? 'film' : 'filmów'}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onView(record)}
          className="flex-1 min-w-[70px] text-xs px-2 py-1.5"
        >
          Podgląd
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(record)}
          className="flex-1 min-w-[70px] text-xs px-2 py-1.5"
        >
          Edytuj
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={isDeleting}
          className="flex-1 min-w-[60px] text-xs px-2 py-1.5"
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
