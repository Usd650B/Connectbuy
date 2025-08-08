import { ProductUploadForm } from "@/components/creator/ProductUploadForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CreatorStudioPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
       <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Creator Studio</CardTitle>
          <CardDescription>Add a new product to your collection. Upload an image and see the magic happen.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductUploadForm />
        </CardContent>
      </Card>
    </div>
  );
}
