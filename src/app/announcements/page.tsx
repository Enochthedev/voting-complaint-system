'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { AnnouncementCardSkeleton } from '@/components/ui/skeletons';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Megaphone, AlertCircle, Calendar } from 'lucide-react';
import { getAnnouncements } from '@/lib/api/announcements';
import type { Announcement } from '@/types/database.types';

// Lazy load Card components for better performance
const Card = lazy(() => import('@/components/ui/card').then((mod) => ({ default: mod.Card })));
const CardContent = lazy(() =>
  import('@/components/ui/card').then((mod) => ({ default: mod.CardContent }))
);
const CardDescription = lazy(() =>
  import('@/components/ui/card').then((mod) => ({ default: mod.CardDescription }))
);
const CardHeader = lazy(() =>
  import('@/components/ui/card').then((mod) => ({ default: mod.CardHeader }))
);
const CardTitle = lazy(() =>
  import('@/components/ui/card').then((mod) => ({ default: mod.CardTitle }))
);

export default function AnnouncementsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user && !authError) {
      router.push('/login');
      return;
    }
    if (user) {
      loadAnnouncements();
    }
  }, [user, authLoading, authError, router]);

  const loadAnnouncements = async () => {
    try {
      setError(null);
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error loading announcements:', err);
      setError('Failed to load announcements. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  };

  if (authLoading || isLoading || !user) {
    return (
      <AppLayout
        userRole={(user?.role as any) || 'student'}
        userName={user?.full_name || 'Loading...'}
        userEmail={user?.email || ''}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
            <p className="text-muted-foreground mt-1">Important updates and system notifications</p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <AnnouncementCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout userRole={user.role as any} userName={user.full_name} userEmail={user.email}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-1">Important updates and system notifications</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Suspense fallback={<AnnouncementCardSkeleton />}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>Stay informed about system updates</CardDescription>
            </CardHeader>
            <CardContent>
              {announcements.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Megaphone className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    No announcements yet
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Check back later for important updates
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="rounded-lg border p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Megaphone className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                            <Badge variant="secondary">{getTimeAgo(announcement.created_at)}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {announcement.content}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(announcement.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Suspense>
      </div>
    </AppLayout>
  );
}
