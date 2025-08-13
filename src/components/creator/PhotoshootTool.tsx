"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const backgrounds = [
  { id: 1, url: "https://placehold.co/600x800.png", hint: "beach scene" },
  { id: 2, url: "https://placehold.co/600x800.png", hint: "city street" },
  { id: 3, url: "https://placehold.co/600x800.png", hint: "marble texture" },
  { id: 4, url: "https://placehold.co/600x800.png", hint: "minimalist studio" },
];

interface PhotoshootToolProps {
  productImageUrl: string | null;
  onImageCapture?: (imageUrl: string) => void;
}

export function PhotoshootTool({ productImageUrl, onImageCapture }: PhotoshootToolProps) {
  const [selectedBg, setSelectedBg] = useState(backgrounds[0].url);
  const [isCapturing, setIsCapturing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCapture = async () => {
    if (!containerRef.current || !onImageCapture) return;
    
    setIsCapturing(true);
    
    try {
      // Use html-to-image to capture the container
      const htmlToImage = (await import('html-to-image')).default;
      const dataUrl = await htmlToImage.toPng(containerRef.current);
      
      // Pass the captured image URL to the parent
      onImageCapture(dataUrl);
    } catch (error) {
      console.error('Error capturing image:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Card className="relative">
      {onImageCapture && (
        <div className="absolute top-2 right-2 z-10">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCapture}
            disabled={!productImageUrl || isCapturing}
          >
            {isCapturing ? 'Capturing...' : 'Capture'}
          </Button>
        </div>
      )}
      <CardHeader>
        <CardTitle className="font-headline">Virtual Photoshoot</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          className="relative w-full aspect-[3/4] bg-muted rounded-lg overflow-hidden mb-4"
        >
          {productImageUrl ? (
            <>
              <Image src={selectedBg} layout="fill" objectFit="cover" alt="Background" data-ai-hint="fashion background" />
              <div className="absolute inset-0 p-8 flex items-center justify-center">
                 <Image
                    src={productImageUrl}
                    alt="Product Preview"
                    width={400}
                    height={500}
                    className="object-contain drop-shadow-2xl"
                    style={{ maxHeight: '100%', maxWidth: '100%' }}
                  />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Upload an image to see a preview
            </div>
          )}
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-2">Choose a background</h4>
          <div className="grid grid-cols-4 gap-2">
            {backgrounds.map((bg) => (
              <button key={bg.id} onClick={() => setSelectedBg(bg.url)}>
                <Image
                  src={bg.url}
                  alt={`Background ${bg.id}`}
                  width={100}
                  height={100}
                  className={cn(
                    "rounded-md object-cover cursor-pointer border-2 transition-all",
                    selectedBg === bg.url ? "border-primary" : "border-transparent"
                  )}
                  data-ai-hint={bg.hint}
                />
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
