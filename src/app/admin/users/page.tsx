'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@university.edu', role: 'student', status: 'active' },
  { id: '2', name: 'Dr. Smith', email: 'smith@university.edu', role: 'lecturer', status: 'active' },
  { id: '3', name: 'Admin Davis', email: 'davis@university.edu', role: 'admin', status: 'active' },
];

export default function UsersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, error: authError } = useAuth();

  useEffect(() => {
    if (!authLoading && !user && !authError) {
      router.push('/login');
      return;
    }
    // Only allow admins
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, authError, router]);

  if (authLoading || !user) {
    return (
      <AppLayout
        userRole={(user?.role as any) || 'admin'}
        userName={user?.full_name || 'Loading...'}
        userEmail={user?.email || ''}
      >
        <div className="space-y-6">
          <Skeleton className="h-12 w-[300px]" />
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout userRole={user.role as any} userName={user.full_name} userEmail={user.email}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users and permissions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>View and manage user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {u.role}
                    </Badge>
                    <Badge variant="default">{u.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
