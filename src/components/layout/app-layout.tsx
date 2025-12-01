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
}

export function AppLayout({
  children,
  userRole = 'student',
  userName = 'Guest User',
  userEmail = 'guest@example.com',
  headerTitle,
  showSearch = true,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, shown on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <AppSidebar
          userRole={userRole}
          userName={userName}
          userEmail={userEmail}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          title={headerTitle}
          showSearch={showSearch}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
