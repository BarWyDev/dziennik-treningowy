export function QuickAddButton() {
  return (
    <a
      href="/trainings/new"
      className="block bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 rounded-xl shadow-sm p-4 xl:p-5 text-white hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 transition-all h-full"
    >
      <div className="flex items-center gap-3 xl:gap-4 h-full">
        <div className="bg-white/20 dark:bg-white/10 rounded-lg p-2.5 xl:p-3">
          <svg className="w-5 h-5 lg:w-6 lg:h-6 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-base lg:text-lg xl:text-lg">Dodaj trening</p>
          <p className="text-primary-100 dark:text-primary-200 text-xs lg:text-sm xl:text-sm">Zapisz swój dzisiejszy trening</p>
        </div>
      </div>
    </a>
  );
}
