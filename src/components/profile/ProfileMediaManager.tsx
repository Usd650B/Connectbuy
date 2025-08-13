'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { FileUpload } from '@/components/ui/FileUpload';
import { useToast } from '@/components/ui/use-toast';
import { deleteFile, uploadFile } from '@/lib/storageUtils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function ProfileMediaManager() {
  const { user, userData, reloadUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [activeUpload, setActiveUpload] = useState<'avatar' | 'cover' | null>(null);
  const { toast } = useToast();

  const handleUpload = async (file: File, type: 'avatar' | 'cover') => {
    if (!user) return;
    
    setIsUploading(true);
    setActiveUpload(type);
    
    try {
      // Determine the path based on upload type
      const path = type === 'avatar' ? 'profilePictures' : 'coverPhotos';
      
      // Upload the new file
      const downloadURL = await uploadFile(file, {
        path: `${path}/${user.uid}`,
        metadata: {
          uploadType: type,
          userId: user.uid,
        },
      });
      
      // Update user document with the new URL
      await updateDoc(doc(db, 'users', user.uid), {
        [type === 'avatar' ? 'photoURL' : 'coverPhotoURL']: downloadURL,
      });
      
      // Reload user data to reflect changes
      await reloadUser();
      
      toast({
        title: 'Success',
        description: `${type === 'avatar' ? 'Profile picture' : 'Cover photo'} updated successfully`,
      });
      
      // If this is an avatar update and there was a previous avatar, delete it
      if (type === 'avatar' && userData?.photoURL) {
        try {
          await deleteFile(userData.photoURL);
        } catch (error) {
          console.error('Error deleting old avatar:', error);
          // Don't fail the operation if deletion fails
        }
      }
      
      // If this is a cover photo update and there was a previous cover photo, delete it
      if (type === 'cover' && userData?.coverPhotoURL) {
        try {
          await deleteFile(userData.coverPhotoURL);
        } catch (error) {
          console.error('Error deleting old cover photo:', error);
          // Don't fail the operation if deletion fails
        }
      }
      
      return downloadURL;
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast({
        title: 'Error',
        description: `Failed to update ${type === 'avatar' ? 'profile picture' : 'cover photo'}`,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsUploading(false);
      setActiveUpload(null);
    }
  };

  const handleRemove = async (type: 'avatar' | 'cover') => {
    if (!user) return;
    
    setIsUploading(true);
    setActiveUpload(type);
    
    try {
      const field = type === 'avatar' ? 'photoURL' : 'coverPhotoURL';
      const currentUrl = userData?.[field];
      
      if (!currentUrl) return;
      
      // Remove the URL from user document
      await updateDoc(doc(db, 'users', user.uid), {
        [field]: null,
      });
      
      // Reload user data to reflect changes
      await reloadUser();
      
      // Delete the file from storage
      try {
        await deleteFile(currentUrl);
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        // Don't fail the operation if deletion fails
      }
      
      toast({
        title: 'Success',
        description: `${type === 'avatar' ? 'Profile picture' : 'Cover photo'} removed`,
      });
    } catch (error) {
      console.error(`Error removing ${type}:`, error);
      toast({
        title: 'Error',
        description: `Failed to remove ${type === 'avatar' ? 'profile picture' : 'cover photo'}`,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsUploading(false);
      setActiveUpload(null);
    }
  };

  if (!user) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">Please sign in to manage your profile media</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cover Photo */}
      <div className="relative rounded-lg overflow-hidden bg-muted/50">
        {userData?.coverPhotoURL ? (
          <div className="group relative">
            <img
              src={userData.coverPhotoURL}
              alt="Cover"
              className="w-full h-48 md:h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
              <FileUpload
                onSuccess={(url) => handleUpload(new File([], ''), 'cover')}
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
                }}
                maxSize={5 * 1024 * 1024} // 5MB
                disabled={isUploading}
                className="absolute inset-0"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-background/80 backdrop-blur-sm"
                  disabled={isUploading && activeUpload === 'cover'}
                >
                  {isUploading && activeUpload === 'cover' ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.image className="mr-2 h-4 w-4" />
                  )}
                  Change Cover
                </Button>
              </FileUpload>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive"
                onClick={() => handleRemove('cover')}
                disabled={isUploading && activeUpload === 'cover'}
              >
                <Icons.trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <FileUpload
            onSuccess={(url) => handleUpload(new File([], ''), 'cover')}
            accept={{
              'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
            }}
            maxSize={5 * 1024 * 1024} // 5MB
            disabled={isUploading}
            className="h-48 md:h-64"
            label="Upload cover photo"
            description="JPG, PNG, or WebP up to 5MB"
          />
        )}
        
        {/* Profile Picture */}
        <div className="absolute -bottom-16 left-4 md:left-8">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-background">
              {userData?.photoURL ? (
                <AvatarImage 
                  src={userData.photoURL} 
                  alt={userData.displayName || 'User'}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="text-3xl">
                  {userData?.displayName
                    ? userData.displayName
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                    : 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <FileUpload
                onSuccess={(url) => handleUpload(new File([], ''), 'avatar')}
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
                }}
                maxSize={2 * 1024 * 1024} // 2MB
                disabled={isUploading}
                className="absolute inset-0 rounded-full"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-background/50 backdrop-blur-sm"
                  disabled={isUploading && activeUpload === 'avatar'}
                >
                  {isUploading && activeUpload === 'avatar' ? (
                    <Icons.spinner className="h-6 w-6 animate-spin" />
                  ) : (
                    <Icons.camera className="h-6 w-6" />
                  )}
                  <span className="sr-only">Change profile picture</span>
                </Button>
              </FileUpload>
              
              {userData?.photoURL && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => handleRemove('avatar')}
                  disabled={isUploading && activeUpload === 'avatar'}
                >
                  <Icons.trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove profile picture</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Spacer to account for the absolute positioned avatar */}
      <div className="h-16"></div>
    </div>
  );
}
