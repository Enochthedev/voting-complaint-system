'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus } from 'lucide-react';

export interface BulkAssignmentModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;

  /**
   * Callback when modal is closed
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Number of items to be assigned
   */
  itemCount: number;

  /**
   * Available lecturers/admins to assign to
   */
  availableLecturers: Array<{ id: string; name: string }>;

  /**
   * Callback when assignment is confirmed
   */
  onConfirm: (lecturerId: string) => void;

  /**
   * Whether the action is in progress
   */
  isLoading?: boolean;
}

/**
 * BulkAssignmentModal Component
 *
 * Modal for assigning multiple complaints to a lecturer/admin.
 */
export function BulkAssignmentModal({
  open,
  onOpenChange,
  itemCount,
  availableLecturers,
  onConfirm,
  isLoading = false,
}: BulkAssignmentModalProps) {
  const [selectedLecturer, setSelectedLecturer] = React.useState<string>('');

  const handleConfirm = () => {
    if (selectedLecturer) {
      onConfirm(selectedLecturer);
    }
  };

  // Reset selection when modal closes
  React.useEffect(() => {
    if (!open) {
      setSelectedLecturer('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle>Assign Complaints</DialogTitle>
              <DialogDescription className="mt-2">
                Assign {itemCount} {itemCount === 1 ? 'complaint' : 'complaints'} to a lecturer or
                admin.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="lecturer">Assign to</Label>
            <Select
              value={selectedLecturer}
              onValueChange={setSelectedLecturer}
              disabled={isLoading}
            >
              <SelectTrigger id="lecturer">
                <SelectValue placeholder="Select a lecturer or admin" />
              </SelectTrigger>
              <SelectContent>
                {availableLecturers.map((lecturer) => (
                  <SelectItem key={lecturer.id} value={lecturer.id}>
                    {lecturer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              The selected lecturer will be notified and the assignment will be logged in each
              complaint's history.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedLecturer || isLoading}>
            {isLoading ? 'Assigning...' : 'Assign Complaints'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
