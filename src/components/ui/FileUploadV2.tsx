'use client';

import * as React from 'react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';
import { useStorage } from '@/hooks/useStorage';
import { Button } from './button';
import { Icons } from './icons';
import { Progress } from './progress';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onSuccess: (url: string) => void;
  onError?: (error: Error) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export function FileUploadV2({
  onSuccess,
  onError,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  className = '',
  disabled = false,
  label = 'Drag & drop a file here, or click to select',
  description = 'PNG, JPG, GIF up to 5MB',
}: FileUploadProps) {
  const [fileError, setFileError] = React.useState<string | null>(null);
  const { upload, isUploading, progress } = useStorage({
    onSuccess,
    onError,
  });

  const onDrop = React.useCallback<NonNullable<DropzoneOptions['onDrop']>>(
    async (acceptedFiles) => {
      if (disabled || isUploading) return;
      
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file size
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        setFileError(`File is too large. Max size is ${maxSizeMB}MB`);
        return;
      }

      setFileError(null);
      try {
        await upload(file);
      } catch (error) {
        console.error('Upload failed:', error);
        setFileError('Failed to upload file. Please try again.');
      }
    },
    [upload, isUploading, maxSize, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: disabled || isUploading,
    maxSize,
  });

  return (
    <div className={cn('space-y-2', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25',
          (disabled || isUploading) && 'opacity-50 cursor-not-allowed',
          fileError && 'border-destructive/50',
          className
        )}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="space-y-2">
            <Icons.upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Uploading...</p>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Icons.upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              {isDragActive ? 'Drop the file here' : label}
            </p>
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={disabled}
              onClick={(e) => e.stopPropagation()}
            >
              Select File
            </Button>
          </div>
        )}
      </div>
      
      {fileError && (
        <p className="text-sm text-destructive flex items-center justify-center gap-1">
          <Icons.alertCircle className="h-4 w-4" />
          {fileError}
        </p>
      )}
    </div>
  );
}
