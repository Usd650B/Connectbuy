import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const storage = getStorage();

export const uploadFile = async (file: File, path: string = 'images'): Promise<string> => {
  // Create a reference to the storage location
  const storageRef = ref(storage, `${path}/${uuidv4()}_${file.name}`);
  
  try {
    // Upload the file
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Wait for the upload to complete
    await uploadTask;
    
    // Get the download URL
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file. Please try again.');
  }
};

export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    // Create a reference to the file to delete
    const fileRef = ref(storage, fileUrl);
    
    // Delete the file
    // Note: You'll need to import { deleteObject } from 'firebase/storage' at the top
    // and uncomment the following line when you're ready to implement deletion
    // await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file. Please try again.');
  }
};
