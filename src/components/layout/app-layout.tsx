'use client';

import * as React from 'react';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';

interface AppLayoutProps {
  children: React.ReactNode;
  userRole?: 'student' | 'lecturer' | 'admin';
  userName?: string;
  userEmail?: string;
  headerTitle?: string;
  showSearch?: boolean;
  notificationCount?: number;
}

export function AppLayout({
  children,
  userRole = 'student',
  userName = 'Guest User',
  userEmail = 'guest@example.com',
  headerTitle,
  showSearch = true,
  notificationCount = 0,
}: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          title={headerTitle}
          showSearch={showSearch}
          notificationCount={notificationCount}
        />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
