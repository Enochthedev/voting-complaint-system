'use client';

import * as React from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { ComplaintListVirtualized } from '@/components/complaints';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateMockComplaints } from '@/lib/mock-data-generator';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Zap, List, Info } from 'lucide-react';

/**
 * Virtual Scrolling Demo Page
 *
 * Demonstrates the performance benefits of virtual scrolling with large datasets.
 * This page generates mock data to showcase how virtual scrolling handles hundreds
 * or thousands of items efficiently.
 */
export default function VirtualScrollingDemoPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [itemCount, setItemCount] = React.useState(100);
  const [complaints, setComplaints] = React.useState(() => generateMockComplaints(100));
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleGenerateData = (count: number) => {
    setItemCount(count);
    setComplaints(generateMockComplaints(count));
    setSelectedIds(new Set());
  };

  const handleComplaintClick = (id: string) => {
    console.log('Clicked complaint:', id);
    // In a real app, navigate to complaint detail
  };

  if (authLoading || !user) {
    return null;
  }

  return (
    <AppLayout userRole={user.role as any} userName={user.full_name} userEmail={user.email}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            Virtual Scrolling Demo
          </h1>
          <p className="text-muted-foreground mt-1">
            Experience smooth scrolling with large datasets
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              What is Virtual Scrolling?
            </CardTitle>
            <CardDescription>
              Virtual scrolling is a performance optimization technique that only renders items
              visible in the viewport, plus a small buffer. This dramatically improves performance
              when dealing with large lists.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Only renders ~10-15 items at a time, regardless of total count</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Reduces DOM nodes from thousands to dozens</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Maintains smooth 60fps scrolling even with 10,000+ items</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Automatically enabled for lists with 50+ items</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Test Data</CardTitle>
            <CardDescription>
              Choose how many items to generate and see virtual scrolling in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={itemCount === 50 ? 'default' : 'outline'}
                onClick={() => handleGenerateData(50)}
              >
                50 items
              </Button>
              <Button
                variant={itemCount === 100 ? 'default' : 'outline'}
                onClick={() => handleGenerateData(100)}
              >
                100 items
              </Button>
              <Button
                variant={itemCount === 500 ? 'default' : 'outline'}
                onClick={() => handleGenerateData(500)}
              >
                500 items
              </Button>
              <Button
                variant={itemCount === 1000 ? 'default' : 'outline'}
                onClick={() => handleGenerateData(1000)}
              >
                1,000 items
              </Button>
              <Button
                variant={itemCount === 5000 ? 'default' : 'outline'}
                onClick={() => handleGenerateData(5000)}
              >
                5,000 items
              </Button>
              <Button
                variant={itemCount === 10000 ? 'default' : 'outline'}
                onClick={() => handleGenerateData(10000)}
              >
                10,000 items
              </Button>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <Button
                variant={selectionMode ? 'default' : 'outline'}
                onClick={() => setSelectionMode(!selectionMode)}
              >
                <List className="h-4 w-4 mr-2" />
                {selectionMode ? 'Exit Selection Mode' : 'Enable Selection Mode'}
              </Button>
              {selectionMode && selectedIds.size > 0 && (
                <Badge variant="secondary">{selectedIds.size} selected</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complaints.length.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rendered Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">~15</div>
              <p className="text-xs text-muted-foreground mt-1">Only visible items + buffer</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Performance Gain
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {complaints.length > 15
                  ? `${Math.round((complaints.length / 15) * 100) / 100}x`
                  : '1x'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Fewer DOM nodes</p>
            </CardContent>
          </Card>
        </div>

        {/* Virtual Scrolling List */}
        <Card>
          <CardHeader>
            <CardTitle>Virtualized Complaint List</CardTitle>
            <CardDescription>
              Scroll through {complaints.length.toLocaleString()} items smoothly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComplaintListVirtualized
              complaints={complaints}
              onComplaintClick={handleComplaintClick}
              containerHeight={600}
              estimateSize={200}
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong>Try scrolling:</strong> Notice how smooth it is even with thousands of
                  items
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong>Open DevTools:</strong> Check the Elements panel to see only ~15 items in
                  the DOM
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong>Compare:</strong> Try generating 10,000 items - it's just as smooth as 100
                  items
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  <strong>Selection mode:</strong> Enable selection to see how interactions remain
                  fast
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
