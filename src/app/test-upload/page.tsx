'use client';

import { FileUploadV2 } from '@/components/ui/FileUploadV2';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/components/ui/use-toast';

export default function TestUploadPage() {
  const { toast } = useToast();
  const { upload, isUploading, progress } = useFileUpload({
    maxSize: 5 * 1024 * 1024, // 5MB
    path: 'test-uploads'
  });

  const handleUploadSuccess = (url: string) => {
    console.log('File uploaded successfully:', url);
    toast({
      title: 'Success',
      description: 'File uploaded successfully!',
    });
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to upload file',
      variant: 'destructive',
    });
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Test File Upload</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-2">Single File Upload</h2>
          <FileUploadV2
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            maxSize={5 * 1024 * 1024} // 5MB
            label="Drag & drop a file here, or click to select"
            description="Supports JPG, PNG, GIF up to 5MB"
          />
        </div>
        
        <div className="p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2">Upload Status</h3>
          <div className="space-y-2">
            <p>Uploading: {isUploading ? 'Yes' : 'No'}</p>
            {isUploading && (
              <div>
                <p>Progress: {Math.round(progress)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
