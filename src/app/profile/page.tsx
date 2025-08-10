
"use client";

import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Heart, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;
      setProductsLoading(true);
      try {
        if(user.role === 'seller') {
          const q = query(collection(db, "products"), where("creator.uid", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setUserProducts(products);
        }
        if (user.likedProducts && user.likedProducts.length > 0) {
          const likedProductsQuery = query(collection(db, "products"), where("id", "in", user.likedProducts));
          const likedSnapshot = await getDocs(likedProductsQuery);
          const liked = likedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setLikedProducts(liked);
        }
      } catch (error) {
        console.error("Error fetching user products:", error);
        toast({variant: "destructive", title: "Error", description: "Could not fetch your products."})
      } finally {
        setProductsLoading(false);
      }
    };

    if (user) {
      fetchProducts();
    }
  }, [user, toast]);

  const handleDeleteProduct = async (productId: string) => {
    try {
        await deleteDoc(doc(db, "products", productId));
        setUserProducts(prev => prev.filter(p => p.id !== productId));
        toast({title: "Success", description: "Product deleted successfully."})
    } catch (error) {
        console.error("Error deleting product: ", error);
        toast({variant: "destructive", title: "Error", description: "Could not delete the product."})
    }
  }


  if (loading || !user) {
    return (
       <div className="container mx-auto max-w-4xl py-8 px-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
               <div className="flex flex-col md:flex-row items-start gap-4">
                  <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full" />
                  <div className="flex-1 space-y-2">
                     <Skeleton className="h-8 w-1/3" />
                     <Skeleton className="h-5 w-1/4" />
                     <Skeleton className="h-5 w-2/3" />
                  </div>
               </div>
            </CardHeader>
          </Card>
       </div>
    )
  }

  const profileTitle = user.role === 'seller' ? 'My Shop' : 'My Profile';

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-headline">{profileTitle}</h1>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile/edit">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
              <p className="text-muted-foreground mt-1">{user.name}</p>
              <div className="hidden md:flex items-center gap-6 mt-4">
                <div><span className="font-bold">{user.stats?.following || 0}</span> following</div>
                <div><span className="font-bold">{(user.stats?.followers || 0).toLocaleString()}</span> followers</div>
                <div><span className="font-bold">{(user.stats?.likes || 0).toLocaleString()}</span> likes</div>
              </div>
              <p className="mt-4 font-body">{user.bio}</p>
            </div>
          </div>
           <div className="flex md:hidden items-center justify-around gap-4 mt-4 border-t pt-4">
                <div className="text-center"><div className="font-bold">{user.stats?.following || 0}</div> <span className="text-sm text-muted-foreground">following</span></div>
                <div className="text-center"><div className="font-bold">{(user.stats?.followers || 0).toLocaleString()}</div> <span className="text-sm text-muted-foreground">followers</span></div>
                <div className="text-center"><div className="font-bold">{(user.stats?.likes || 0).toLocaleString()}</div> <span className="text-sm text-muted-foreground">likes</span></div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="creations" className="w-full">
            <TabsList className="w-full justify-around rounded-none border-b">
              {user.role === 'seller' && (
                <TabsTrigger value="creations" className="flex-1 gap-2 rounded-none">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="hidden sm:inline">My Creations</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="liked" className="flex-1 gap-2 rounded-none">
                <Heart className="h-5 w-5" />
                <span className="hidden sm:inline">Liked</span>
              </TabsTrigger>
            </TabsList>

            {user.role === 'seller' && (
               <TabsContent value="creations">
                {productsLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 p-1">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-[4/5]" />)}
                  </div>
                ) : userProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-2">
                    {userProducts.map(product => (
                      <div key={product.id} className="relative group rounded-lg overflow-hidden">
                        <div className="aspect-square relative">
                          <Image src={product.imageUrl} alt={product.name} layout="fill" objectFit="cover" data-ai-hint="fashion product" />
                        </div>
                        <div className="p-2 bg-card">
                            <p className="font-bold truncate">{product.name}</p>
                            <p className="text-sm text-primary">${product.price.toFixed(2)}</p>
                        </div>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8">
                               <Trash2 className="h-4 w-4" />
                             </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                product and remove its data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">You haven't created any products yet.</div>
                )}
               </TabsContent>
            )}

            <TabsContent value="liked">
              {productsLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 p-1">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square" />)}
                  </div>
              ) : likedProducts.length > 0 ? (
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-2">
                    {likedProducts.map(product => (
                       <div key={product.id} className="relative group rounded-lg overflow-hidden">
                        <div className="aspect-square relative">
                           <Image src={product.imageUrl} alt={product.name} layout="fill" objectFit="cover" data-ai-hint="fashion product" />
                        </div>
                         <div className="p-2 bg-card">
                            <p className="font-bold truncate">{product.name}</p>
                            <p className="text-sm text-primary">${product.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
              ): (
                  <div className="text-center p-8 text-muted-foreground">You haven't liked any products yet.</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
