import { useState, useEffect } from 'react';
import { PersonalRecordCard } from './PersonalRecordCard';
import { PersonalRecordForm } from './PersonalRecordForm';
import { PersonalRecordDetails } from './PersonalRecordDetails';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Dialog } from '@/components/ui/Dialog';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { safeJsonParse, parseErrorResponse } from '@/lib/client-helpers';

interface MediaAttachment {
  id: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
}

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

interface PersonalRecordListProps {
  refreshTrigger?: number;
}

export function PersonalRecordList({ refreshTrigger }: PersonalRecordListProps) {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [editingRecord, setEditingRecord] = useState<PersonalRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<PersonalRecord | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const fetchRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/personal-records?sortBy=${sortBy}&sortOrder=${sortOrder}`);
      if (response.ok) {
        const result = await safeJsonParse(response);
        if (result) {
          setRecords(result.data || []);
        }
      } else {
        const errorMessage = await parseErrorResponse(response);
        setError(errorMessage);
      }
    } catch (err) {
      setError('Nie udało się pobrać rekordów. Sprawdź połączenie z internetem.');
      console.error('Error fetching records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [sortBy, sortOrder, refreshTrigger]);

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    try {
      const response = await fetch(`/api/personal-records/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRecords(records.filter((r) => r.id !== id));
      } else {
        const errorMessage = await parseErrorResponse(response);
        setDeleteError(errorMessage);
      }
    } catch (err) {
      setDeleteError('Nie udało się usunąć rekordu. Spróbuj ponownie.');
      console.error('Error deleting record:', err);
    }
  };

  const handleEdit = (record: PersonalRecord) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingRecord(null);
    fetchRecords();
  };

  const handleView = (record: PersonalRecord) => {
    setViewingRecord(record);
    setIsViewDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400 text-base lg:text-lg">Ładowanie...</div>;
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg lg:text-xl">Nie masz jeszcze żadnych rekordów osobistych.</p>
        <p className="text-gray-400 dark:text-gray-500 mt-2 text-base lg:text-lg">Kliknij przycisk "Dodaj rekord" aby dodać swój pierwszy rekord!</p>
      </div>
    );
  }

  const sortByOptions = [
    { value: 'date', label: 'Data' },
    { value: 'activityName', label: 'Nazwa aktywności' },
    { value: 'result', label: 'Wynik' },
    { value: 'createdAt', label: 'Data dodania' },
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Malejąco' },
    { value: 'asc', label: 'Rosnąco' },
  ];

  return (
    <>
      {error && (
        <Alert variant="error" className="mb-6">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="secondary" onClick={fetchRecords}>
              Spróbuj ponownie
            </Button>
          </div>
        </Alert>
      )}

      {deleteError && (
        <Alert variant="error" className="mb-6">
          <div className="flex items-center justify-between">
            <span>{deleteError}</span>
            <Button size="sm" variant="secondary" onClick={() => setDeleteError(null)}>
              Zamknij
            </Button>
          </div>
        </Alert>
      )}

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="sortBy">Sortuj według</Label>
            <Select
              id="sortBy"
              options={sortByOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            />
          </div>

          <div className="flex-1">
            <Label htmlFor="sortOrder">Kolejność</Label>
            <Select
              id="sortOrder"
              options={sortOrderOptions}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {records.map((record) => (
          <PersonalRecordCard
            key={record.id}
            record={record}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <Dialog
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setViewingRecord(null);
        }}
        title="Szczegóły rekordu"
      >
        {viewingRecord && <PersonalRecordDetails record={viewingRecord} />}
      </Dialog>

      <Dialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingRecord(null);
        }}
        title="Edytuj rekord"
        size="lg"
      >
        {editingRecord && (
          <PersonalRecordForm
            record={editingRecord}
            onSuccess={handleEditSuccess}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setEditingRecord(null);
            }}
          />
        )}
      </Dialog>
    </>
  );
}
