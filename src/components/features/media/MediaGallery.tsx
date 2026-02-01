import { useState } from 'react';
import type { MediaAttachment } from '@/lib/db/schema';
import { normalizeMediaUrl } from '@/lib/utils/media';
import { DeleteConfirmDialog } from '@/components/features/trainings/DeleteConfirmDialog';

interface MediaGalleryProps {
  media: MediaAttachment[];
  onDelete?: (mediaId: string) => Promise<void>;
  canDelete?: boolean;
}

/**
 * Galeria mediów z lightbox
 * Wyświetla zdjęcia i filmy w grid layout
 */
export function MediaGallery({ media, onDelete, canDelete = false }: MediaGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<{ id: string; type: string } | null>(null);

  const images = media.filter((m) => m.fileType === 'image');
  const videos = media.filter((m) => m.fileType === 'video');

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDeleteClick = (mediaId: string, fileType: string) => {
    setMediaToDelete({ id: mediaId, type: fileType });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!mediaToDelete || !onDelete) return;

    setDeleting(mediaToDelete.id);
    try {
      await onDelete(mediaToDelete.id);
      setDeleteDialogOpen(false);
      setMediaToDelete(null);
    } finally {
      setDeleting(null);
    }
  };

  if (media.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Zdjęcia */}
      {images.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Zdjęcia ({images.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <button
                  type="button"
                  onClick={() => openLightbox(index)}
                  className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden block w-full"
                >
                  <img
                    src={normalizeMediaUrl(image.fileUrl)}
                    alt={image.fileName}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </button>
                {canDelete && onDelete && (
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(image.id, 'image')}
                    disabled={deleting === image.id}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                    title="Usuń zdjęcie"
                  >
                    {deleting === image.id ? (
                      <span className="h-4 w-4 block">...</span>
                    ) : (
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
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filmy */}
      {videos.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filmy ({videos.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="relative group">
                <div className="relative rounded-lg overflow-hidden bg-gray-900">
                  {/* Overlay z ikoną play */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-black/30">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-gray-900 ml-1"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  <video
                    src={normalizeMediaUrl(video.fileUrl)}
                    controls
                    className="w-full rounded-lg"
                    preload="metadata"
                    onPlay={(e) => {
                      // Ukryj overlay po rozpoczęciu odtwarzania
                      const overlay = e.currentTarget.previousElementSibling;
                      if (overlay) {
                        (overlay as HTMLElement).style.display = 'none';
                      }
                    }}
                    onPause={(e) => {
                      // Pokaż overlay po zatrzymaniu
                      const overlay = e.currentTarget.previousElementSibling;
                      if (overlay && e.currentTarget.currentTime === 0) {
                        (overlay as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                </div>

                {/* Nazwa pliku */}
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate" title={video.fileName}>
                  {video.fileName}
                </p>

                {canDelete && onDelete && (
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(video.id, 'video')}
                    disabled={deleting === video.id}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50 z-20"
                    title="Usuń film"
                  >
                    {deleting === video.id ? (
                      <span className="h-4 w-4 block">...</span>
                    ) : (
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
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox dla zdjęć */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
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

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 text-white hover:text-gray-300 z-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 text-white hover:text-gray-300 z-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          <img
            src={normalizeMediaUrl(images[lightboxIndex].fileUrl)}
            alt={images[lightboxIndex].fileName}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}

      {/* Dialog potwierdzenia usunięcia */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setMediaToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={`Usuń ${mediaToDelete?.type === 'image' ? 'zdjęcie' : 'film'}`}
        message={`Czy na pewno chcesz usunąć ${mediaToDelete?.type === 'image' ? 'to zdjęcie' : 'ten film'}? Tej operacji nie można cofnąć.`}
      />
    </div>
  );
}
