'use client';

import * as React from 'react';
import { X, Upload, File, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription } from './alert';
import {
  validateFiles,
  formatFileSize,
  getFileTypeDescription,
  getAllowedFileTypesString,
  getAllowedExtensionsString,
  type FileValidationError,
} from '@/lib/file-validation';
import { MAX_FILE_SIZE, MAX_FILES_PER_COMPLAINT } from '@/lib/constants';

export interface FileUploadProgress {
  file: File;
  progress: number; // 0-100
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface FileUploadProps {
  /**
   * Callback when files are selected and validated
   */
  onFilesSelected?: (files: File[]) => void;

  /**
   * Callback when a file is removed
   */
  onFileRemove?: (file: File) => void;

  /**
   * Currently selected files
   */
  files?: File[];

  /**
   * Upload progress for files being uploaded
   */
  uploadProgress?: FileUploadProgress[];

  /**
   * Maximum number of files (defaults to MAX_FILES_PER_COMPLAINT)
   */
  maxFiles?: number;

  /**
   * Whether the component is disabled
   */
  disabled?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export function FileUpload({
  onFilesSelected,
  onFileRemove,
  files = [],
  uploadProgress = [],
  maxFiles = MAX_FILES_PER_COMPLAINT,
  disabled = false,
  className = '',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<FileValidationError[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dragCounter = React.useRef(0);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;

    // Convert FileList to array
    const fileArray = Array.from(newFiles);

    // Validate files
    const validation = validateFiles(fileArray, files.length);

    // Set validation errors
    setValidationErrors(validation.invalid);

    // Call callback with valid files
    if (validation.valid.length > 0 && onFilesSelected) {
      onFilesSelected(validation.valid);
    }

    // Clear the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter.current++;

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounter.current--;

    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
    dragCounter.current = 0;

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemoveFile = (fileToRemove: File) => {
    if (onFileRemove) {
      onFileRemove(fileToRemove);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const dismissError = (index: number) => {
    setValidationErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const canAddMoreFiles = files.length < maxFiles;
  const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative rounded-lg border-2 border-dashed p-8 text-center transition-colors
          ${isDragging ? 'border-primary bg-accent' : 'border-input bg-background'}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-ring'}
        `}
        onClick={!disabled ? handleBrowseClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={getAllowedFileTypesString()}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
          aria-label="File upload input"
        />

        <div className="flex flex-col items-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {canAddMoreFiles ? (
                <>
                  <span className="text-muted-foreground">Drag and drop files here, or </span>
                  <span className="text-foreground underline">browse</span>
                </>
              ) : (
                <span className="text-muted-foreground">
                  Maximum file limit reached ({maxFiles} files)
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              Supported: {getAllowedExtensionsString()}
            </p>
            <p className="text-xs text-muted-foreground">
              Max {maxSizeMB}MB per file, {maxFiles} files total
            </p>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="space-y-2">
          {validationErrors.map((error, index) => (
            <Alert key={index} variant="destructive" className="relative pr-10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error.error}</AlertDescription>
              <button
                onClick={() => dismissError(index)}
                className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </Alert>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Uploading Files ({uploadProgress.filter((p) => p.status === 'completed').length}/
              {uploadProgress.length})
            </p>
          </div>
          <div className="space-y-2">
            {uploadProgress.map((progress, index) => (
              <FileUploadItem key={`${progress.file.name}-${index}`} progress={progress} />
            ))}
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Selected Files ({files.length}/{maxFiles})
            </p>
          </div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <FileItem
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => handleRemoveFile(file)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      {files.length === 0 && validationErrors.length === 0 && (
        <div className="rounded-lg bg-muted p-4">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="font-medium">File Upload Guidelines:</p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>Maximum {maxFiles} files per complaint</li>
                <li>Each file must be under {maxSizeMB}MB</li>
                <li>Supported formats: Images (JPEG, PNG, GIF), PDF, Word documents</li>
                <li>Files will be securely stored and accessible to authorized users</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface FileUploadItemProps {
  progress: FileUploadProgress;
}

function FileUploadItem({ progress }: FileUploadItemProps) {
  const { file, progress: percentage, status, error } = progress;
  const isImage = file.type.startsWith('image/');

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-3">
        {/* File Icon/Preview */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-muted">
          {isImage ? (
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="h-full w-full rounded object-cover"
              onLoad={(e) => {
                // Clean up object URL after image loads
                URL.revokeObjectURL((e.target as HTMLImageElement).src);
              }}
            />
          ) : (
            <File className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-card-foreground">{file.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatFileSize(file.size)}</span>
            <span>•</span>
            <span>{getFileTypeDescription(file.type)}</span>
          </div>
        </div>

        {/* Status Icon */}
        {status === 'completed' && (
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500" />
        )}
        {status === 'uploading' && (
          <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-muted-foreground" />
        )}
        {status === 'error' && <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />}
      </div>

      {/* Progress Bar */}
      {status === 'uploading' && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Uploading...</span>
            <span>{percentage}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {status === 'error' && error && (
        <div className="mt-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}

interface FileItemProps {
  file: File;
  onRemove: () => void;
  disabled?: boolean;
}

function FileItem({ file, onRemove, disabled }: FileItemProps) {
  const isImage = file.type.startsWith('image/');

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      {/* File Icon/Preview */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-muted">
        {isImage ? (
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="h-full w-full rounded object-cover"
            onLoad={(e) => {
              // Clean up object URL after image loads
              URL.revokeObjectURL((e.target as HTMLImageElement).src);
            }}
          />
        ) : (
          <File className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-card-foreground">{file.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatFileSize(file.size)}</span>
          <span>•</span>
          <span>{getFileTypeDescription(file.type)}</span>
        </div>
      </div>

      {/* Validation Status */}
      <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-500" />

      {/* Remove Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        disabled={disabled}
        className="h-8 w-8 flex-shrink-0 p-0"
        aria-label={`Remove ${file.name}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
