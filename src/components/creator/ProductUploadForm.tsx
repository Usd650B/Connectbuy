"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotoshootTool } from "./PhotoshootTool";
import { useToast } from "@/hooks/use-toast";

export function ProductUploadForm() {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const { toast } = useToast();


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      setProductImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission
    toast({
      title: "Product Listed!",
      description: <span className="font-body">Your new product is now live on ConnectBuy.</span>
    });
    // Reset form
    setProductImage(null);
    setProductImageUrl(null);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name</Label>
            <Input id="product-name" placeholder="e.g. Summer Vibes T-Shirt" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe your product..." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input id="price" type="number" step="0.01" placeholder="e.g. 29.99" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-image">Product Image</Label>
            <Input id="product-image" type="file" accept="image/*" onChange={handleImageUpload} required />
          </div>
          <Button type="submit" className="w-full font-headline" disabled={!productImage}>
            Add Product
          </Button>
        </form>
      </div>
      <div>
        <PhotoshootTool productImageUrl={productImageUrl} />
      </div>
    </div>
  );
}
