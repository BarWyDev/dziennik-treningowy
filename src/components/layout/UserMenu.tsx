import { useState, useRef, useEffect } from 'react';
import { signOut } from '@/lib/auth-client';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="ml-4 relative" ref={menuRef}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-md px-3 py-2 font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        style={{ fontSize: '14px' }}
      >
        {user.image ? (
          <img
            className="h-8 w-8 rounded-full"
            src={user.image}
            alt={user.name}
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="hidden md:block">{user.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-[#161b22] ring-1 ring-black ring-opacity-5 dark:ring-gray-800 divide-y divide-gray-100 dark:divide-gray-800 z-50">
          <div className="px-4 py-3">
            <p className="font-medium text-gray-900 dark:text-gray-100" style={{ fontSize: '14px' }}>{user.name}</p>
            <p className="text-gray-500 dark:text-gray-400 truncate" style={{ fontSize: '13px' }}>{user.email}</p>
          </div>
          <div className="py-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-error-600 dark:hover:text-error-400 flex items-center gap-2 transition-colors"
              style={{ fontSize: '14px' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Wyloguj się
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
