import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { getAuth } from "firebase/auth";

/**
 * Uploads a file to Firebase Storage
 * @param file The file to upload
 * @param path Optional custom path (default: 'images')
 * @returns Promise with the download URL
 */
export const uploadFile = async (file: File, path = 'images'): Promise<string> => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User must be authenticated to upload files');
  }

  // Create a unique filename
  const fileExt = file.name.split('.').pop();
  const filename = `${Date.now()}.${fileExt}`;
  const storagePath = `${path}/${user.uid}/${filename}`;
  const storageRef = ref(storage, storagePath);

  try {
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file. Please try again.');
  }
};

/**
 * Deletes a file from Firebase Storage
 * @param url The URL of the file to delete
 */
export const deleteFile = async (url: string): Promise<void> => {
  try {
    // Create a reference to the file
    const storageRef = ref(storage, url);
    
    // Delete the file
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file. Please try again.');
  }
};

/**
 * Gets a reference to a file in storage
 * @param path The path to the file
 * @returns Storage reference
 */
export const getFileRef = (path: string) => {
  return ref(storage, path);
};
