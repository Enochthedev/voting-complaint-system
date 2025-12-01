'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationDropdown } from '@/components/notifications';
import { useAuth } from '@/hooks/useAuth';

interface AppHeaderProps {
  title?: string;
  showSearch?: boolean;
  onMenuClick?: () => void;
}

export function AppHeader({ title, showSearch = true, onMenuClick }: AppHeaderProps) {
  const router = useRouter();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-2 sm:gap-4 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 sm:px-6">
      {/* Mobile menu button */}
      {onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {title && <h1 className="text-lg sm:text-xl font-semibold truncate">{title}</h1>}

      {showSearch && (
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search complaints..." className="pl-9" />
          </div>
        </div>
      )}

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {user && (
          <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[150px]">
            {user.full_name || user.email}
          </span>
        )}
        <NotificationDropdown />
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </header>
  );
}
