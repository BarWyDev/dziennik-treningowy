import { signOut } from '@/lib/auth-client';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface NavigationItem {
  name: string;
  href: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  user?: User;
  navigation: NavigationItem[];
}

export function MobileMenu({ isOpen, user, navigation }: MobileMenuProps) {
  if (!isOpen) return null;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="sm:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0d1117]">
      <div className="pt-2 pb-3 space-y-1">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="block px-4 py-2 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            style={{ fontSize: '15px' }}
          >
            {item.name}
          </a>
        ))}
        <a
          href="/trainings/new"
          className="block px-4 py-2 font-medium text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          style={{ fontSize: '15px' }}
        >
          + Dodaj trening
        </a>
      </div>
      {user && (
        <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-800">
          <div className="px-4 flex items-center">
            <div className="flex-shrink-0">
              {user.image ? (
                <img
                  className="h-10 w-10 rounded-full"
                  src={user.image}
                  alt={user.name}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-3 min-w-0">
              <div className="font-medium text-gray-900 dark:text-gray-100 truncate" style={{ fontSize: '15px' }}>{user.name}</div>
              <div className="text-gray-500 dark:text-gray-400 truncate" style={{ fontSize: '14px' }}>{user.email}</div>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <a
              href="/settings"
              className="block px-4 py-2 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              style={{ fontSize: '15px' }}
            >
              Ustawienia
            </a>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-400 hover:text-error-600 dark:hover:text-error-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              style={{ fontSize: '15px' }}
            >
              Wyloguj się
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
