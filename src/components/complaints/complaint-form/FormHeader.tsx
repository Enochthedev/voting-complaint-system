'use client';

import * as React from 'react';
import { FileText } from 'lucide-react';

interface FormHeaderProps {
  isEditing: boolean;
}

/**
 * Form Header Component
 * Displays the form title
 */
export function FormHeader({ isEditing }: FormHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">
            {isEditing ? 'Edit Complaint' : 'Submit a Complaint'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? 'Update your complaint details below'
              : 'Fill out the form below to submit your complaint'}
          </p>
        </div>
      </div>
    </div>
  );
}
