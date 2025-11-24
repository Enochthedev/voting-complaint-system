'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMockUser, mockSignOut } from '@/lib/mock-auth';
import type { MockUser } from '@/lib/mock-auth';
import { Button } from '@/components/ui/button';
import { FileText, Clock, ArrowRight, Plus } from 'lucide-react';

// Mock draft data for UI development
const mockDrafts = [
  {
    id: 'draft-1',
    title: 'WiFi connectivity issues in library',
    category: 'facilities',
    priority: 'medium',
    updatedAt: '2024-11-19T14:30:00Z',
  },
  {
    id: 'draft-2',
    title: 'Unclear grading criteria for assignment',
    category: 'academic',
    priority: 'low',
    updatedAt: '2024-11-18T10:15:00Z',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [drafts, setDrafts] = useState(mockDrafts);

  useEffect(() => {
    // Check if user is logged in (mock auth)
    const currentUser = getMockUser();
    
    if (!currentUser) {
      // Redirect to login if not authenticated
      router.push('/auth/login');
      return;
    }

    setUser(currentUser);
    setIsLoading(false);
  }, [router]);

  const handleSignOut = () => {
    mockSignOut();
    router.push('/auth/login');
  };

  const handleContinueDraft = (draftId: string) => {
    // Navigate to complaint form with draft ID
    router.push(`/complaints/new?draft=${draftId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      academic: 'Academic',
      facilities: 'Facilities',
      harassment: 'Harassment',
      course_content: 'Course Content',
      administrative: 'Administrative',
      other: 'Other',
    };
    return labels[category] || category;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[priority] || colors.low;
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-50"></div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  const role = user.role;
  const fullName = user.full_name;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Welcome, {fullName}!
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Role: <span className="font-medium capitalize">{role}</span>
            </p>
          </div>
          <Button onClick={() => router.push('/complaints/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Complaint
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Draft Complaints Section */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                Draft Complaints
              </h2>
              {drafts.length > 0 && (
                <button
                  onClick={() => router.push('/complaints/drafts')}
                  className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  View all
                </button>
              )}
            </div>

            {drafts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-zinc-400" />
                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                  No draft complaints
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  Save complaints as drafts to continue later
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {drafts.slice(0, 3).map((draft) => (
                  <div
                    key={draft.id}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate text-zinc-900 dark:text-zinc-50">
                          {draft.title}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full bg-white px-2 py-1 dark:bg-zinc-900">
                            {getCategoryLabel(draft.category)}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 font-medium ${getPriorityColor(
                              draft.priority
                            )}`}
                          >
                            {draft.priority.charAt(0).toUpperCase() + draft.priority.slice(1)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(draft.updatedAt)}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContinueDraft(draft.id)}
                        className="shrink-0"
                      >
                        Continue
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
                {drafts.length > 3 && (
                  <button
                    onClick={() => router.push('/complaints/drafts')}
                    className="w-full text-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 py-2"
                  >
                    View {drafts.length - 3} more draft{drafts.length - 3 !== 1 ? 's' : ''}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions Section */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/complaints/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit New Complaint
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/complaints')}
              >
                <FileText className="h-4 w-4 mr-2" />
                View My Complaints
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/complaints/drafts')}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Draft Complaints
              </Button>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            System Status
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                ✅ Authentication Working
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Logged in as {user.email}
              </p>
            </div>

            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
                ✅ Protected Route Working
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Dashboard is protected
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              💡 Using mock data for UI development. Real API integration in Phase 12.
            </p>
            <button
              onClick={handleSignOut}
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Sign out →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
