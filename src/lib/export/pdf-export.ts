/**
 * PDF Export Utility for Complaints
 * Validates: Requirements AC20 (Export Functionality)
 * Property P20: Export Data Integrity
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  Complaint,
  ComplaintTag,
  ComplaintAttachment,
  ComplaintHistory,
  ComplaintComment,
  ComplaintRating,
  Feedback,
} from '@/types/database.types';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

interface ComplaintWithDetails extends Complaint {
  student?: { id: string; full_name: string; email: string } | null;
  assigned_user?: { id: string; full_name: string; email: string } | null;
  tags?: ComplaintTag[];
  attachments?: ComplaintAttachment[];
  history?: Array<
    ComplaintHistory & {
      performed_by_user?: { id: string; full_name: string; email: string };
    }
  >;
  comments?: Array<
    ComplaintComment & {
      user?: { id: string; full_name: string; email: string; role: string };
    }
  >;
  feedback?: Array<
    Feedback & {
      lecturer?: { id: string; full_name: string; email: string };
    }
  >;
  rating?: ComplaintRating[];
}

/**
 * Format date to readable string
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format file size to human-readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
 * Get status color for badges
 */
function getStatusColor(status: string): [number, number, number] {
  const colors: Record<string, [number, number, number]> = {
    draft: [156, 163, 175], // gray
    new: [59, 130, 246], // blue
    opened: [147, 51, 234], // purple
    in_progress: [234, 179, 8], // yellow
    resolved: [34, 197, 94], // green
    closed: [107, 114, 128], // gray
    reopened: [239, 68, 68], // red
  };
  return colors[status] || [107, 114, 128];
}

/**
 * Get priority color
 */
function getPriorityColor(priority: string): [number, number, number] {
  const colors: Record<string, [number, number, number]> = {
    low: [34, 197, 94], // green
    medium: [234, 179, 8], // yellow
    high: [249, 115, 22], // orange
    critical: [239, 68, 68], // red
  };
  return colors[priority] || [107, 114, 128];
}

/**
 * Export a single complaint to PDF
 * Validates: Requirements AC20, Property P20
 */
