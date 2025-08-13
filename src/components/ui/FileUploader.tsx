'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';
import { Icons } from './icons';
import { uploadFile } from '@/utils/fileUpload';
import { useToast } from '@/components/ui/use-toast';

interface FileUploaderProps {
  onUploadSuccess: (url: string) => void;
  maxSize?: number; // in bytes (default: 5MB)
  accept?: Record<string, string[]>;
  className?: string;
  disabled?: boolean;
}

export function FileUploader({
  onUploadSuccess,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  },
  className = '',
  disabled = false,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;
      
      const file = acceptedFiles[0];
      if (!file) return;

      // Check file size
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: `File size should be less than ${maxSize / (1024 * 1024)}MB`,
          variant: 'destructive',
        });
        return;
      }

      try {
        setIsUploading(true);
        const downloadURL = await uploadFile(file);
        onUploadSuccess(downloadURL);
        toast({
          title: 'Success',
          description: 'File uploaded successfully',
        });
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'Failed to upload file',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadSuccess, maxSize, toast, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: isUploading || disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="flex flex-col items-center justify-center space-y-2">
          <Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Icons.upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-sm text-muted-foreground">
            {isDragActive ? (
              <p>Drop the file here</p>
            ) : (
              <>
                <p className="font-medium">
                  Drag & drop a file here, or click to select
                </p>
                <p className="text-xs">
                  {Object.values(accept)
                    .flat()
                    .map((ext) => ext.toUpperCase())
                    .join(', ')}{' '}
                  (max {maxSize / (1024 * 1024)}MB)
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
