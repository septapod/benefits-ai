'use client';

import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface HeaderProps {
  user: User | null;
  onMenuClick: () => void;
  showMenuButton: boolean;
}

export default function Header({ user, onMenuClick, showMenuButton }: HeaderProps) {
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <header className="border-b px-4 py-3 bg-white">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg md:hidden"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">B</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">BenefitsAI</h1>
            <p className="text-sm text-gray-500">Your benefits eligibility assistant</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