export async function exportComplaintToPDF(complaint: ComplaintWithDetails): Promise<void> {
  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Add header with logo/title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Complaint Report', margin, yPosition);
  yPosition += 10;

  // Add horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Complaint ID and Status
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Complaint ID: ${complaint.id}`, margin, yPosition);

  // Status badge
  const statusColor = getStatusColor(complaint.status);
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth - margin - 50, yPosition - 5, 50, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(capitalize(complaint.status), pageWidth - margin - 25, yPosition, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  yPosition += 15;

  // Title
  checkPageBreak(20);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(complaint.title, pageWidth - 2 * margin);
  doc.text(titleLines, margin, yPosition);
  yPosition += titleLines.length * 7 + 10;

  // Basic Information Section
  checkPageBreak(60);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Basic Information', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const basicInfo = [
    ['Category', capitalize(complaint.category)],
    ['Priority', capitalize(complaint.priority)],
    ['Submitted By', complaint.is_anonymous ? 'Anonymous' : complaint.student?.full_name || 'N/A'],
    ['Submitted On', formatDate(complaint.created_at)],
    ['Last Updated', formatDate(complaint.updated_at)],
    ['Assigned To', complaint.assigned_user?.full_name || 'Unassigned'],
  ];

  if (complaint.opened_at) {
    basicInfo.push(['Opened On', formatDate(complaint.opened_at)]);
  }
  if (complaint.resolved_at) {
    basicInfo.push(['Resolved On', formatDate(complaint.resolved_at)]);
  }
  if (complaint.escalated_at) {
    basicInfo.push(['Escalated On', formatDate(complaint.escalated_at)]);
    basicInfo.push(['Escalation Level', complaint.escalation_level.toString()]);
  }

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: basicInfo,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Tags Section
  if (complaint.tags && complaint.tags.length > 0) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Tags', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const tagsText = complaint.tags.map((t) => t.tag_name).join(', ');
    const tagLines = doc.splitTextToSize(tagsText, pageWidth - 2 * margin);
    doc.text(tagLines, margin, yPosition);
    yPosition += tagLines.length * 5 + 10;
  }

  // Description Section
  checkPageBreak(30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  // Strip HTML tags from description
  const plainDescription = complaint.description.replace(/<[^>]*>/g, '');
  const descLines = doc.splitTextToSize(plainDescription, pageWidth - 2 * margin);

  for (const line of descLines) {
    checkPageBreak(7);
    doc.text(line, margin, yPosition);
    yPosition += 5;
  }
  yPosition += 10;

  // Attachments Section
  if (complaint.attachments && complaint.attachments.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Attachments', margin, yPosition);
    yPosition += 8;

    const attachmentData = complaint.attachments.map((att) => [
      att.file_name,
      att.file_type,
      formatFileSize(att.file_size),
      formatDate(att.created_at),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['File Name', 'Type', 'Size', 'Uploaded']],
      body: attachmentData,
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 5;

    // Add note about attachments
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(
      'Note: Attachments can be downloaded separately using the attachment export feature.',
      margin,
      yPosition
    );
    doc.setTextColor(0, 0, 0);
    yPosition += 10;
  }

  // Feedback Section
  if (complaint.feedback && complaint.feedback.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Feedback', margin, yPosition);
    yPosition += 8;

    for (const fb of complaint.feedback) {
      checkPageBreak(25);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text(
        `${fb.lecturer?.full_name || 'Lecturer'} - ${formatDate(fb.created_at)}`,
        margin,
        yPosition
      );
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const feedbackLines = doc.splitTextToSize(fb.content, pageWidth - 2 * margin);
      for (const line of feedbackLines) {
        checkPageBreak(5);
        doc.text(line, margin, yPosition);
        yPosition += 5;
      }
      yPosition += 8;
    }
  }

  // Comments Section
  if (complaint.comments && complaint.comments.length > 0) {
    // Filter out internal notes for non-lecturers
    const visibleComments = complaint.comments.filter((c) => !c.is_internal);

    if (visibleComments.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Comments', margin, yPosition);
      yPosition += 8;

      for (const comment of visibleComments) {
        checkPageBreak(25);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 100, 100);
        doc.text(
          `${comment.user?.full_name || 'User'} - ${formatDate(comment.created_at)}`,
          margin,
          yPosition
        );
        yPosition += 6;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const commentLines = doc.splitTextToSize(comment.comment, pageWidth - 2 * margin);
        for (const line of commentLines) {
          checkPageBreak(5);
          doc.text(line, margin, yPosition);
          yPosition += 5;
        }
        yPosition += 8;
      }
    }
  }

  // Rating Section
  if (complaint.rating && complaint.rating.length > 0) {
    const rating = complaint.rating[0];
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Satisfaction Rating', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Rating: ${'★'.repeat(rating.rating)}${'☆'.repeat(5 - rating.rating)} (${rating.rating}/5)`,
      margin,
      yPosition
    );
    yPosition += 7;

    if (rating.feedback_text) {
      doc.text('Feedback:', margin, yPosition);
      yPosition += 6;
      const ratingLines = doc.splitTextToSize(rating.feedback_text, pageWidth - 2 * margin);
      for (const line of ratingLines) {
        checkPageBreak(5);
        doc.text(line, margin, yPosition);
        yPosition += 5;
      }
      yPosition += 8;
    }
  }

  // History/Timeline Section
  if (complaint.history && complaint.history.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Timeline', margin, yPosition);
    yPosition += 8;

    const historyData = complaint.history
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((h) => [
        formatDate(h.created_at),
        capitalize(h.action),
        h.performed_by_user?.full_name || 'System',
        h.old_value && h.new_value
          ? `${capitalize(h.old_value)} → ${capitalize(h.new_value)}`
          : h.new_value
            ? capitalize(h.new_value)
            : '-',
      ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Action', 'Performed By', 'Details']],
      body: historyData,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      margin: { left: margin, right: margin },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 'auto' },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(
      `Generated on ${formatDate(new Date().toISOString())}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // Save the PDF
  const fileName = `complaint_${complaint.id}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
}
