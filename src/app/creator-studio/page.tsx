"use client";

import { ProductUploadForm } from "@/components/creator/ProductUploadForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreatorStudioPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="container mx-auto max-w-4xl py-8 px-4">Loading...</div>;
  }

  if (!user || user.role !== 'seller') {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You must be logged in as a seller to access this page.
            <Button variant="link" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
       <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">My Shop</CardTitle>
          <CardDescription>Add a new product to your collection. Upload an image and see the magic happen.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductUploadForm />
        </CardContent>
      </Card>
    </div>
  );
}
