import { useState } from 'react';
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

interface PersonalRecordDetailsProps {
  record: PersonalRecord;
}

export function PersonalRecordDetails({ record }: PersonalRecordDetailsProps) {
  const [media, setMedia] = useState<MediaAttachment[]>(record.media || []);

  const handleMediaDelete = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/media/${mediaId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Nie udało się usunąć pliku');
      }
      setMedia((prev) => prev.filter((m) => m.id !== mediaId));
    } catch {
      // Error deleting media - silent fail
    }
  };

  const formattedDate = new Date(record.date).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div>
        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {record.activityName}
        </h3>
        <p className="text-base lg:text-lg text-gray-500 dark:text-gray-400">{formattedDate}</p>
      </div>

      {/* Wynik */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Wynik</p>
        <p className="text-4xl lg:text-5xl font-bold text-blue-600 dark:text-blue-400">
          {record.result} <span className="text-xl lg:text-2xl font-normal text-gray-700 dark:text-gray-300">{record.unit}</span>
        </p>
      </div>

      {/* Notatki */}
      {record.notes && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notatki</h4>
          <p className="text-base text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            {record.notes}
          </p>
        </div>
      )}

      {/* Media */}
      {media.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Multimedia</h4>
          <MediaGallery
            media={media}
            onDelete={handleMediaDelete}
            canDelete={true}
          />
        </div>
      )}
    </div>
  );
}
