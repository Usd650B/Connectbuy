import { useState, useCallback } from 'react';
import { uploadFile, deleteFile, UploadOptions } from '@/lib/storageUtils';
import { useToast } from '@/components/ui/use-toast';

interface UseStorageOptions extends Omit<UploadOptions, 'onProgress'> {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export function useStorage(options: UseStorageOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const [error, setError] = useState<Error | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        const url = await uploadFile(file, {
          ...options,
          onProgress: (p) => setProgress(p),
        });

        options.onSuccess?.(url);
        return url;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Upload failed');
        setError(error);
        options.onError?.(error);
        
        toast({
          title: 'Upload failed',
          description: error.message,
          variant: 'destructive',
        });
        
        throw error;
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [options, toast]
  );

  const remove = useCallback(
    async (url: string) => {
      try {
        await deleteFile(url);
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Deletion failed');
        setError(error);
        options.onError?.(error);
        
        toast({
          title: 'Deletion failed',
          description: error.message,
          variant: 'destructive',
        });
        
        throw error;
      }
    },
    [options, toast]
  );

  return {
    upload,
    remove,
    isUploading,
    progress,
    error,
  };
}
