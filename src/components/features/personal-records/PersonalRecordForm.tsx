import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPersonalRecordSchema, type CreatePersonalRecordInput } from '@/lib/validations/personal-record';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { MediaUpload } from '@/components/features/media/MediaUpload';
import type { UploadedFile } from '@/lib/validations/media';

interface MediaAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'video';
  mimeType: string;
  fileSize: number;
}

interface PersonalRecord {
  id: string;
  activityName: string;
  result: string;
  unit: string;
  date: string;
  notes?: string | null;
  media?: MediaAttachment[];
}

interface PersonalRecordFormProps {
  record?: PersonalRecord;
  onSuccess?: () => void;
}

export function PersonalRecordForm({ record, onSuccess }: PersonalRecordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedFile[]>([]);

  const isEditing = !!record;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePersonalRecordInput>({
    resolver: zodResolver(createPersonalRecordSchema),
    defaultValues: {
      activityName: record?.activityName || '',
      result: record?.result || '',
      unit: record?.unit || '',
      date: record?.date || new Date().toISOString().split('T')[0],
      notes: record?.notes || '',
    },
  });

  // Załaduj istniejące media podczas edycji
  useEffect(() => {
    if (record?.media) {
      setUploadedMedia(record.media);
    }
  }, [record]);

  const onSubmit = async (data: CreatePersonalRecordInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = isEditing ? `/api/personal-records/${record.id}` : '/api/personal-records';
      const method = isEditing ? 'PUT' : 'POST';

      // Dodaj mediaIds do payload
      const payload = {
        ...data,
        mediaIds: uploadedMedia.map((m) => m.id),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Wystąpił błąd');
      }

      if (!isEditing) {
        reset();
        setUploadedMedia([]); // Wyczyść uploadowane media po dodaniu rekordu
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaUpload = (files: UploadedFile[]) => {
    setUploadedMedia(files);
  };

  const handleMediaRemove = async (fileId: string) => {
    try {
      await fetch(`/api/media/${fileId}`, { method: 'DELETE' });
      setUploadedMedia((prev) => prev.filter((f) => f.id !== fileId));
    } catch {
      // Error removing media - silent fail
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <Alert variant="error" title="Błąd">{error}</Alert>}

      <div>
        <Label htmlFor="activityName" required>
          Nazwa aktywności
        </Label>
        <Input
          id="activityName"
          type="text"
          placeholder="np. Wyciskanie sztangi, Sprint 100m"
          error={errors.activityName?.message}
          {...register('activityName')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="result" required>
            Wynik
          </Label>
          <Input
            id="result"
            type="text"
            placeholder="np. 100 lub 100,5"
            error={errors.result?.message}
            {...register('result')}
          />
        </div>

        <div>
          <Label htmlFor="unit" required>
            Jednostka
          </Label>
          <Input
            id="unit"
            type="text"
            placeholder="np. kg, km, min, sek"
            error={errors.unit?.message}
            {...register('unit')}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="date" required>
          Data
        </Label>
        <Input
          id="date"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notatki</Label>
        <textarea
          id="notes"
          rows={3}
          className="w-full px-3 py-2 text-sm lg:text-base border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Dodatkowe informacje..."
          {...register('notes')}
        />
        {errors.notes && (
          <p className="mt-1 text-sm lg:text-base text-error-600 dark:text-error-400">{errors.notes.message}</p>
        )}
      </div>

      {/* Media Upload */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <Label>Zdjęcia i filmy (opcjonalnie)</Label>
        <div className="mt-2">
          <MediaUpload
            entityType="personal-record"
            entityId={record?.id}
            existingMedia={uploadedMedia}
            onUploadComplete={handleMediaUpload}
            onRemove={handleMediaRemove}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Zapisywanie...' : isEditing ? 'Zapisz zmiany' : 'Dodaj rekord'}
        </Button>
        {isEditing && onSuccess && (
          <Button type="button" variant="secondary" onClick={onSuccess}>
            Anuluj
          </Button>
        )}
      </div>
    </form>
  );
}
