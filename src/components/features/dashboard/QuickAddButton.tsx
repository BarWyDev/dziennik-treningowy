export function QuickAddButton() {
  return (
    <a
      href="/trainings/new"
      className="block bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-sm p-6 text-white hover:from-primary-700 hover:to-primary-800 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="bg-white/20 rounded-lg p-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-lg">Dodaj trening</p>
          <p className="text-primary-100 text-sm">Zapisz swój dzisiejszy trening</p>
        </div>
      </div>
    </a>
  );
}
