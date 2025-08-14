'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types";
import { Edit, Globe, MapPin, Twitter, Instagram, MessageSquare, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileUploadV2 } from "../ui/FileUploadV2";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useState, useCallback } from "react";

interface ProfileHeaderProps {
  profileUser: UserProfile;
  isOwnProfile: boolean;
  onUpdate?: () => void;
}

export function ProfileHeader({ profileUser, isOwnProfile, onUpdate }: ProfileHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  
  // Initialize file upload hooks for cover and avatar
  const { upload: uploadCoverPhoto } = useFileUpload({
    maxSize: 5 * 1024 * 1024, // 5MB
    path: 'cover-photos'
  });

  const handleCoverPhotoSuccess = useCallback(async (url: string) => {
    if (!isOwnProfile || !auth.currentUser) return;
    
    try {
      setIsUploading(true);
      
      // Update user document in Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        coverPhotoUrl: url,
        updatedAt: new Date().toISOString()
      });
      
      toast({
        title: "Success",
        description: "Cover photo updated successfully!",
      });
      
      // Trigger parent component to refresh
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error("Error updating cover photo:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update cover photo. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  }, [isOwnProfile, onUpdate, toast]);
  
  const handleCoverPhotoError = useCallback((error: Error) => {
    console.error("Cover photo upload error:", error);
    toast({
      variant: "destructive",
      title: "Upload Error",
      description: error.message || "Failed to upload cover photo",
    });
  }, [toast]);

  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden mb-8">
      {/* Cover Photo */}
      <div className="relative h-48 bg-gradient-to-r from-primary/10 to-secondary/10">
        {profileUser.coverPhotoUrl ? (
          <img 
            src={profileUser.coverPhotoUrl} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : null}
        
        {isOwnProfile && (
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="relative">
              <FileUploadV2
                onSuccess={handleCoverPhotoSuccess}
                onError={handleCoverPhotoError}
                maxSize={5 * 1024 * 1024} // 5MB
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
                }}
                className="w-auto"
                label=""
                disabled={isUploading}
              />
              <Button 
                variant="outline"
                size="sm"
                className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={(e) => {
                  e.stopPropagation();
                  // Trigger file input click
                  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                  fileInput?.click();
                }}
              >
                {profileUser.coverPhotoUrl ? "Change Cover" : "Add Cover"}
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={() => router.push(`/profile/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        )}
        
        {/* Profile Picture */}
        <div className="absolute -bottom-12 left-6">
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarImage src={profileUser.avatarUrl} alt={profileUser.name} />
            <AvatarFallback>
              {profileUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      {/* Profile Info */}
      <div className="pt-16 px-6 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{profileUser.name}</h1>
            <p className="text-muted-foreground">@{profileUser.uid.slice(0, 8)}</p>
            
            {profileUser.bio && (
              <p className="mt-2 text-sm">{profileUser.bio}</p>
            )}
            
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              {profileUser.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{profileUser.location}</span>
                </div>
              )}
              
              {profileUser.website && (
                <a 
                  href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-primary transition-colors"
                >
                  <Globe className="w-4 h-4 mr-1" />
                  <span>{profileUser.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              
              {profileUser.socials?.twitter && (
                <a 
                  href={`https://twitter.com/${profileUser.socials.twitter}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Twitter className="w-4 h-4 mr-1" />
                  <span>@{profileUser.socials.twitter}</span>
                </a>
              )}
              
              {profileUser.socials?.instagram && (
                <a 
                  href={`https://instagram.com/${profileUser.socials.instagram}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-pink-500 hover:text-pink-600 transition-colors"
                >
                  <Instagram className="w-4 h-4 mr-1" />
                  <span>@{profileUser.socials.instagram}</span>
                </a>
              )}
            </div>
          </div>
          
          {!isOwnProfile && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Follow
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
