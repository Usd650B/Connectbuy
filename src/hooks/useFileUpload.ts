import { useState, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { uploadFile } from '@/utils/fileUpload';
import { useToast } from '@/components/ui/use-toast';

interface UseFileUploadProps {
  maxSize?: number; // in bytes
  path?: string;
}

export function useFileUpload({ maxSize = 5 * 1024 * 1024, path = 'images' } = {} as UseFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const auth = getAuth();

  const upload = useCallback(
    async (file: File) => {
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('You must be logged in to upload files');
      }

      // Check file size
      if (file.size > maxSize) {
        throw new Error(`File size should be less than ${maxSize / (1024 * 1024)}MB`);
      }

      try {
        setIsUploading(true);
        setProgress(0);
        
        // Create a unique path for the file
        const filePath = `${path}/${user.uid}/${Date.now()}_${file.name}`;
        
        // Upload the file
        const downloadURL = await uploadFile(file, filePath);
        
        setProgress(100);
        return downloadURL;
      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [auth, maxSize, path]
  );

  return {
    upload,
    isUploading,
    progress,
  };
}
