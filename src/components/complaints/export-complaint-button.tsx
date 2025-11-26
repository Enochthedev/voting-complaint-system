'use client';

import { useState } from 'react';
import { Download, FileText, Paperclip, Package, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
import { ExportProgressDialog } from './export-progress-dialog';
import { exportComplaintToPDF } from '@/lib/export/pdf-export';
import { exportComplaintAttachments, exportSingleComplaintWithAttachments } from '@/lib/export';
import type { Complaint } from '@/types/database.types';

export interface ExportComplaintButtonProps {
  complaint: any; // Full complaint with all related data
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showDropdown?: boolean; // Whether to show dropdown with multiple export options
}

/**
 * Export Complaint Button Component
 * Validates: Requirements AC20 (Export Functionality)
 *
 * Supports multiple export formats:
 * - PDF only
 * - Attachments only (ZIP)
 * - Complete package (PDF + Attachments in ZIP)
 */
export function ExportComplaintButton({
  complaint,
  variant = 'outline',
  size = 'default',
  className = '',
  showDropdown = true,
}: ExportComplaintButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState('');
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>(
    'idle'
  );
  const [error, setError] = useState<string | null>(null);
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  const hasAttachments = complaint.attachments && complaint.attachments.length > 0;

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      setExportStatus('exporting');
      setError(null);
      setShowProgressDialog(true);
      setExportProgress(0);
      setExportMessage('Preparing PDF export...');

      // Simulate progress for PDF generation
      setExportProgress(30);
      setExportMessage('Generating PDF document...');

      await exportComplaintToPDF(complaint);

      setExportProgress(100);
      setExportMessage('PDF exported successfully!');
      setExportStatus('success');

      // Auto-close after 2 seconds on success
      setTimeout(() => {
        setShowProgressDialog(false);
        setExportStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError('Failed to export PDF. Please try again.');
      setExportStatus('error');
      setExportMessage('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAttachments = async () => {
    if (!hasAttachments) {
      setError('No attachments to export');
      return;
    }

    try {
      setIsExporting(true);
      setExportStatus('exporting');
      setError(null);
      setShowProgressDialog(true);
      setExportProgress(0);
      setExportMessage('Preparing to download attachments...');

      await exportComplaintAttachments(complaint.id, complaint.attachments, (current, total) => {
        const progress = Math.round((current / total) * 100);
        setExportProgress(progress);
        setExportMessage(`Downloading ${current}/${total} attachments...`);
      });

      setExportProgress(100);
      setExportMessage('Attachments exported successfully!');
      setExportStatus('success');

      // Auto-close after 2 seconds on success
      setTimeout(() => {
        setShowProgressDialog(false);
        setExportStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Error exporting attachments:', err);
      setError('Failed to export attachments. Please try again.');
      setExportStatus('error');
      setExportMessage('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportComplete = async () => {
    try {
      setIsExporting(true);
      setExportStatus('exporting');
      setError(null);
      setShowProgressDialog(true);
      setExportProgress(0);
      setExportMessage('Preparing complete export package...');

      await exportSingleComplaintWithAttachments(complaint, {
        includeAttachments: hasAttachments,
        includePDFs: true,
        includeCSV: false,
        onProgress: (current, total, message) => {
          const progress = total > 0 ? Math.round((current / total) * 100) : 0;
          setExportProgress(progress);
          setExportMessage(message);
        },
      });

      setExportProgress(100);
      setExportMessage('Complete package exported successfully!');
      setExportStatus('success');

      // Auto-close after 2 seconds on success
      setTimeout(() => {
        setShowProgressDialog(false);
        setExportStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Error exporting complete package:', err);
      setError('Failed to export complete package. Please try again.');
      setExportStatus('error');
      setExportMessage('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // Simple button without dropdown
  if (!showDropdown) {
    return (
      <>
        <Button
          onClick={handleExportPDF}
          disabled={isExporting}
          variant={variant}
          size={size}
          className={className}
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </Button>

        <ExportProgressDialog
          open={showProgressDialog}
          onOpenChange={setShowProgressDialog}
          progress={exportProgress}
          message={exportMessage}
          status={exportStatus}
          error={error || undefined}
          title="Export PDF"
          onClose={() => {
            setShowProgressDialog(false);
            setExportStatus('idle');
          }}
        />
      </>
    );
  }

  // Dropdown menu with multiple export options
  return (
    <>
      <DropdownMenu align="end">
        <DropdownMenuTrigger asChild>
          <Button disabled={isExporting} variant={variant} size={size} className={className}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={!isExporting ? handleExportPDF : undefined}
            className={isExporting ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Export as PDF</span>
          </DropdownMenuItem>

          {hasAttachments && (
            <>
              <DropdownMenuItem
                onClick={!isExporting ? handleExportAttachments : undefined}
                className={isExporting ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <Paperclip className="mr-2 h-4 w-4" />
                <span>Export Attachments ({complaint.attachments.length})</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={!isExporting ? handleExportComplete : undefined}
                className={isExporting ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <Package className="mr-2 h-4 w-4" />
                <span>Export Complete Package</span>
              </DropdownMenuItem>
            </>
          )}

          {!hasAttachments && (
            <DropdownMenuItem className="text-muted-foreground opacity-50 cursor-not-allowed">
              <Paperclip className="mr-2 h-4 w-4" />
              <span>No attachments</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportProgressDialog
        open={showProgressDialog}
        onOpenChange={setShowProgressDialog}
        progress={exportProgress}
        message={exportMessage}
        status={exportStatus}
        error={error || undefined}
        title="Export Complaint"
        onClose={() => {
          setShowProgressDialog(false);
          setExportStatus('idle');
        }}
      />
    </>
  );
}
