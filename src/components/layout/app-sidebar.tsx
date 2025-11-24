'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Bell,
  Settings,
  BarChart3,
  MessageSquare,
  FileEdit,
  Users,
  Megaphone,
  Plus,
  Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  userRole: 'student' | 'lecturer' | 'admin';
  userName: string;
  userEmail: string;
}

export function AppSidebar({ userRole, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  const studentLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/complaints', label: 'My Complaints', icon: FileText, badge: 12 },
    { href: '/complaints/drafts', label: 'Drafts', icon: Inbox, badge: 2 },
    { href: '/notifications', label: 'Notifications', icon: Bell, badge: 3 },
  ];

  const lecturerLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/complaints', label: 'All Complaints', icon: FileText, badge: 45 },
    { href: '/complaints?filter=assigned', label: 'Assigned to Me', icon: Users, badge: 8 },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/templates', label: 'Templates', icon: MessageSquare },
    { href: '/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/notifications', label: 'Notifications', icon: Bell, badge: 5 },
  ];

  const adminLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/complaints', label: 'All Complaints', icon: FileText, badge: 45 },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/users', label: 'User Management', icon: Users },
    { href: '/admin/templates', label: 'Templates', icon: MessageSquare },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const links =
    userRole === 'admin'
      ? adminLinks
      : userRole === 'lecturer'
        ? lecturerLinks
        : studentLinks;

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ComplaintHub
            </span>
          </div>
        </Link>
      </div>

      {/* Quick Action */}
      {userRole === 'student' && (
        <div className="p-4">
          <Link
            href="/complaints/new"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            New Complaint
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn(
                  "h-4 w-4 transition-transform group-hover:scale-110",
                  isActive && "text-primary"
                )} />
                <span>{link.label}</span>
              </div>
              {link.badge && link.badge > 0 && (
                <Badge 
                  variant={isActive ? "default" : "secondary"} 
                  className="h-5 min-w-[20px] px-1.5 text-xs"
                >
                  {link.badge > 99 ? '99+' : link.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User Profile */}
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3 transition-all hover:bg-secondary cursor-pointer">
          <Avatar name={userName} size={40} />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-xs text-muted-foreground truncate capitalize">{userRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
