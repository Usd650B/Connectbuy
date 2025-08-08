import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function OrderSuccessPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
        <h1 className="text-4xl font-headline font-bold text-primary">Order Successful!</h1>
        <p className="text-lg text-muted-foreground">
          Thank you for your purchase. A confirmation email has been sent to you.
        </p>
        <Button asChild className="font-headline">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
