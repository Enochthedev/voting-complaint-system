'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { exportComplaintToPDF } from '@/lib/export/pdf-export';

/**
 * Demo page for testing PDF export functionality
 * Validates: Requirements AC20 (Export Functionality)
 */
export default function PDFExportDemoPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');

  // Mock complaint data for testing
  const mockComplaint = {
    id: 'demo-complaint-123',
    title: 'Broken Air Conditioning in Lecture Hall A',
    description: `<p>The air conditioning system in Lecture Hall A has been malfunctioning for the past week. 
    The temperature in the room becomes unbearably hot during afternoon classes, making it difficult for students to concentrate.</p>
    <p>This issue affects approximately 200 students who have classes in this hall daily.</p>
    <p>We request immediate attention to this matter as it significantly impacts the learning environment.</p>`,
    category: 'facilities' as const,
    priority: 'high' as const,
    status: 'resolved' as const,
    is_anonymous: false,
    is_draft: false,
    student_id: 'student-123',
    assigned_to: 'lecturer-456',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-25T15:30:00Z',
    opened_at: '2024-01-16T09:00:00Z',
    opened_by: 'lecturer-456',
    resolved_at: '2024-01-25T15:30:00Z',
    escalated_at: null,
    escalation_level: 0,
    student: {
      id: 'student-123',
      full_name: 'John Doe',
      email: 'john.doe@university.edu',
    },
    assigned_user: {
      id: 'lecturer-456',
      full_name: 'Dr. Sarah Smith',
      email: 'sarah.smith@university.edu',
    },
    tags: [
      {
        id: 'tag-1',
        complaint_id: 'demo-complaint-123',
        tag_name: 'urgent',
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 'tag-2',
        complaint_id: 'demo-complaint-123',
        tag_name: 'facilities',
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 'tag-3',
        complaint_id: 'demo-complaint-123',
        tag_name: 'lecture-hall',
        created_at: '2024-01-15T10:00:00Z',
      },
    ],
    attachments: [
      {
        id: 'att-1',
        complaint_id: 'demo-complaint-123',
        file_name: 'temperature_readings.pdf',
        file_path: '/storage/complaints/demo-complaint-123/temperature_readings.pdf',
        file_size: 524288, // 512 KB
        file_type: 'application/pdf',
        uploaded_by: 'student-123',
        created_at: '2024-01-15T10:05:00Z',
      },
      {
        id: 'att-2',
        complaint_id: 'demo-complaint-123',
        file_name: 'photo_evidence.jpg',
        file_path: '/storage/complaints/demo-complaint-123/photo_evidence.jpg',
        file_size: 2097152, // 2 MB
        file_type: 'image/jpeg',
        uploaded_by: 'student-123',
        created_at: '2024-01-15T10:06:00Z',
      },
    ],
    history: [
      {
        id: 'hist-1',
        complaint_id: 'demo-complaint-123',
        action: 'created' as const,
        old_value: null,
        new_value: 'new',
        performed_by: 'student-123',
        details: null,
        created_at: '2024-01-15T10:00:00Z',
        performed_by_user: {
          id: 'student-123',
          full_name: 'John Doe',
          email: 'john.doe@university.edu',
        },
      },
      {
        id: 'hist-2',
        complaint_id: 'demo-complaint-123',
        action: 'status_changed' as const,
        old_value: 'new',
        new_value: 'opened',
        performed_by: 'lecturer-456',
        details: null,
        created_at: '2024-01-16T09:00:00Z',
        performed_by_user: {
          id: 'lecturer-456',
          full_name: 'Dr. Sarah Smith',
          email: 'sarah.smith@university.edu',
        },
      },
      {
        id: 'hist-3',
        complaint_id: 'demo-complaint-123',
        action: 'assigned' as const,
        old_value: null,
        new_value: 'lecturer-456',
        performed_by: 'admin-789',
        details: null,
        created_at: '2024-01-16T09:15:00Z',
        performed_by_user: {
          id: 'admin-789',
          full_name: 'Admin User',
          email: 'admin@university.edu',
        },
      },
      {
        id: 'hist-4',
        complaint_id: 'demo-complaint-123',
        action: 'status_changed' as const,
        old_value: 'opened',
        new_value: 'in_progress',
        performed_by: 'lecturer-456',
        details: null,
        created_at: '2024-01-17T14:00:00Z',
        performed_by_user: {
          id: 'lecturer-456',
          full_name: 'Dr. Sarah Smith',
          email: 'sarah.smith@university.edu',
        },
      },
      {
        id: 'hist-5',
        complaint_id: 'demo-complaint-123',
        action: 'feedback_added' as const,
        old_value: null,
        new_value: 'Feedback provided',
        performed_by: 'lecturer-456',
        details: null,
        created_at: '2024-01-20T11:00:00Z',
        performed_by_user: {
          id: 'lecturer-456',
          full_name: 'Dr. Sarah Smith',
          email: 'sarah.smith@university.edu',
        },
      },
      {
        id: 'hist-6',
        complaint_id: 'demo-complaint-123',
        action: 'status_changed' as const,
        old_value: 'in_progress',
        new_value: 'resolved',
        performed_by: 'lecturer-456',
        details: null,
        created_at: '2024-01-25T15:30:00Z',
        performed_by_user: {
          id: 'lecturer-456',
          full_name: 'Dr. Sarah Smith',
          email: 'sarah.smith@university.edu',
        },
      },
      {
        id: 'hist-7',
        complaint_id: 'demo-complaint-123',
        action: 'rated' as const,
        old_value: null,
        new_value: '5',
        performed_by: 'student-123',
        details: { feedback: 'Excellent resolution!' },
        created_at: '2024-01-25T16:00:00Z',
        performed_by_user: {
          id: 'student-123',
          full_name: 'John Doe',
          email: 'john.doe@university.edu',
        },
      },
    ],
    comments: [
      {
        id: 'comment-1',
        complaint_id: 'demo-complaint-123',
        user_id: 'student-123',
        comment: 'The issue is getting worse. Today the temperature reached 32°C.',
        is_internal: false,
        created_at: '2024-01-17T10:00:00Z',
        updated_at: '2024-01-17T10:00:00Z',
        user: {
          id: 'student-123',
          full_name: 'John Doe',
          email: 'john.doe@university.edu',
          role: 'student',
        },
      },
      {
        id: 'comment-2',
        complaint_id: 'demo-complaint-123',
        user_id: 'lecturer-456',
        comment:
          'I have contacted the facilities department. They will inspect the system tomorrow.',
        is_internal: false,
        created_at: '2024-01-17T14:30:00Z',
        updated_at: '2024-01-17T14:30:00Z',
        user: {
          id: 'lecturer-456',
          full_name: 'Dr. Sarah Smith',
          email: 'sarah.smith@university.edu',
          role: 'lecturer',
        },
      },
      {
        id: 'comment-3',
        complaint_id: 'demo-complaint-123',
        user_id: 'student-123',
        comment: 'Thank you for the quick response!',
        is_internal: false,
        created_at: '2024-01-17T15:00:00Z',
        updated_at: '2024-01-17T15:00:00Z',
        user: {
          id: 'student-123',
          full_name: 'John Doe',
          email: 'john.doe@university.edu',
          role: 'student',
        },
      },
    ],
    feedback: [
      {
        id: 'feedback-1',
        complaint_id: 'demo-complaint-123',
        lecturer_id: 'lecturer-456',
        content:
          'The facilities team has identified the issue as a faulty compressor. They have ordered a replacement part which will arrive in 3-5 business days. In the meantime, they have provided portable cooling units for the lecture hall.',
        created_at: '2024-01-20T11:00:00Z',
        updated_at: '2024-01-20T11:00:00Z',
        lecturer: {
          id: 'lecturer-456',
          full_name: 'Dr. Sarah Smith',
          email: 'sarah.smith@university.edu',
        },
      },
      {
        id: 'feedback-2',
        complaint_id: 'demo-complaint-123',
        lecturer_id: 'lecturer-456',
        content:
          'The new compressor has been installed and the air conditioning system is now fully operational. The temperature has been tested and is maintaining a comfortable 22°C.',
        created_at: '2024-01-25T15:30:00Z',
        updated_at: '2024-01-25T15:30:00Z',
        lecturer: {
          id: 'lecturer-456',
          full_name: 'Dr. Sarah Smith',
          email: 'sarah.smith@university.edu',
        },
      },
    ],
    rating: [
      {
        id: 'rating-1',
        complaint_id: 'demo-complaint-123',
        student_id: 'student-123',
        rating: 5,
        feedback_text:
          'Excellent resolution! The issue was addressed promptly and the communication throughout the process was clear. Very satisfied with the outcome.',
        created_at: '2024-01-25T16:00:00Z',
      },
    ],
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus('Generating PDF...');

    try {
      await exportComplaintToPDF(mockComplaint as any);
      setExportStatus('✅ PDF exported successfully! Check your downloads folder.');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setExportStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">PDF Export Demo</h1>
        <p className="text-muted-foreground">
          Test the complaint PDF export functionality with sample data
        </p>
      </div>

      <div className="space-y-6">
        {/* Sample Complaint Preview */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">{mockComplaint.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">ID: {mockComplaint.id}</p>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                {mockComplaint.priority.toUpperCase()}
              </span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                {mockComplaint.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Category:</span> {mockComplaint.category}
            </div>
            <div>
              <span className="font-medium">Submitted by:</span> {mockComplaint.student?.full_name}
            </div>
            <div>
              <span className="font-medium">Assigned to:</span>{' '}
              {mockComplaint.assigned_user?.full_name}
            </div>
            <div>
              <span className="font-medium">Tags:</span>{' '}
              {mockComplaint.tags.map((t) => t.tag_name).join(', ')}
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div>
              <span className="font-medium">Attachments:</span> {mockComplaint.attachments.length}
            </div>
            <div>
              <span className="font-medium">Comments:</span> {mockComplaint.comments.length}
            </div>
            <div>
              <span className="font-medium">Feedback entries:</span> {mockComplaint.feedback.length}
            </div>
            <div>
              <span className="font-medium">History entries:</span> {mockComplaint.history.length}
            </div>
            <div>
              <span className="font-medium">Rating:</span> {mockComplaint.rating[0]?.rating}/5 ⭐
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Export to PDF</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Click the button below to generate a PDF report of the sample complaint. The PDF will
            include all details, attachments metadata, comments, feedback, timeline, and rating.
          </p>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-5 w-5" />
            {isExporting ? 'Generating PDF...' : 'Export Sample Complaint to PDF'}
          </Button>

          {exportStatus && (
            <div
              className={`mt-4 rounded-lg p-4 ${
                exportStatus.startsWith('✅')
                  ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                  : exportStatus.startsWith('❌')
                    ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                    : 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
              }`}
            >
              <p className="text-sm">{exportStatus}</p>
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">PDF Export Features</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              <span>Professional formatting with headers, sections, and tables</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              <span>Complete complaint details including title, description, and metadata</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              <span>Status and priority badges with color coding</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              <span>Tags, attachments list with file sizes</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              <span>Feedback from lecturers with timestamps</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              <span>Comments and discussion thread</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              <span>Complete timeline/history of all actions</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              <span>Satisfaction rating with feedback</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              <span>Page numbers and generation timestamp</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-primary" />
              <span>Automatic page breaks for long content</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
