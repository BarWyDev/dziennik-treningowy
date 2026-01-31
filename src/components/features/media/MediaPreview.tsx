import type { UploadedFile } from '@/lib/validations/media';
import { formatFileSize } from '@/lib/utils/file';
import { normalizeMediaUrl } from '@/lib/utils/media';

interface MediaPreviewProps {
  file: UploadedFile;
  onRemove: (fileId: string) => void;
  showRemoveButton?: boolean;
}

/**
 * Podgląd pojedynczego pliku (zdjęcie lub film)
 */
export function MediaPreview({ file, onRemove, showRemoveButton = true }: MediaPreviewProps) {
  const handleRemove = () => {
    onRemove(file.id);
  };

  return (
    <div className="relative group">
      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        {file.fileType === 'image' ? (
          <img
            src={normalizeMediaUrl(file.fileUrl)}
            alt={file.fileName}
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={normalizeMediaUrl(file.fileUrl)}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          />
        )}
      </div>

      {showRemoveButton && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
          title="Usuń plik"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 truncate">
        <span className="font-medium">{file.fileName}</span>
        <br />
        <span>{formatFileSize(file.fileSize)}</span>
      </div>
    </div>
  );
}
