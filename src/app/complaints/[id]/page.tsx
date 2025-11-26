'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { ComplaintDetailView } from '@/components/complaints/complaint-detail';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Complaint Detail Page
 *
 * Displays full details of a single complaint including:
 * - Complaint information
 * - Attachments
 * - Timeline/history
 * - Comments/discussion
 * - Action buttons based on user role
 */
export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const complaintId = params.id as string;

  React.useEffect(() => {
    if (!authLoading && !user && !authError) {
      router.push('/login');
    }
  }, [user, authLoading, authError, router]);

  const handleBack = () => {
    router.push('/complaints');
  };

  if (authLoading || !user) {
    return (
      <AppLayout
        userRole={(user?.role as any) || 'student'}
        userName={user?.full_name || 'Loading...'}
        userEmail={user?.email || ''}
      >
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <Skeleton className="h-12 w-[300px] mb-4" />
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      userRole={user.role as any}
      userName={user.full_name}
      userEmail={user.email}
    >
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <ComplaintDetailView complaintId={complaintId} onBack={handleBack} />
      </div>
    </AppLayout>
  );
}
