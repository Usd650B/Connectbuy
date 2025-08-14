'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { AvatarUpload } from './AvatarUpload';
import { FileUpload } from '@/components/ui/FileUpload';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/components/ui/use-toast';
import { deleteFile } from '@/lib/storageUtils';

export function ProfileStorage() {
  const { user, userData, reloadUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleAvatarUpload = async (url: string) => {
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      // Store the old avatar URL to delete it later if needed
      const oldAvatarUrl = userData?.photoURL;
      
      // Update the user's profile
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: url,
      });
      
      // Reload user data to reflect changes
      await reloadUser();
      
      // Delete the old avatar if it exists and is not the default avatar
      if (oldAvatarUrl && !oldAvatarUrl.includes('default-avatar')) {
        try {
          await deleteFile(oldAvatarUrl);
        } catch (error) {
          console.error('Error deleting old avatar:', error);
          // Don't fail the whole operation if deletion fails
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!user || !userData?.photoURL) return;
    
    try {
      setIsUpdating(true);
      
      // Store the old avatar URL to delete it
      const oldAvatarUrl = userData.photoURL;
      
      // Update the user's profile to remove the avatar
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: null,
      });
      
      // Reload user data to reflect changes
      await reloadUser();
      
      // Delete the old avatar if it's not the default avatar
      if (!oldAvatarUrl.includes('default-avatar')) {
        try {
          await deleteFile(oldAvatarUrl);
        } catch (error) {
          console.error('Error deleting old avatar:', error);
          // Don't fail the whole operation if deletion fails
        }
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCoverPhotoUpload = async (url: string) => {
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      // Store the old cover photo URL to delete it later if needed
      const oldCoverPhotoUrl = userData?.coverPhotoUrl;
      
      // Update the user's profile
      await updateDoc(doc(db, 'users', user.uid), {
        coverPhotoUrl: url,
      });
      
      // Reload user data to reflect changes
      await reloadUser();
      
      // Delete the old cover photo if it exists
      if (oldCoverPhotoUrl) {
        try {
          await deleteFile(oldCoverPhotoUrl);
        } catch (error) {
          console.error('Error deleting old cover photo:', error);
          // Don't fail the whole operation if deletion fails
        }
      }
    } catch (error) {
      console.error('Error updating cover photo:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">Please sign in to manage your profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Profile Picture</h3>
        <AvatarUpload
          currentAvatar={userData?.photoURL}
          onUpload={handleAvatarUpload}
          onRemove={userData?.photoURL ? handleAvatarRemove : undefined}
          disabled={isUpdating}
          name={userData?.displayName || 'User'}
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Cover Photo</h3>
        <div className="relative h-48 overflow-hidden rounded-lg bg-muted/50 border border-dashed">
          {userData?.coverPhotoUrl ? (
            <>
              <img
                src={userData.coverPhotoUrl}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <FileUpload
                  onSuccess={handleCoverPhotoUpload}
                  accept={{
                    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
                  }}
                  maxSize={5 * 1024 * 1024} // 5MB
                  className="absolute inset-0"
                  label="Change cover photo"
                />
              </div>
            </>
          ) : (
            <FileUpload
              onSuccess={handleCoverPhotoUpload}
              accept={{
                'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
              }}
              maxSize={5 * 1024 * 1024} // 5MB
              className="h-full"
              label="Upload cover photo"
              description="JPG, PNG, or WebP up to 5MB"
            />
          )}
        </div>
      </div>
    </div>
  );
}
