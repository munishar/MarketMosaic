import React from 'react';
import { Search, Bell, Bot, LogOut } from 'lucide-react';
import { useAppStore } from '@/store';
import { Avatar } from '@/components/ui/Avatar';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { useAuth } from '@/lib/hooks/useAuth';

export const Header: React.FC = () => {
  const user = useAppStore((s) => s.auth.user);
  const unreadCount = useAppStore((s) => s.notifications.unreadCount);
  const toggleGlobalSearch = useAppStore((s) => s.toggleGlobalSearch);
  const toggleAIPanel = useAppStore((s) => s.toggleAIPanel);
  const { logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Search trigger */}
      <button
        onClick={toggleGlobalSearch}
        className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Search…</span>
        <kbd className="ml-4 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-xs font-mono text-gray-400">
          ⌘K
        </kbd>
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* AI Assistant toggle */}
        <button
          onClick={toggleAIPanel}
          className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Toggle AI Assistant"
        >
          <Bot className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <button
          className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <DropdownMenu
          trigger={
            <Avatar
              src={user?.avatar_url}
              firstName={user?.first_name}
              lastName={user?.last_name}
              size="sm"
            />
          }
        >
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="text-sm font-medium text-gray-900">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <DropdownMenuItem onClick={logout} destructive>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  );
};
