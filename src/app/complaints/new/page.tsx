'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { ComplaintForm } from '@/components/complaints/complaint-form';
import { useToast } from '@/components/ui/toast';
import { getMockUser } from '@/lib/mock-auth';
import type { ComplaintCategory, ComplaintPriority } from '@/types/database.types';

interface ComplaintFormData {
  title: string;
  description: string;
  category: ComplaintCategory | '';
  priority: ComplaintPriority | '';
  isAnonymous: boolean;
  tags: string[];
}

// Mock draft data for UI development
const mockDrafts: Record<string, ComplaintFormData> = {
  'draft-1': {
    title: 'WiFi connectivity issues in library',
    description: '<p>The WiFi in the library keeps disconnecting every few minutes. This makes it very difficult to complete online assignments and research.</p>',
    category: 'facilities',
    priority: 'medium',
    isAnonymous: false,
    tags: ['wifi-issues', 'library'],
  },
  'draft-2': {
    title: 'Unclear grading criteria for assignment',
    description: '<p>The grading rubric for Assignment 3 is not clear. Several students are confused about the expectations.</p>',
    category: 'academic',
    priority: 'low',
    isAnonymous: false,
    tags: ['grading', 'assignment'],
  },
};

export default function NewComplaintPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const draftId = searchParams.get('draft');
  const currentUser = getMockUser();
  
  // Load draft data if editing
  const [initialData, setInitialData] = React.useState<ComplaintFormData | undefined>();
  const [isLoading, setIsLoading] = React.useState(!!draftId);

  React.useEffect(() => {
    if (draftId) {
      // TODO: Replace with real Supabase API call in Phase 12
      // Simulate loading draft from database
      setTimeout(() => {
        const draftData = mockDrafts[draftId];
        if (draftData) {
          setInitialData(draftData);
        } else {
          toast.error('Draft not found', 'Error');
          router.push('/complaints/new');
        }
        setIsLoading(false);
      }, 500);
    }
  }, [draftId, router, toast]);

  const handleSubmit = async (data: ComplaintFormData, isDraft: boolean) => {
    try {
      // Mock submission for UI development (Phase 3-11)
      // TODO: Replace with real Supabase API call in Phase 12
      const action = draftId ? 'Updating' : 'Submitting';
      console.log(`${action} complaint:`, { ...data, isDraft, draftId });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock success response
      const mockComplaintId = draftId || `complaint-${Date.now()}`;
      console.log(`✅ Complaint ${draftId ? 'updated' : 'created'}:`, mockComplaintId);

      // Show success message with toast notification
      if (isDraft) {
        toast.success(
          draftId ? 'Your draft has been updated successfully!' : 'Your draft has been saved successfully!',
          'Draft Saved'
        );
        router.push('/complaints/drafts');
      } else {
        toast.success(
          'Your complaint has been submitted and will be reviewed by our team.',
          'Complaint Submitted'
        );
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(
        'There was an error processing your request. Please try again.',
        isDraft ? 'Failed to Save Draft' : 'Submission Failed'
      );
      throw error; // Re-throw to let the form handle it
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground">Loading draft...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      userRole={currentUser?.role || 'student'}
      userName={currentUser?.full_name || 'User'}
      userEmail={currentUser?.email || 'user@example.com'}
    >
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {draftId ? 'Edit Draft Complaint' : 'Submit a Complaint'}
          </h1>
        <p className="mt-2 text-muted-foreground">
          {draftId
            ? 'Continue editing your draft complaint. You can save your changes or submit the complaint.'
            : 'Fill out the form below to submit your complaint. You can save it as a draft and complete it later, or submit it immediately.'}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <ComplaintForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={initialData}
          isEditing={!!draftId}
        />
      </div>
    </div>
    </AppLayout>
  );
}
