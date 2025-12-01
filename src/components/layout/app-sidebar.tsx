'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  LogOut,
  User,
  ChevronUp,
  ArrowUpCircle,
  X,
  Vote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  userRole: 'student' | 'lecturer' | 'admin';
  userName: string;
  userEmail: string;
  onClose?: () => void;
}

export function AppSidebar({ userRole, userName, userEmail, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Implement actual logout in Phase 12
    console.log('Logging out...');
    // Clear mock user and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mockUser');
      router.push('/login');
    }
  };

  const studentLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/complaints', label: 'My Complaints', icon: FileText, badge: 12 },
    { href: '/complaints/drafts', label: 'Drafts', icon: Inbox, badge: 2 },
    { href: '/votes', label: 'Votes', icon: Vote },
    { href: '/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const lecturerLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/complaints', label: 'All Complaints', icon: FileText, badge: 45 },
    { href: '/complaints?filter=assigned', label: 'Assigned to Me', icon: Users, badge: 8 },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/votes', label: 'Manage Votes', icon: Vote },
    { href: '/admin/templates', label: 'Templates', icon: MessageSquare },
    { href: '/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const adminLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/complaints', label: 'All Complaints', icon: FileText, badge: 45 },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/users', label: 'User Management', icon: Users },
    { href: '/admin/votes', label: 'Manage Votes', icon: Vote },
    { href: '/admin/templates', label: 'Templates', icon: MessageSquare },
    { href: '/admin/escalation-rules', label: 'Escalation Rules', icon: ArrowUpCircle },
    { href: '/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const links =
    userRole === 'admin' ? adminLinks : userRole === 'lecturer' ? lecturerLinks : studentLinks;

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center justify-between px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ComplaintHub
            </span>
          </div>
        </Link>
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Quick Action */}
      {userRole === 'student' && (
        <div className="p-4">
          <Link
            href="/complaints/new"
            onClick={onClose}
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
              onClick={onClose}
              className={cn(
                'group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'h-4 w-4 transition-transform group-hover:scale-110',
                    isActive && 'text-primary'
                  )}
                />
                <span>{link.label}</span>
              </div>
              {link.badge && link.badge > 0 && (
                <Badge
                  variant={isActive ? 'default' : 'secondary'}
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
        <DropdownMenu align="end">
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 rounded-lg bg-secondary/50 p-3 transition-all hover:bg-secondary cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring">
              <Avatar name={userName} size={40} />
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-sm font-semibold truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">{userRole}</p>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs leading-none text-muted-foreground mt-1">{userEmail}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive hover:text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
