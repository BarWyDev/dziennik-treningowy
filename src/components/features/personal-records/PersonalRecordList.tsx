import { useState, useEffect } from 'react';
import { PersonalRecordCard } from './PersonalRecordCard';
import { PersonalRecordForm } from './PersonalRecordForm';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Dialog } from '@/components/ui/Dialog';

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

export function PersonalRecordList() {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [editingRecord, setEditingRecord] = useState<PersonalRecord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/personal-records?sortBy=${sortBy}&sortOrder=${sortOrder}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [sortBy, sortOrder]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/personal-records/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRecords(records.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error('Error deleting record:', error);
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

  if (isLoading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400 text-base lg:text-lg">Ładowanie...</div>;
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg lg:text-xl">Nie masz jeszcze żadnych rekordów osobistych.</p>
        <p className="text-gray-400 dark:text-gray-500 mt-2 text-base lg:text-lg">Dodaj swój pierwszy rekord używając formularza powyżej!</p>
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
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <Dialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingRecord(null);
        }}
        title="Edytuj rekord"
      >
        {editingRecord && (
          <PersonalRecordForm
            record={editingRecord}
            onSuccess={handleEditSuccess}
          />
        )}
      </Dialog>
    </>
  );
}
