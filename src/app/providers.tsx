"use client";

import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <Toaster />
    </CartProvider>
  );
}
