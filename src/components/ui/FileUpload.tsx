import { useCallback, useState, ReactNode } from 'react';
import { useDropzone } from 'react-dropzone';
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
  children?: ReactNode;
}

export function FileUpload({
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
  children,
}: FileUploadProps) {
  const [fileError, setFileError] = useState<string | null>(null);
  const { upload, isUploading, progress, error } = useStorage({
    onSuccess,
    onError,
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled || isUploading) return;
      
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file size
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        setFileError(`File is too large. Max size is ${maxSizeMB}MB`);
        return;
      }

      // Validate file type
      const fileType = file.type.split('/')[0];
      if (!Object.keys(accept).some(type => type.startsWith(`${fileType}/`) || type === '*/*')) {
        setFileError('Invalid file type');
        return;
      }

      setFileError(null);
      await upload(file);
    },
    [upload, isUploading, maxSize, accept, disabled]
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
        {children || (
          isUploading ? (
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
          )
        )}
      </div>
      
      {fileError && (
        <p className="text-sm text-destructive">
          <Icons.alertCircle className="inline h-4 w-4 mr-1" />
          {fileError}
        </p>
      )}
      
      {error && !fileError && (
        <p className="text-sm text-destructive">
          <Icons.alertCircle className="inline h-4 w-4 mr-1" />
          {error.message}
        </p>
      )}
    </div>
  );
}
