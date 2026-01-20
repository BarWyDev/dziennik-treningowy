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
    <div className="sm:hidden border-t border-gray-200">
      <div className="pt-2 pb-3 space-y-1">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
          >
            {item.name}
          </a>
        ))}
        <a
          href="/trainings/new"
          className="block px-4 py-2 text-base font-medium text-primary-600 hover:bg-gray-50"
        >
          + Dodaj trening
        </a>
      </div>
      {user && (
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="px-4 flex items-center">
            <div className="flex-shrink-0">
              {user.image ? (
                <img
                  className="h-10 w-10 rounded-full"
                  src={user.image}
                  alt={user.name}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-gray-800">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:text-error-600 hover:bg-gray-50"
            >
              Wyloguj się
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
