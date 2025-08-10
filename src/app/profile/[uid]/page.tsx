
"use client";

import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingBag, UserPlus, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, UserProfile } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function UserProfilePage() {
  const { uid } = useParams();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.uid === uid;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!uid) return;
      setLoading(true);
      try {
        const userDocRef = doc(db, "users", uid as string);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = { id: userDocSnap.id, ...userDocSnap.data() } as UserProfile;
          setProfileUser(userData);
          await fetchUserContent(userData);
        } else {
          toast({ variant: "destructive", title: "Error", description: "User profile not found." });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch user profile." });
      } finally {
        setLoading(false);
      }
    };

    const fetchUserContent = async (user: UserProfile) => {
        try {
            if (user.role === 'seller') {
              const productsQuery = query(collection(db, "products"), where("creator.uid", "==", user.uid));
              const productsSnapshot = await getDocs(productsQuery);
              const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
              setUserProducts(products);
            }
            if (user.likedProducts && user.likedProducts.length > 0) {
              const likedProductsQuery = query(collection(db, "products"), where("id", "in", user.likedProducts));
              const likedSnapshot = await getDocs(likedProductsQuery);
              const liked = likedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
              setLikedProducts(liked);
            }
        } catch(error) {
             console.error("Error fetching user content:", error);
        }
    }

    fetchUserProfile();
  }, [uid, toast]);


  if (loading || !profileUser) {
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

  const profileTitle = profileUser.role === 'seller' ? `${profileUser.name}'s Shop` : `${profileUser.name}'s Profile`;

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background">
              <AvatarImage src={profileUser.avatarUrl} alt={profileUser.name} />
              <AvatarFallback>{profileUser.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-headline">{profileTitle}</h1>
                {!isOwnProfile && (
                    <div className="flex gap-2">
                        <Button variant="default">
                            <UserPlus className="mr-2 h-4 w-4"/>
                            Follow
                        </Button>
                         <Button variant="outline">
                            <MessageSquare className="mr-2 h-4 w-4"/>
                            Message
                        </Button>
                    </div>
                )}
                 {isOwnProfile && (
                     <Button variant="outline" size="sm" asChild>
                        <Link href="/profile/edit">Edit Profile</Link>
                    </Button>
                 )}
              </div>
              <p className="text-muted-foreground mt-1">{profileUser.name}</p>
              <div className="hidden md:flex items-center gap-6 mt-4">
                <div><span className="font-bold">{profileUser.stats?.following || 0}</span> following</div>
                <div><span className="font-bold">{(profileUser.stats?.followers || 0).toLocaleString()}</span> followers</div>
                <div><span className="font-bold">{(profileUser.stats?.likes || 0).toLocaleString()}</span> likes</div>
              </div>
              <p className="mt-4 font-body">{profileUser.bio}</p>
            </div>
          </div>
           <div className="flex md:hidden items-center justify-around gap-4 mt-4 border-t pt-4">
                <div className="text-center"><div className="font-bold">{profileUser.stats?.following || 0}</div> <span className="text-sm text-muted-foreground">following</span></div>
                <div className="text-center"><div className="font-bold">{(profileUser.stats?.followers || 0).toLocaleString()}</div> <span className="text-sm text-muted-foreground">followers</span></div>
                <div className="text-center"><div className="font-bold">{(profileUser.stats?.likes || 0).toLocaleString()}</div> <span className="text-sm text-muted-foreground">likes</span></div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="creations" className="w-full">
            <TabsList className="w-full justify-around rounded-none border-b">
              {profileUser.role === 'seller' && (
                <TabsTrigger value="creations" className="flex-1 gap-2 rounded-none">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="hidden sm:inline">Creations</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="liked" className="flex-1 gap-2 rounded-none">
                <Heart className="h-5 w-5" />
                <span className="hidden sm:inline">Liked</span>
              </TabsTrigger>
            </TabsList>

            {profileUser.role === 'seller' && (
               <TabsContent value="creations">
                {loading ? (
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">This creator hasn't listed any products yet.</div>
                )}
               </TabsContent>
            )}

            <TabsContent value="liked">
              {loading ? (
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
                  <div className="text-center p-8 text-muted-foreground">This user hasn't liked any products yet.</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
