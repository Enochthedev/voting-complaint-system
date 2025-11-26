/**
 * CSV Export Utility for Complaints
 * Validates: Requirements AC20 (Export Functionality)
 * Property P20: Export Data Integrity
 */

import type { Complaint, ComplaintTag, User } from '@/types/database.types';

interface ComplaintWithDetails extends Complaint {
  student?: { id: string; full_name: string; email: string } | null;
  assigned_user?: { id: string; full_name: string; email: string } | null;
  tags?: ComplaintTag[];
}

/**
 * Format date to readable string for CSV
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Capitalize first letter of each word
 */
function capitalize(str: string): string {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Escape CSV field value
 * Handles quotes, commas, and newlines
 */
function escapeCSVField(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If the value contains quotes, commas, or newlines, wrap it in quotes
  // and escape any existing quotes by doubling them
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Export complaints list to CSV
 * Validates: Requirements AC20, Property P20
 */
export function exportComplaintsToCSV(complaints: ComplaintWithDetails[], filename?: string): void {
  if (complaints.length === 0) {
    console.warn('No complaints to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'ID',
    'Title',
    'Status',
    'Priority',
    'Category',
    'Submitted By',
    'Assigned To',
    'Tags',
    'Created Date',
    'Updated Date',
    'Opened Date',
    'Resolved Date',
    'Escalation Level',
    'Is Anonymous',
    'Is Draft',
    'Description',
  ];

  // Build CSV rows
  const rows = complaints.map((complaint) => {
    const tags = complaint.tags?.map((t) => t.tag_name).join('; ') || '';
    const submittedBy = complaint.is_anonymous
      ? 'Anonymous'
      : complaint.student?.full_name || 'N/A';
    const assignedTo = complaint.assigned_user?.full_name || 'Unassigned';
    const description = stripHtml(complaint.description);

    return [
      escapeCSVField(complaint.id),
      escapeCSVField(complaint.title),
      escapeCSVField(capitalize(complaint.status)),
      escapeCSVField(capitalize(complaint.priority)),
      escapeCSVField(capitalize(complaint.category)),
      escapeCSVField(submittedBy),
      escapeCSVField(assignedTo),
      escapeCSVField(tags),
      escapeCSVField(formatDate(complaint.created_at)),
      escapeCSVField(formatDate(complaint.updated_at)),
      escapeCSVField(formatDate(complaint.opened_at)),
      escapeCSVField(formatDate(complaint.resolved_at)),
      escapeCSVField(complaint.escalation_level),
      escapeCSVField(complaint.is_anonymous ? 'Yes' : 'No'),
      escapeCSVField(complaint.is_draft ? 'Yes' : 'No'),
      escapeCSVField(description),
    ];
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename || `complaints_export_${new Date().getTime()}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Export complaints with custom fields
 * Allows selecting which fields to include in the export
 */
export function exportComplaintsToCSVCustom(
  complaints: ComplaintWithDetails[],
  fields: {
    id?: boolean;
    title?: boolean;
    status?: boolean;
    priority?: boolean;
    category?: boolean;
    submittedBy?: boolean;
    assignedTo?: boolean;
    tags?: boolean;
    createdDate?: boolean;
    updatedDate?: boolean;
    openedDate?: boolean;
    resolvedDate?: boolean;
    escalationLevel?: boolean;
    isAnonymous?: boolean;
    isDraft?: boolean;
    description?: boolean;
  },
  filename?: string
): void {
  if (complaints.length === 0) {
    console.warn('No complaints to export');
    return;
  }

  // Build headers based on selected fields
  const headers: string[] = [];
  const fieldKeys: string[] = [];

  if (fields.id !== false) {
    headers.push('ID');
    fieldKeys.push('id');
  }
  if (fields.title !== false) {
    headers.push('Title');
    fieldKeys.push('title');
  }
  if (fields.status !== false) {
    headers.push('Status');
    fieldKeys.push('status');
  }
  if (fields.priority !== false) {
    headers.push('Priority');
    fieldKeys.push('priority');
  }
  if (fields.category !== false) {
    headers.push('Category');
    fieldKeys.push('category');
  }
  if (fields.submittedBy !== false) {
    headers.push('Submitted By');
    fieldKeys.push('submittedBy');
  }
  if (fields.assignedTo !== false) {
    headers.push('Assigned To');
    fieldKeys.push('assignedTo');
  }
  if (fields.tags !== false) {
    headers.push('Tags');
    fieldKeys.push('tags');
  }
  if (fields.createdDate !== false) {
    headers.push('Created Date');
    fieldKeys.push('createdDate');
  }
  if (fields.updatedDate !== false) {
    headers.push('Updated Date');
    fieldKeys.push('updatedDate');
  }
  if (fields.openedDate !== false) {
    headers.push('Opened Date');
    fieldKeys.push('openedDate');
  }
  if (fields.resolvedDate !== false) {
    headers.push('Resolved Date');
    fieldKeys.push('resolvedDate');
  }
  if (fields.escalationLevel !== false) {
    headers.push('Escalation Level');
    fieldKeys.push('escalationLevel');
  }
  if (fields.isAnonymous !== false) {
    headers.push('Is Anonymous');
    fieldKeys.push('isAnonymous');
  }
  if (fields.isDraft !== false) {
    headers.push('Is Draft');
    fieldKeys.push('isDraft');
  }
  if (fields.description !== false) {
    headers.push('Description');
    fieldKeys.push('description');
  }

  // Build CSV rows
  const rows = complaints.map((complaint) => {
    const rowData: Record<string, string> = {
      id: complaint.id,
      title: complaint.title,
      status: capitalize(complaint.status),
      priority: capitalize(complaint.priority),
      category: capitalize(complaint.category),
      submittedBy: complaint.is_anonymous ? 'Anonymous' : complaint.student?.full_name || 'N/A',
      assignedTo: complaint.assigned_user?.full_name || 'Unassigned',
      tags: complaint.tags?.map((t) => t.tag_name).join('; ') || '',
      createdDate: formatDate(complaint.created_at),
      updatedDate: formatDate(complaint.updated_at),
      openedDate: formatDate(complaint.opened_at),
      resolvedDate: formatDate(complaint.resolved_at),
      escalationLevel: complaint.escalation_level.toString(),
      isAnonymous: complaint.is_anonymous ? 'Yes' : 'No',
      isDraft: complaint.is_draft ? 'Yes' : 'No',
      description: stripHtml(complaint.description),
    };

    return fieldKeys.map((key) => escapeCSVField(rowData[key]));
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename || `complaints_export_${new Date().getTime()}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}
