'use client';

import { useId, useState, useRef, DragEvent } from 'react';
import { Upload, X, File } from 'lucide-react';
import { Button } from '@/shared/ui';
import { cn } from '@/shared/utils/cn';

export interface FileUploadProps {
  label?: string;
  description?: string;
  error?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  value?: File[];
  onChange?: (files: File[]) => void;
  onError?: (error: string) => void;
  className?: string;
  required?: boolean;
}

export function FileUpload({
  label,
  description,
  error,
  accept,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  value = [],
  onChange,
  onError,
  className,
  required,
}: FileUploadProps) {
  const generatedId = useId();
  const inputId = `file-upload-${generatedId}`;
  const errorId = `${inputId}-error`;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File "${file.name}" exceeds maximum size of ${(maxSize / 1024 / 1024).toFixed(2)}MB`;
    }
    return null;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const errors: string[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) errors.push(error);
    });

    if (errors.length > 0) {
      onError?.(errors.join(', '));
      return;
    }

    const newFiles = multiple ? [...value, ...fileArray] : fileArray;
    onChange?.(newFiles);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange?.(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-text">
          {label}
          {required && (
            <span className="ml-1 text-status-error" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      {description && (
        <p id={descriptionId} className="mb-1 text-sm text-text-muted">
          {description}
        </p>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors',
          isDragging
            ? 'border-primary bg-primary-light'
            : 'border-border bg-surface-hover',
          error && 'border-status-error'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          id={inputId}
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="sr-only"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : descriptionId}
          aria-required={required}
        />

        <div className="flex flex-col items-center justify-center p-6 text-center">
          <Upload className="mb-2 h-8 w-8 text-text-muted" />
          <p className="mb-1 text-sm font-medium text-text">
            Drag and drop files here, or{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-primary hover:underline"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-text-muted">
            {accept && `Accepted: ${accept}`}
            {maxSize && ` • Max size: ${(maxSize / 1024 / 1024).toFixed(2)}MB`}
          </p>
        </div>
      </div>

      {value.length > 0 && (
        <div className="mt-4 space-y-2">
          {value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2"
            >
              <div className="flex items-center space-x-2">
                <File className="h-4 w-4 text-text-muted" />
                <div>
                  <p className="text-sm font-medium text-text">{file.name}</p>
                  <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p id={errorId} className="mt-1 text-sm text-status-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

