import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export interface ComplaintsHeaderProps {
    /**
     * The role of the current user
     */
    userRole: 'student' | 'lecturer' | 'admin';

    /**
     * Callback when "New Complaint" button is clicked
     */
    onNewComplaint: () => void;
}

/**
 * ComplaintsHeader Component
 * 
 * Displays the page header with title, description, and action buttons.
 * Students see "My Complaints" with a "New Complaint" button.
 * Lecturers and admins see "All Complaints" without the button.
 */
export function ComplaintsHeader({
    userRole,
    onNewComplaint
}: ComplaintsHeaderProps) {
    return (
        <div className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">
                    {userRole === 'student' ? 'My Complaints' : 'All Complaints'}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {userRole === 'student'
                        ? 'View and manage your submitted complaints'
                        : 'View and manage all student complaints'}
                </p>
            </div>
            {userRole === 'student' && (
                <Button onClick={onNewComplaint}>
                    <Plus className="h-4 w-4" />
                    New Complaint
                </Button>
            )}
        </div>
    );
}
