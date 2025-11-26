'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationDropdown } from '@/components/notifications';
import { useAuth } from '@/hooks/useAuth';

interface AppHeaderProps {
  title?: string;
  showSearch?: boolean;
}

export function AppHeader({ title, showSearch = true }: AppHeaderProps) {
  const router = useRouter();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-6">
      {title && <h1 className="text-xl font-semibold">{title}</h1>}

      {showSearch && (
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search complaints..." className="pl-9" />
          </div>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {user && (
          <span className="text-sm text-muted-foreground">{user.full_name || user.email}</span>
        )}
        <NotificationDropdown />
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
