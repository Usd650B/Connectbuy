
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
import { useEffect, useState } from "react";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  bio: z.string().max(160, { message: "Bio cannot exceed 160 characters." }).optional(),
});

export function EditProfileForm() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        bio: user.bio,
      });
      setAvatarPreview(user.avatarUrl || null);
    }
  }, [user, form]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    setLoading(true);

    try {
      let newAvatarUrl = user.avatarUrl;

      // 1. Upload new avatar if provided
      if (avatarFile) {
        const imageRef = ref(storage, `avatars/${user.uid}/${avatarFile.name}`);
        const snapshot = await uploadBytes(imageRef, avatarFile);
        newAvatarUrl = await getDownloadURL(snapshot.ref);
      }

      // 2. Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: values.name,
          photoURL: newAvatarUrl,
        });
      }

      // 3. Update user document in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        name: values.name,
        bio: values.bio,
        avatarUrl: newAvatarUrl,
      });

      toast({ title: "Profile updated successfully!" });
      router.push("/profile");
      router.refresh(); // To reflect changes immediately

    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
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
          <div className="relative">
            {avatarPreview ? (
              <Image src={avatarPreview} alt="Avatar preview" width={96} height={96} className="rounded-full object-cover h-24 w-24" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                <span className="text-2xl text-muted-foreground">{user?.name?.charAt(0)}</span>
              </div>
            )}
          </div>
          <div>
            <FormLabel htmlFor="avatar">Avatar</FormLabel>
            <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="mt-2" />
          </div>
        </div>

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
    