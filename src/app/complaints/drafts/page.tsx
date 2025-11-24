'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FileText, Clock, Trash2 } from 'lucide-react';

// Mock draft data for UI development
const mockDrafts = [
  {
    id: 'draft-1',
    title: 'WiFi connectivity issues in library',
    category: 'facilities',
    priority: 'medium',
    updatedAt: '2024-11-19T14:30:00Z',
    tags: ['wifi-issues', 'library'],
  },
  {
    id: 'draft-2',
    title: 'Unclear grading criteria for assignment',
    category: 'academic',
    priority: 'low',
    updatedAt: '2024-11-18T10:15:00Z',
    tags: ['grading', 'assignment'],
  },
];

export default function DraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = React.useState(mockDrafts);

  const handleContinue = (draftId: string) => {
    // TODO: Navigate to edit page with draft data in Phase 12
    console.log('Continue editing draft:', draftId);
    router.push(`/complaints/new?draft=${draftId}`);
  };

  const handleDelete = (draftId: string) => {
    // TODO: Implement actual deletion in Phase 12
    if (confirm('Are you sure you want to delete this draft?')) {
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      console.log('Deleted draft:', draftId);
    }
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

  const getPriorityVariant = (priority: string): 'secondary' | 'default' | 'destructive' | 'outline' => {
    const variants: Record<string, 'secondary' | 'default' | 'destructive' | 'outline'> = {
      low: 'secondary',
      medium: 'default',
      high: 'default',
      critical: 'destructive',
    };
    return variants[priority] || 'secondary';
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Draft Complaints</h1>
        <p className="mt-2 text-muted-foreground">
          Continue working on your saved drafts or delete them if no longer needed.
        </p>
      </div>

      {drafts.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No drafts saved</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You don&apos;t have any draft complaints. Start a new complaint and save it as
            a draft to continue later.
          </p>
          <Button className="mt-6" onClick={() => router.push('/complaints/new')}>
            Create New Complaint
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <Card
              key={draft.id}
              className="p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate text-foreground">{draft.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="secondary">
                      {getCategoryLabel(draft.category)}
                    </Badge>
                    <Badge variant={getPriorityVariant(draft.priority)}>
                      {draft.priority.charAt(0).toUpperCase() + draft.priority.slice(1)}
                    </Badge>
                    {draft.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Last edited {formatDate(draft.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContinue(draft.id)}
                  >
                    Continue
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(draft.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
