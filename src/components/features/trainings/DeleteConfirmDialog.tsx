import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  message?: string;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Usuń trening',
  message = 'Czy na pewno chcesz usunąć ten trening? Tej operacji nie można cofnąć.',
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm lg:text-base">{message}</p>
      <div className="flex gap-4">
        <Button
          variant="danger"
          onClick={handleConfirm}
          isLoading={isDeleting}
          className="flex-1"
        >
          Usuń
        </Button>
        <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
          Anuluj
        </Button>
      </div>
    </Dialog>
  );
}
