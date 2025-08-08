import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CheckoutPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Checkout</CardTitle>
          <CardDescription>Complete your order by providing your details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <CheckoutForm />
        </CardContent>
      </Card>
    </div>
  );
}
