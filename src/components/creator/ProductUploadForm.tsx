"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PhotoshootTool } from "./PhotoshootTool";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useRouter } from "next/navigation";

type MediaType = 'image' | 'video';


export function ProductUploadForm() {
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type based on selected media type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    
    if (mediaType === 'image' && !validImageTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      });
      return;
    }
    
    if (mediaType === 'video' && !validVideoTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a valid video file (MP4, WebM, or QuickTime).',
      });
      return;
    }

    setMediaFile(file);
    setMediaUrl(URL.createObjectURL(file));
  };

  const handleMediaTypeChange = (type: MediaType) => {
    setMediaType(type);
    setMediaFile(null);
    setMediaUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mediaFile || !user) return;
    
    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("product-name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);

    try {
      // 1. Upload media to Firebase Storage
      const fileExtension = mediaFile.name.split('.').pop();
      const mediaRef = ref(storage, `${mediaType}s/${user.uid}/${Date.now()}.${fileExtension}`);
      
      const uploadTask = uploadBytesResumable(mediaRef, mediaFile);
      
      // Track upload progress
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          throw error;
        }
      );
      
      // Wait for upload to complete
      await uploadTask;
      const mediaUrl = await getDownloadURL(uploadTask.snapshot.ref);

      // 2. Add product to Firestore
      const productData: any = {
        name,
        description,
        price,
        mediaType,
        [mediaType === 'image' ? 'imageUrl' : 'videoUrl']: mediaUrl,
        creator: {
          uid: user.uid,
          name: user.name,
          avatarUrl: user.avatarUrl
        },
        createdAt: serverTimestamp(),
        likeCount: 0,
        likes: []
      };

      await addDoc(collection(db, "products"), productData);

      toast({
        title: "Product Listed!",
        description: `Your new ${mediaType} product is now live on ConnectBuy.`,
        duration: 3000
      });
      
      // Reset form
      setMediaFile(null);
      setMediaUrl(null);
      setUploadProgress(0);
      (e.target as HTMLFormElement).reset();
      router.push('/');

    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem listing your product. Please try again.",
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  }

  const renderMediaPreview = () => {
    if (!mediaUrl) return null;
    
    return (
      <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden bg-black flex items-center justify-center">
        {mediaType === 'image' ? (
          <img 
            src={mediaUrl} 
            alt="Preview" 
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <video
            src={mediaUrl}
            controls
            className="max-h-full max-w-full"
            onPlay={() => {
              const video = document.querySelector('video');
              if (video) video.controls = true;
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Tabs 
        value={mediaType} 
        onValueChange={(value) => handleMediaTypeChange(value as MediaType)}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="image">Image Post</TabsTrigger>
          <TabsTrigger value="video">Video Post</TabsTrigger>
        </TabsList>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input 
                  id="product-name" 
                  name="product-name" 
                  placeholder="e.g. Summer Vibes T-Shirt" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Describe your product..." 
                  rows={4}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input 
                  id="price" 
                  name="price" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  placeholder="e.g. 29.99" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="media-upload">
                  {mediaType === 'image' ? 'Product Image' : 'Product Video'}
                </Label>
                <Input 
                  id="media-upload"
                  ref={fileInputRef}
                  type="file" 
                  accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleMediaChange}
                  required 
                />
                <p className="text-xs text-muted-foreground">
                  {mediaType === 'image' 
                    ? 'JPEG, PNG, or WebP (max 10MB)'
                    : 'MP4, WebM, or QuickTime (max 50MB)'}
                </p>
              </div>
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Uploading... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full font-headline" 
                disabled={!mediaFile || loading || uploadProgress > 0}
              >
                {loading ? 'Publishing...' : 'Publish Product'}
              </Button>
            </form>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-semibold">Preview</h3>
            {mediaUrl ? (
              renderMediaPreview()
            ) : (
              <div className="h-64 md:h-96 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                {mediaType === 'image' 
                  ? 'Upload an image to see preview'
                  : 'Upload a video to see preview'}
              </div>
            )}
            
            {mediaType === 'image' && (
              <div className="mt-4">
                <PhotoshootTool 
                  productImageUrl={mediaUrl} 
                  onImageCapture={(imageUrl: string) => {
                    setMediaUrl(imageUrl);
                    // Convert data URL to blob for upload
                    fetch(imageUrl)
                      .then(res => res.blob())
                      .then(blob => {
                        const file = new File([blob], 'capture.png', { type: 'image/png' });
                        setMediaFile(file);
                      });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
