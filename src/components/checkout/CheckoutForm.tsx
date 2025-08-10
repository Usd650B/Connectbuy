"use client";

import { useEffect, useState } from "react";
import {
  PaymentElement,
  AddressElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2 } from "lucide-react";
import { createPaymentIntent } from "@/app/checkout/actions";
import { useToast } from "@/hooks/use-toast";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function CheckoutFormContent() {
  const router = useRouter();
  const { cart, cartTotal, clearCart, itemCount } = useCart();
  const isCartEmpty = itemCount === 0;

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
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={60}
                  height={80}
                  className="rounded-md object-cover"
                  data-ai-hint="product photo"
                />
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
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
        {isCartEmpty ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                Your cart is empty.
            </div>
        ) : (
            <PaymentForm />
        )}
      </div>
    </div>
  );
}

function PaymentForm() {
    const { cartTotal, clearCart } = useCart();
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (cartTotal > 0) {
            createPaymentIntent(cartTotal)
                .then(data => {
                    if (data.clientSecret) {
                        setClientSecret(data.clientSecret);
                    } else {
                         toast({variant: "destructive", title: "Error", description: data.error});
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [cartTotal, toast]);

    if(loading || !clientSecret) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading payment gateway...</p>
            </div>
        )
    }

    const options: StripeElementsOptions = {
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
    };

    return (
        <Elements options={options} stripe={stripePromise}>
          <StripeCheckoutForm />
        </Elements>
    );
}

function StripeCheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart, cartTotal } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success`,
      },
      redirect: "if_required",
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setErrorMessage(error.message || "An unexpected error occurred.");
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
      setIsProcessing(false);
    } else {
      // Payment succeeded
      toast({title: "Payment Successful!", description: "Your order has been placed."});
      clearCart();
      router.push("/order-success");
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
            <h3 className="text-xl font-headline font-bold mb-4">Shipping & Payment</h3>
            <AddressElement id="address-element" options={{mode: 'shipping'}} />
        </div>
        <div>
             <PaymentElement id="payment-element" />
        </div>
      
        {errorMessage && <Alert variant="destructive"><AlertDescription>{errorMessage}</AlertDescription></Alert>}

        <Button type="submit" size="lg" className="w-full font-headline" disabled={isProcessing || !stripe || !elements}>
            {isProcessing ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                </>
            ): (
                `Pay $${cartTotal.toFixed(2)}`
            )}
        </Button>
    </form>
  )
}

export { CheckoutFormContent as CheckoutForm };

