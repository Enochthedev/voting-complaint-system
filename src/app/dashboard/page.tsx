'use client';

import { useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardGridSkeleton } from '@/components/ui/skeletons';
import { AlertCircle } from 'lucide-react';

// Lazy load dashboard components for better performance
const StudentDashboard = lazy(() =>
  import('./components/student-dashboard').then((mod) => ({ default: mod.StudentDashboard }))
);
const LecturerDashboard = lazy(() =>
  import('./components/lecturer-dashboard').then((mod) => ({ default: mod.LecturerDashboard }))
);
const AdminDashboard = lazy(() =>
  import('./components/admin-dashboard').then((mod) => ({ default: mod.AdminDashboard }))
);

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, error: authError } = useAuth();

  useEffect(() => {
    // Only redirect if we're done loading and definitely have no user
    if (!authLoading && !user && !authError) {
      console.log('No user found, redirecting to login');
      router.push('/login');
    }
  }, [user, authLoading, authError, router]);

  // Loading state
  if (authLoading || !user) {
    return (
      <AppLayout
        userRole={(user?.role as any) || 'student'}
        userName={user?.full_name || 'Loading...'}
        userEmail={user?.email || ''}
      >
        <div className="space-y-6">
          <Skeleton className="h-12 w-[300px]" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (authError) {
    return (
      <AppLayout
        userRole={user?.role || 'student'}
        userName={user?.full_name || 'User'}
        userEmail={user?.email || ''}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">{authError}</p>
        </div>
      </AppLayout>
    );
  }

  // Role-based dashboard rendering with lazy loading
  const renderDashboard = () => {
    const DashboardLoadingFallback = <DashboardGridSkeleton />;

    switch (user.role) {
      case 'admin':
        return (
          <Suspense fallback={DashboardLoadingFallback}>
            <AdminDashboard userId={user.id} userName={user.full_name} />
          </Suspense>
        );
      case 'lecturer':
        return (
          <Suspense fallback={DashboardLoadingFallback}>
            <LecturerDashboard userId={user.id} userName={user.full_name} />
          </Suspense>
        );
      case 'student':
      default:
        return (
          <Suspense fallback={DashboardLoadingFallback}>
            <StudentDashboard userId={user.id} userName={user.full_name} />
          </Suspense>
        );
    }
  };

  return (
    <AppLayout userRole={user.role as any} userName={user.full_name} userEmail={user.email}>
      {renderDashboard()}
    </AppLayout>
  );
}
