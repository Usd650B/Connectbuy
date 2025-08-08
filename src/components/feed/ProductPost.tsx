"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

interface ProductPostProps {
  product: Product;
}

export function ProductPost({ product }: ProductPostProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to cart!",
      description: <span className="font-body">{product.name} has been added to your cart.</span>,
      duration: 3000,
    });
  };

  const ActionButton = ({
    icon: Icon,
    label,
    onClick,
    isActive = false,
  }: {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
    isActive?: boolean;
  }) => (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "rounded-full h-12 w-12 bg-black/30 hover:bg-black/50 text-white",
          isActive && "text-primary bg-primary/20 hover:bg-primary/30"
        )}
        onClick={onClick}
      >
        <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
      </Button>
      <span className="text-xs font-bold text-white">{label}</span>
    </div>
  );

  return (
    <div className="relative h-full w-full bg-background">
      <Image
        src={product.imageUrl}
        alt={product.name}
        layout="fill"
        objectFit="cover"
        className="z-0"
        data-ai-hint="fashion product"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10"></div>

      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 text-white">
        <div className="flex items-end justify-between">
          <div className="flex-1 pr-12">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={product.creator.avatarUrl} alt={product.creator.name} />
                <AvatarFallback>{product.creator.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-bold font-headline">{product.creator.name}</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold font-headline">{product.name}</h2>
            <p className="mt-1 text-sm font-body opacity-90">{product.description}</p>
            <p className="mt-2 text-xl font-bold font-headline">${product.price.toFixed(2)}</p>
          </div>

          <div className="flex flex-col gap-4">
            <ActionButton
              icon={Heart}
              label="Like"
              isActive={liked}
              onClick={() => setLiked(!liked)}
            />
            <ActionButton
              icon={Bookmark}
              label="Save"
              isActive={bookmarked}
              onClick={() => setBookmarked(!bookmarked)}
            />
            <ActionButton icon={Share2} label="Share" onClick={() => alert("Shared!")} />
            <ActionButton icon={ShoppingCart} label="Buy" onClick={handleAddToCart} />
          </div>
        </div>
      </div>
    </div>
  );
}
