'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { ComplaintDetailView } from '@/components/complaints/complaint-detail-view';
import { getMockUser } from '@/lib/mock-auth';

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
  const complaintId = params.id as string;
  const currentUser = getMockUser();

  const handleBack = () => {
    router.push('/complaints');
  };

  return (
    <AppLayout
      userRole={currentUser?.role || 'student'}
      userName={currentUser?.full_name || 'User'}
      userEmail={currentUser?.email || 'user@example.com'}
    >
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <ComplaintDetailView 
          complaintId={complaintId}
          onBack={handleBack}
        />
      </div>
    </AppLayout>
  );
}
