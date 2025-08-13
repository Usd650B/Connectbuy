"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { checkFirebaseConnection } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await checkFirebaseConnection();
        if (!status.connected) {
          console.error('Firebase connection error:', status.error);
          toast({
            variant: "destructive",
            title: "Connection Error",
            description: "Unable to connect to the server. Some features may not be available.",
            duration: 5000,
          });
        } else {
          console.log('Successfully connected to Firebase');
        }
      } catch (error) {
        console.error('Error checking Firebase connection:', error);
      }
    };

    // Check connection on mount
    checkConnection();

    // Set up periodic connection checks (every 5 minutes)
    const intervalId = setInterval(checkConnection, 5 * 60 * 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [toast]);

  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <Toaster />
      </CartProvider>
    </AuthProvider>
  );
}
