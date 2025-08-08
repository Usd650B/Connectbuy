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
import { useCart } from "@/context/CartContext";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const formSchema = z.object({
  // Shipping
  fullName: z.string().min(2, { message: "Full name is required." }),
  address: z.string().min(5, { message: "A valid address is required." }),
  city: z.string().min(2, { message: "City is required." }),
  zipCode: z.string().regex(/^\d{5}$/, { message: "Enter a valid 5-digit zip code." }),

  // Payment
  cardName: z.string().min(2, { message: "Name on card is required." }),
  cardNumber: z.string().regex(/^\d{16}$/, { message: "Enter a valid 16-digit card number." }),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "Use MM/YY format." }),
  cardCvc: z.string().regex(/^\d{3,4}$/, { message: "Enter a valid CVC." }),
});

export function CheckoutForm() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const isCartEmpty = cart.length === 0;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      address: "",
      city: "",
      zipCode: "",
      cardName: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Mock payment processing
    console.log("Processing payment for:", values);
    clearCart();
    router.push("/order-success");
  }

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="md:col-span-1">
        <h3 className="text-xl font-headline font-bold mb-4">Order Summary</h3>
        {isCartEmpty ? (
           <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Your Cart is Empty</AlertTitle>
            <AlertDescription>
              Please add items to your cart before proceeding to checkout.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-4">
                <Image src={item.imageUrl} alt={item.name} width={60} height={80} className="rounded-md object-cover" data-ai-hint="product photo" />
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
      <div className="md:col-span-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <h3 className="text-xl font-headline font-bold mb-4">Shipping Details</h3>
              <div className="space-y-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="zipCode" render={({ field }) => (
                      <FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-headline font-bold mb-4">Payment Information</h3>
              <div className="space-y-4">
                <FormField control={form.control} name="cardName" render={({ field }) => (
                    <FormItem><FormLabel>Name on Card</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="cardNumber" render={({ field }) => (
                    <FormItem><FormLabel>Card Number</FormLabel><FormControl><Input placeholder="XXXXXXXXXXXXXXXX" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="cardExpiry" render={({ field }) => (
                      <FormItem><FormLabel>Expiry (MM/YY)</FormLabel><FormControl><Input placeholder="MM/YY" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="cardCvc" render={({ field }) => (
                      <FormItem><FormLabel>CVC</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full font-headline" disabled={isCartEmpty}>
              {isCartEmpty ? "Your cart is empty" : `Pay $${cartTotal.toFixed(2)}`}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
