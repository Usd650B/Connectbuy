"use client";

import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartItem } from "./CartItem";
import { Separator } from "../ui/separator";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { cart, cartTotal, itemCount } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle className="font-headline">
            My Cart ({itemCount})
          </SheetTitle>
        </SheetHeader>
        <Separator />
        {itemCount > 0 ? (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-4 p-6">
                {cart.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="p-6">
              <div className="flex w-full flex-col gap-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <Button asChild size="lg" className="w-full font-headline" onClick={() => onOpenChange(false)}>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-semibold text-muted-foreground">
                Your cart is empty
              </p>
              <Button asChild variant="link" className="font-headline text-primary" onClick={() => onOpenChange(false)}>
                <Link href="/">Start Shopping</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
