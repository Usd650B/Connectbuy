"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotoshootTool } from "./PhotoshootTool";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useRouter } from "next/navigation";


export function ProductUploadForm() {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      setProductImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productImage || !user) return;
    
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("product-name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);

    try {
      // 1. Upload image to Firebase Storage
      const imageRef = ref(storage, `products/${user.uid}/${productImage.name}-${Date.now()}`);
      const snapshot = await uploadBytes(imageRef, productImage);
      const imageUrl = await getDownloadURL(snapshot.ref);

      // 2. Add product to Firestore
      await addDoc(collection(db, "products"), {
        name,
        description,
        price,
        imageUrl,
        creator: {
          uid: user.uid,
          name: user.name,
          avatarUrl: user.avatarUrl
        },
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Product Listed!",
        description: <span className="font-body">Your new product is now live on ConnectBuy.</span>
      });
      
      // Reset form
      setProductImage(null);
      setProductImageUrl(null);
      (e.target as HTMLFormElement).reset();
      router.push('/profile');

    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem listing your product."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name</Label>
            <Input id="product-name" name="product-name" placeholder="e.g. Summer Vibes T-Shirt" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Describe your product..." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input id="price" name="price" type="number" step="0.01" placeholder="e.g. 29.99" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-image">Product Image</Label>
            <Input id="product-image" type="file" accept="image/*" onChange={handleImageUpload} required />
          </div>
          <Button type="submit" className="w-full font-headline" disabled={!productImage || loading}>
            {loading ? 'Adding Product...' : 'Add Product'}
          </Button>
        </form>
      </div>
      <div>
        <PhotoshootTool productImageUrl={productImageUrl} />
      </div>
    </div>
  );
}
