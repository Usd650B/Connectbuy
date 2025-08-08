"use client";

import Image from "next/image";
import { X } from "lucide-react";
import type { CartItem as CartItemType } from "@/types";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { removeFromCart, updateQuantity } = useCart();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const quantity = value === "" ? 1 : parseInt(value, 10);
    if (!isNaN(quantity) && quantity > 0) {
      updateQuantity(item.id, quantity);
    }
  };

  return (
    <div className="flex items-start gap-4">
      <Image
        src={item.imageUrl}
        alt={item.name}
        width={80}
        height={100}
        className="rounded-md object-cover"
        data-ai-hint="product photo"
      />
      <div className="flex-1">
        <h3 className="font-semibold font-headline text-base">{item.name}</h3>
        <p className="text-sm text-muted-foreground">
          ${item.price.toFixed(2)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Input
            type="number"
            min="1"
            value={item.quantity}
            onChange={handleQuantityChange}
            className="h-8 w-16"
            aria-label={`Quantity for ${item.name}`}
          />
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="mt-2 h-8 w-8 text-muted-foreground"
          onClick={() => removeFromCart(item.id)}
          aria-label={`Remove ${item.name} from cart`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
