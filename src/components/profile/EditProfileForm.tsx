"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useCallback } from "react";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadV2 } from "@/components/ui/FileUploadV2";
import { useFileUpload } from "@/hooks/useFileUpload";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  bio: z.string().max(160, { message: "Bio cannot exceed 160 characters." }).optional(),
});

export function EditProfileForm() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.photoURL || user?.avatarUrl || null
  );

  // Initialize file upload hook
  const { upload: uploadFile, isUploading } = useFileUpload({
    maxSize: 2 * 1024 * 1024, // 2MB
    path: 'avatars'
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.displayName || user?.name || "",
      bio: user?.bio || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        bio: user.bio,
      });
      setAvatarUrl(user.avatarUrl || null);
    }
  }, [user, form]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleAvatarSuccess = useCallback(async (url: string) => {
    setAvatarUrl(url);
    
    try {
      // Update user profile with new avatar URL
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          photoURL: url
        });
        
        // Update user document in Firestore
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          avatarUrl: url,
          updatedAt: new Date().toISOString()
        });
        
        toast({
          title: "Success",
          description: "Profile picture updated successfully!",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile picture. Please try again.",
      });
    }
  }, [toast]);
  
  const handleAvatarError = useCallback((error: Error) => {
    console.error("Upload error:", error);
    toast({
      variant: "destructive",
      title: "Upload Error",
      description: error.message || "Failed to upload file",
    });
  }, [toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    
    setLoading(true);

    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser!, {
        displayName: values.name,
        photoURL: avatarUrl || user.photoURL || user.avatarUrl || undefined,
      });

      // Update user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: values.name,
        displayName: values.name, // Keep both for backward compatibility
        bio: values.bio || null,
        ...(avatarUrl ? { 
          photoURL: avatarUrl,
          avatarUrl: avatarUrl // Update both for consistency
        } : {}),
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      
      router.push(`/profile/${user.uid}`);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }
  
  if (authLoading || !user) {
    return <div>Loading...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-border">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground">
                  {user?.displayName?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Profile Picture</p>
            <p className="text-xs text-muted-foreground mb-2">
              Recommended: Square image, at least 200x200 pixels
            </p>
          </div>
        </div>
        <FileUploadV2
          onSuccess={handleAvatarSuccess}
          onError={handleAvatarError}
          maxSize={2 * 1024 * 1024} // 2MB
          accept={{
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
          }}
          className="max-w-xs"
          label="Upload new profile picture"
          description="JPG, PNG, GIF up to 2MB"
          disabled={isUploading}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us a little bit about yourself" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
    