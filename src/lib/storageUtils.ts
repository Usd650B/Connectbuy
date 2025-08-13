import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { getAuth } from 'firebase/auth';

const storage = getStorage();

type UploadOptions = {
  path?: string;
  metadata?: Record<string, string>;
  onProgress?: (progress: number) => void;
};

export const uploadFile = async (
  file: File, 
  options: UploadOptions = {}
): Promise<string> => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be authenticated to upload files');
  }

  // Generate a unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = options.path ? 
    `${options.path}/${user.uid}/${fileName}` : 
    `uploads/${user.uid}/${fileName}`;
  
  const storageRef = ref(storage, filePath);
  
  try {
    // Create file metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedBy: user.uid,
        ...options.metadata,
      },
    };

    // Start the upload
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    // Return a promise that resolves with the download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          options.onProgress?.(progress);
        },
        (error) => {
          console.error('Upload failed:', error);
          reject(new Error('Upload failed. Please try again.'));
        },
        async () => {
          try {
            // Get the download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            console.error('Error getting download URL:', error);
            reject(new Error('Failed to get download URL.'));
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file. Please try again.');
  }
};

export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    // Create a reference to the file to delete using the full URL
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file. Please try again.');
  }
};

export const getFileRefFromUrl = (url: string) => {
  return ref(storage, url);
};
