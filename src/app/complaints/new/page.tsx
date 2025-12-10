'use client';

import * as React from 'react';
import { Suspense, lazy } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { FormSkeleton } from '@/components/ui/skeletons';
import type { ComplaintCategory, ComplaintPriority } from '@/types/database.types';

// Lazy load the heavy complaint form component
const ComplaintForm = lazy(() =>
  import('@/components/complaints/complaint-form').then((mod) => ({
    default: mod.ComplaintForm,
  }))
);

interface ComplaintFormData {
  title: string;
  description: string;
  category: ComplaintCategory | '';
  priority: ComplaintPriority | '';
  isAnonymous: boolean;
  tags: string[];
}

// TODO: Remove mock data and implement real draft loading from API

function NewComplaintPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const draftId = searchParams.get('draft');

  // Load draft data if editing
  const [initialData, setInitialData] = React.useState<ComplaintFormData | undefined>();
  const [isLoading, setIsLoading] = React.useState(!!draftId);

  React.useEffect(() => {
    if (!authLoading && !user && !authError) {
      router.push('/login');
    }
  }, [user, authLoading, authError, router]);

  React.useEffect(() => {
    if (draftId && user?.id) {
      // Load draft from API
      const loadDraft = async () => {
        try {
          const { getComplaintById } = await import('@/lib/api/complaints');
          const draft = await getComplaintById(draftId);

          if (draft && draft.student_id === user.id && draft.is_draft) {
            setInitialData({
              title: draft.title,
              description: draft.description,
              category: draft.category as any,
              priority: draft.priority as any,
              isAnonymous: draft.is_anonymous,
              tags: draft.complaint_tags?.map((tag: any) => tag.tag_name) || [],
            });
          } else {
            toast.error('Draft not found', 'Error');
            router.push('/complaints/new');
          }
        } catch (error) {
          console.error('Failed to load draft:', error);
          toast.error('Failed to load draft', 'Error');
          router.push('/complaints/new');
        } finally {
          setIsLoading(false);
        }
      };

      loadDraft();
    }
  }, [draftId, user?.id, router, toast]);

  const handleSubmit = async (data: ComplaintFormData, isDraft: boolean) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Import the API function
      const { createComplaint } = await import('@/lib/api/complaints');

      // Prepare complaint data
      const complaintData = {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        is_anonymous: data.isAnonymous,
        is_draft: isDraft,
        student_id: user.id,
        status: isDraft ? 'draft' : 'new',
        tags: data.tags,
      };

      console.log('Creating complaint:', complaintData);

      // Create the complaint
      const result = await createComplaint(complaintData);
      console.log('✅ Complaint created:', result);

      // Show success message with toast notification
      if (isDraft) {
        toast.success('Your draft has been saved successfully!', 'Draft Saved');
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
        error instanceof Error
          ? error.message
          : 'There was an error processing your request. Please try again.',
        isDraft ? 'Failed to Save Draft' : 'Submission Failed'
      );
      throw error; // Re-throw to let the form handle it
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (authLoading || isLoading || !user) {
    return (
      <AppLayout
        userRole={(user?.role as any) || 'student'}
        userName={user?.full_name || 'Loading...'}
        userEmail={user?.email || ''}
      >
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="h-12 w-[300px] mb-4" />
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout userRole={user.role as any} userName={user.full_name} userEmail={user.email}>
      <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {draftId ? 'Edit Draft Complaint' : 'Submit a Complaint'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            {draftId
              ? 'Continue editing your draft complaint. You can save your changes or submit the complaint.'
              : 'Fill out the form below to submit your complaint. You can save it as a draft and complete it later, or submit it immediately.'}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
          <Suspense
            fallback={
              <div className="space-y-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            }
          >
            <ComplaintForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              initialData={initialData}
              isEditing={!!draftId}
            />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  );
}

export default function NewComplaintPage() {
  return (
    <Suspense
      fallback={
        <AppLayout userRole="student" userName="Loading..." userEmail="">
          <div className="container mx-auto max-w-4xl px-4 py-8">
            <Skeleton className="h-12 w-[300px] mb-4" />
            <FormSkeleton />
          </div>
        </AppLayout>
      }
    >
      <NewComplaintPageContent />
    </Suspense>
  );
}
