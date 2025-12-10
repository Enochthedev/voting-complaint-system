'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Megaphone, Calendar, Plus, Edit, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AnnouncementForm, type Announcement } from '@/components/announcements';
import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from '@/lib/api/announcements';

import { useAuth } from '@/hooks/useAuth';

export default function AdminAnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = React.useState<Announcement | null>(null);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = React.useState<string | null>(null);

  // Load announcements on mount
  React.useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setError(null);
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error loading announcements:', err);
      setError('Failed to load announcements. Please refresh the page.');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleCreateAnnouncement = async (announcementData: Partial<Announcement>) => {
    try {
      setError(null);
      setIsLoading(true);

      if (!user?.id) {
        setError('You must be logged in to create announcements.');
        return;
      }

      const newAnnouncement = await createAnnouncement({
        created_by: user.id,
        title: announcementData.title!,
        content: announcementData.content!,
      });

      setAnnouncements([newAnnouncement, ...announcements]);
      setShowCreateForm(false);
      setSuccess('Announcement created successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating announcement:', err);
      setError('Failed to create announcement. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAnnouncement = async (announcementData: Partial<Announcement>) => {
    try {
      setError(null);
      setIsLoading(true);

      const updatedAnnouncement = await updateAnnouncement(editingAnnouncement!.id, {
        title: announcementData.title!,
        content: announcementData.content!,
      });

      setAnnouncements(
        announcements.map((a) => (a.id === editingAnnouncement?.id ? updatedAnnouncement : a))
      );

      setEditingAnnouncement(null);
      setSuccess('Announcement updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating announcement:', err);
      setError('Failed to update announcement. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (
      !confirm('Are you sure you want to delete this announcement? This action cannot be undone.')
    ) {
      return;
    }

    try {
      setDeletingAnnouncementId(announcementId);
      setError(null);

      await deleteAnnouncement(announcementId);

      setAnnouncements(announcements.filter((a) => a.id !== announcementId));
      setSuccess('Announcement deleted successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting announcement:', err);
      setError('Failed to delete announcement. Please try again.');
    } finally {
      setDeletingAnnouncementId(null);
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

  if (showCreateForm) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Create New Announcement</h1>
          <p className="mt-2 text-muted-foreground">
            Create a system-wide announcement visible to all students
          </p>
        </div>

        <Card className="p-6">
          <AnnouncementForm
            onSave={handleCreateAnnouncement}
            onCancel={() => setShowCreateForm(false)}
            isLoading={isLoading}
          />
        </Card>
      </div>
    );
  }

  if (editingAnnouncement) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Edit Announcement</h1>
          <p className="mt-2 text-muted-foreground">Update the announcement details</p>
        </div>

        <Card className="p-6">
          <AnnouncementForm
            announcement={editingAnnouncement}
            onSave={handleUpdateAnnouncement}
            onCancel={() => setEditingAnnouncement(null)}
            isLoading={isLoading}
          />
        </Card>
      </div>
    );
  }

  // Show loading state on initial load
  if (isInitialLoading) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Manage Announcements</h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage system-wide announcements for students
          </p>
        </div>
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <p className="mt-4 text-muted-foreground">Loading announcements...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Announcements</h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage system-wide announcements for students
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4" />
          Create Announcement
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {announcements.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Megaphone className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No announcements yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first announcement to communicate with students
          </p>
          <Button onClick={() => setShowCreateForm(true)} className="mt-4">
            <Plus className="h-4 w-4" />
            Create Your First Announcement
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const isDeleting = deletingAnnouncementId === announcement.id;

            return (
              <Card key={announcement.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Megaphone className="h-6 w-6 text-primary" />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground">
                          {announcement.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(announcement.created_at)}</span>
                          </div>
                          <Badge variant="secondary">{getTimeAgo(announcement.created_at)}</Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {announcement.content}
                    </p>

                    {announcement.updated_at !== announcement.created_at && (
                      <p className="text-xs text-muted-foreground italic">
                        Last updated: {formatDate(announcement.updated_at)}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAnnouncement(announcement)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        disabled={isDeleting}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
