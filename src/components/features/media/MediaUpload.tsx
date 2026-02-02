import { useState, useRef, useCallback, useEffect } from 'react';
import { FileInput } from '@/components/ui/FileInput';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MediaPreview } from './MediaPreview';
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGES_PER_ENTITY,
  MAX_VIDEOS_PER_ENTITY,
  MAX_FILES_PER_UPLOAD,
  type UploadedFile,
} from '@/lib/validations/media';
import { formatFileSize } from '@/lib/utils/file';
import { parseErrorResponse, safeJsonParse } from '@/lib/client-helpers';

interface MediaUploadProps {
  entityType: 'training' | 'personal-record';
  entityId?: string;
  existingMedia?: UploadedFile[];
  onUploadComplete: (files: UploadedFile[]) => void;
  onRemove: (fileId: string) => void;
}

/**
 * Component do uploadu plików (zdjęć i filmów)
 * Features: drag & drop, multi-select, progress bar, walidacja
 */
export function MediaUpload({
  entityType,
  entityId,
  existingMedia = [],
  onUploadComplete,
  onRemove,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(existingMedia);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Synchronizuj uploadedFiles z existingMedia
  useEffect(() => {
    setUploadedFiles(existingMedia);
  }, [existingMedia]);

  const imageCount = uploadedFiles.filter((f) => f.fileType === 'image').length;
  const videoCount = uploadedFiles.filter((f) => f.fileType === 'video').length;

  const validateFile = (file: File): string | null => {
    // Sprawdź typ
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type as any);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type as any);

    if (!isImage && !isVideo) {
      return `Nieprawidłowy typ pliku: ${file.type}. Dozwolone: JPG, PNG, WebP, HEIC, MP4, MOV, WebM`;
    }

    // Sprawdź rozmiar
    if (file.size > MAX_FILE_SIZE) {
      return `Plik ${file.name} przekracza limit 50MB (rozmiar: ${formatFileSize(file.size)})`;
    }

    // Sprawdź limity
    if (isImage && imageCount >= MAX_IMAGES_PER_ENTITY) {
      return `Maksymalnie ${MAX_IMAGES_PER_ENTITY} zdjęć na trening/rekord`;
    }

    if (isVideo && videoCount >= MAX_VIDEOS_PER_ENTITY) {
      return `Maksymalnie ${MAX_VIDEOS_PER_ENTITY} film na trening/rekord`;
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    if (entityId) {
      formData.append('entityId', entityId);
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new Error(errorMessage);
    }

    const data = await safeJsonParse<UploadedFile>(response);
    if (!data) {
      throw new Error('Invalid response from server');
    }
    return data;
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setError(null);

      const filesArray = Array.from(files);

      // Sprawdź limit liczby plików jednocześnie
      if (filesArray.length > MAX_FILES_PER_UPLOAD) {
        setError(`Możesz przesłać maksymalnie ${MAX_FILES_PER_UPLOAD} plików jednocześnie`);
        return;
      }

      // Walidacja wszystkich plików PRZED rozpoczęciem uploadu
      const validationErrors: string[] = [];
      for (const file of filesArray) {
        const validationError = validateFile(file);
        if (validationError) {
          validationErrors.push(validationError);
        }
      }

      // Jeśli są błędy walidacji, pokaż je i przerwij przed uploadem
      if (validationErrors.length > 0) {
        setError(validationErrors.join('; '));
        return;
      }

      setUploading(true);
      setProgress(0);
      const results: UploadedFile[] = [];

      try {
        for (let i = 0; i < filesArray.length; i++) {
          const file = filesArray[i];

          // Upload (walidacja już wykonana wyżej)
          try {
            const uploaded = await uploadFile(file);
            if (uploaded) {
              results.push(uploaded);
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Błąd podczas uploadu');
          }

          // Update progress
          setProgress(((i + 1) / filesArray.length) * 100);
        }

        if (results.length > 0) {
          const newFiles = [...uploadedFiles, ...results];
          setUploadedFiles(newFiles);
          onUploadComplete(newFiles);
        }
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [uploadedFiles, imageCount, videoCount, entityType, entityId, onUploadComplete]
  );

  const handleRemove = (fileId: string) => {
    const newFiles = uploadedFiles.filter((f) => f.id !== fileId);
    setUploadedFiles(newFiles);
    onRemove(fileId);
  };

  // Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const acceptedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(',');

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Przeciągnij i upuść pliki tutaj lub
        </p>
        <FileInput
          onChange={handleFiles}
          accept={acceptedTypes}
          multiple
          disabled={uploading}
        >
          Wybierz pliki
        </FileInput>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Dozwolone: {MAX_IMAGES_PER_ENTITY} zdjęć + {MAX_VIDEOS_PER_ENTITY} film (max 50MB każdy)
        </p>
      </div>

      {/* Progress bar */}
      {uploading && (
        <ProgressBar progress={progress} label="Przesyłanie..." showPercentage />
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Podgląd uploadowanych plików */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {uploadedFiles.map((file) => (
            <MediaPreview key={file.id} file={file} onRemove={handleRemove} />
          ))}
        </div>
      )}

      {/* Licznik */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Zdjęcia: {imageCount}/{MAX_IMAGES_PER_ENTITY} | Filmy: {videoCount}/{MAX_VIDEOS_PER_ENTITY}
      </div>
    </div>
  );
}
