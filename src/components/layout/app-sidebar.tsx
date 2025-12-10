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
import { useAuth } from '@/hooks/useAuth';
import { useUserComplaints, useUserDrafts, useAllComplaints } from '@/hooks/use-complaints';

interface SidebarProps {
  userRole: 'student' | 'lecturer' | 'admin';
  userName: string;
  userEmail: string;
  onClose?: () => void;
}

export function AppSidebar({ userRole, userName, userEmail, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  // Get dynamic counts for badges
  const { data: userComplaints = [] } = useUserComplaints(user?.id || '');
  const { data: userDrafts = [] } = useUserDrafts(user?.id || '');
  const { data: allComplaints = [] } = useAllComplaints();

  // Calculate badge counts
  const myComplaintsCount = userComplaints.length;
  const draftsCount = userDrafts.length;
  const allComplaintsCount = allComplaints.length;
  const assignedToMeCount = allComplaints.filter((c) => c.assigned_to === user?.id).length;

  const handleLogout = async () => {
    try {
      // Use real auth logout
      const { signOut } = await import('@/lib/auth');
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: redirect anyway
      router.push('/login');
    }
  };

  const studentLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/complaints', label: 'My Complaints', icon: FileText, badge: myComplaintsCount },
    { href: '/complaints/drafts', label: 'Drafts', icon: Inbox, badge: draftsCount },
    { href: '/votes', label: 'Votes', icon: Vote },
    { href: '/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const lecturerLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/complaints', label: 'All Complaints', icon: FileText, badge: allComplaintsCount },
    {
      href: '/complaints?filter=assigned',
      label: 'Assigned to Me',
      icon: Users,
      badge: assignedToMeCount,
    },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/votes', label: 'Manage Votes', icon: Vote },
    { href: '/admin/templates', label: 'Templates', icon: MessageSquare },
    { href: '/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const adminLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/complaints', label: 'All Complaints', icon: FileText, badge: allComplaintsCount },
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
      <div className="flex h-16 items-center justify-between px-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-rainbow text-white shadow-lg animate-rainbow">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-gradient">ComplaintHub</span>
          </div>
        </Link>
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-pink-100 transition-colors text-purple-600"
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
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-sunset px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
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
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-sm border border-purple-200'
                  : 'text-muted-foreground hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 hover:text-orange-700'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'h-4 w-4 transition-transform group-hover:scale-110',
                    isActive && 'text-purple-600'
                  )}
                />
                <span>{link.label}</span>
              </div>
              {link.badge && link.badge > 0 && (
                <Badge
                  className={cn(
                    'h-5 min-w-[20px] px-1.5 text-xs',
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gradient-to-r from-orange-400 to-red-400 text-white'
                  )}
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
            <button className="w-full flex items-center gap-3 rounded-lg bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 p-3 transition-all hover:from-teal-100 hover:to-blue-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-300">
              <Avatar name={userName} size={40} />
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-sm font-semibold truncate text-teal-800">{userName}</p>
                <p className="text-xs text-teal-600 truncate capitalize">{userRole}</p>
              </div>
              <ChevronUp className="h-4 w-4 text-teal-600" />
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
