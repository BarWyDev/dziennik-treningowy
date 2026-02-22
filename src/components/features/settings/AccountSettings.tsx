import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dialog } from '@/components/ui/Dialog';
import { Alert } from '@/components/ui/Alert';
import { parseErrorResponse } from '@/lib/client-helpers';

interface UserConsent {
  id: string;
  consentType: string;
  version: string;
  grantedAt: string;
  withdrawnAt: string | null;
}

const consentLabels: Record<string, string> = {
  terms_privacy: 'Regulamin i Polityka Prywatności',
  health_data: 'Przetwarzanie danych zdrowotnych',
};

export function AccountSettings() {
  const [consents, setConsents] = useState<UserConsent[]>([]);
  const [consentsLoading, setConsentsLoading] = useState(true);
  const [consentsError, setConsentsError] = useState('');

  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePasswordError, setDeletePasswordError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchConsents();
  }, []);

  async function fetchConsents() {
    setConsentsLoading(true);
    setConsentsError('');
    try {
      const res = await fetch('/api/account/consent');
      if (!res.ok) {
        setConsentsError('Nie udało się pobrać zgód');
        return;
      }
      const data = await res.json();
      setConsents(data);
    } catch {
      setConsentsError('Nie udało się pobrać zgód');
    } finally {
      setConsentsLoading(false);
    }
  }

  async function handleWithdrawConsent() {
    setWithdrawing(true);
    setWithdrawError('');
    try {
      const res = await fetch('/api/account/consent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentType: 'health_data' }),
      });
      if (!res.ok) {
        setWithdrawError(await parseErrorResponse(res));
        return;
      }
      setWithdrawSuccess(true);
      setWithdrawDialogOpen(false);
      await fetchConsents();
    } catch {
      setWithdrawError('Wystąpił błąd. Spróbuj ponownie.');
    } finally {
      setWithdrawing(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword) {
      setDeletePasswordError('Wpisz hasło aby potwierdzić');
      return;
    }
    setDeletePasswordError('');
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      if (!res.ok) {
        setDeleteError(await parseErrorResponse(res));
        return;
      }
      window.location.href = '/';
    } catch {
      setDeleteError('Wystąpił błąd. Spróbuj ponownie.');
    } finally {
      setDeleting(false);
    }
  }

  const healthDataConsent = consents.find((c) => c.consentType === 'health_data');
  const hasActiveHealthConsent = healthDataConsent && !healthDataConsent.withdrawnAt;

  return (
    <div className="space-y-8">
      {/* Sekcja 1 — Moje zgody */}
      <section className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Moje zgody
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Zarządzaj zgodami na przetwarzanie danych
        </p>

        {consentsLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Ładowanie...</p>
        ) : consentsError ? (
          <Alert variant="error">{consentsError}</Alert>
        ) : consents.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Brak aktywnych zgód</p>
        ) : (
          <div className="space-y-3">
            {consents.map((consent) => (
              <div
                key={consent.id}
                className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {consentLabels[consent.consentType] ?? consent.consentType}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Udzielono:{' '}
                    {new Date(consent.grantedAt).toLocaleDateString('pl-PL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    {' '}· Wersja {consent.version}
                  </p>
                </div>
                {consent.consentType === 'health_data' && !consent.withdrawnAt && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-shrink-0"
                    onClick={() => setWithdrawDialogOpen(true)}
                  >
                    Wycofaj
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {withdrawSuccess && (
          <Alert variant="warning" className="mt-4">
            Zgoda na dane zdrowotne została wycofana. Korzystanie z serwisu nie jest możliwe bez tej
            zgody — rozważ usunięcie konta poniżej.
          </Alert>
        )}
      </section>

      {/* Sekcja 2 — Eksport danych (tymczasowo ukryta) */}
      {/* <section className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Eksport danych (Art. 20 RODO)
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Pobierz kopię swoich danych w formacie JSON. Eksport zawiera wszystkie treningi, cele,
          rekordy osobiste, metadane plików oraz historię zgód.
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            window.location.href = '/api/account/export';
          }}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Pobierz moje dane
        </Button>
      </section> */}

      {/* Sekcja 3 — Usuń konto */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Usunięcie konta
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Usunięcie konta jest nieodwracalne. Wszystkie Twoje dane — treningi, cele, rekordy
          osobiste i pliki — zostaną trwale usunięte.
        </p>
        <Button variant="danger" onClick={() => setDeleteDialogOpen(true)}>
          Usuń konto
        </Button>
      </section>

      {/* Dialog — wycofanie zgody */}
      <Dialog
        isOpen={withdrawDialogOpen}
        onClose={() => {
          setWithdrawDialogOpen(false);
          setWithdrawError('');
        }}
        title="Wycofaj zgodę na dane zdrowotne"
        size="sm"
      >
        <div className="space-y-4">
          <Alert variant="warning">
            Bez zgody na przetwarzanie danych zdrowotnych korzystanie z serwisu TrainWise nie
            jest możliwe, ponieważ aplikacja przetwarza dane o Twojej aktywności fizycznej.
          </Alert>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Czy na pewno chcesz wycofać zgodę? Twoje dane pozostaną w systemie — jeśli chcesz
            je usunąć, skorzystaj z opcji usunięcia konta.
          </p>
          {withdrawError && <Alert variant="error">{withdrawError}</Alert>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                setWithdrawDialogOpen(false);
                setWithdrawError('');
              }}
            >
              Anuluj
            </Button>
            <Button
              variant="danger"
              className="w-full sm:w-auto"
              onClick={handleWithdrawConsent}
              isLoading={withdrawing}
            >
              Wycofaj zgodę
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Dialog — usunięcie konta */}
      <Dialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletePassword('');
          setDeletePasswordError('');
          setDeleteError('');
        }}
        title="Usuń konto"
        size="sm"
      >
        <div className="space-y-4">
          <Alert variant="error">
            Ta operacja jest nieodwracalna. Wszystkie Twoje dane zostaną trwale usunięte i nie
            będzie możliwe ich odzyskanie.
          </Alert>
          <div>
            <label
              htmlFor="delete-password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Wpisz hasło aby potwierdzić
            </label>
            <Input
              id="delete-password"
              type="password"
              value={deletePassword}
              onChange={(e) => {
                setDeletePassword(e.target.value);
                setDeletePasswordError('');
              }}
              placeholder="Twoje hasło"
              error={deletePasswordError}
              autoComplete="current-password"
            />
          </div>
          {deleteError && <Alert variant="error">{deleteError}</Alert>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletePassword('');
                setDeletePasswordError('');
                setDeleteError('');
              }}
            >
              Anuluj
            </Button>
            <Button
              variant="danger"
              className="w-full sm:w-auto"
              onClick={handleDeleteAccount}
              isLoading={deleting}
            >
              Potwierdź usunięcie
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
