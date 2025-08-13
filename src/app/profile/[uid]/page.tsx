"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingBag, Star, Sparkles, Check, UserPlus, MessageSquare, Users } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { collection, query, where, getDocs, doc, getDoc, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, UserProfile } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Helper function to safely convert Firestore document to UserProfile
const toUserProfile = (id: string, data: any): UserProfile => ({
  id,
  uid: data.uid || id,
  email: data.email || '',
  name: data.name || '',
  username: data.username || '',
  role: data.role || 'buyer',
  bio: data.bio || '',
  avatar: data.avatar || '',
  coverImage: data.coverImage || '',
  website: data.website || '',
  location: data.location || '',
  socialLinks: data.socialLinks || {},
  stats: data.stats || { followers: 0, following: 0, products: 0 },
  createdAt: data.createdAt?.toDate() || new Date(),
  updatedAt: data.updatedAt?.toDate() || new Date(),
  ...data
});

export default function UserProfilePage() {
  const params = useParams();
  const uid = Array.isArray(params.uid) ? params.uid[0] : params.uid;
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowSuccess, setShowFollowSuccess] = useState(false);
  const [similarProfiles, setSimilarProfiles] = useState<UserProfile[]>([]);
  const router = useRouter();

  const isOwnProfile = currentUser?.uid === uid;
  const displayName = profileUser?.username || profileUser?.name?.toLowerCase().replace(/\s+/g, '') || '';
  const isSeller = profileUser?.role === 'seller';
  
  // Fetch user profile data
  const fetchUserProfile = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = toUserProfile(userDocSnap.id, userDocSnap.data());
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
  }, [toast]);
  
  // Fetch user content (products, liked items, etc.)
  const fetchUserContent = useCallback(async (user: UserProfile) => {
    try {
      if (user.role === 'seller') {
        const productsQuery = query(collection(db, "products"), where("creator.uid", "==", user.uid));
        const productsSnapshot = await getDocs(productsQuery);
        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setUserProducts(products);
        
        // Set featured products (first 3 products by default)
        setFeaturedProducts(products.slice(0, 3));
      }
      
      if (user.likedProducts && user.likedProducts.length > 0) {
        // Get up to 9 liked products
        const likedToFetch = user.likedProducts.slice(0, 9);
        const likedProductsQuery = query(collection(db, "products"), where("id", "in", likedToFetch));
        const likedSnapshot = await getDocs(likedProductsQuery);
        const liked = likedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setLikedProducts(liked);
      }
    } catch(error) {
      console.error("Error fetching user content:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load user content." });
    }
  }, [toast]);

  // Handle profile updates
  const handleProfileUpdate = useCallback(() => {
    if (uid) {
      fetchUserProfile(uid);
    }
  }, [uid, fetchUserProfile]);

  // Initial data fetch
  useEffect(() => {
    if (uid) {
      fetchUserProfile(uid);
    }
  }, [uid, fetchUserProfile]);

  // Load user's follow status
  useEffect(() => {
    if (currentUser && profileUser) {
      // TODO: Check if current user is following this profile
      // For now, we'll set a default
      setIsFollowing(false);
    }
  }, [currentUser, profileUser]);
  
  // Fetch additional data when profile loads
  useEffect(() => {
    if (profileUser) {
      if (isSeller) {
        fetchFeaturedProducts(profileUser.uid);
      }
      fetchSimilarProfiles(profileUser);
    }
  }, [profileUser]);

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

  const profileTitle = isSeller ? `${profileUser.name || 'User'}'s Shop` : `${profileUser.name || 'User'}'s Profile`;
  
  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    try {
      // Toggle follow state
      const newFollowState = !isFollowing;
      setIsFollowing(newFollowState);
      
      // Update followers count optimistically
      setProfileUser(prev => ({
        ...prev!,
        stats: {
          ...prev!.stats!,
          followers: (prev!.stats?.followers || 0) + (newFollowState ? 1 : -1)
        }
      }));
      
      if (newFollowState) {
        setShowFollowSuccess(true);
        setTimeout(() => setShowFollowSuccess(false), 3000);
      }
      
      // TODO: Implement actual follow/unfollow API call
      // await followUser(currentUser.uid, uid as string, newFollowState);
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update follow status. Please try again.'
      });
      // Revert on error
      setIsFollowing(!isFollowing);
    }
  };
  
  const fetchFeaturedProducts = useCallback(async (userId: string) => {
    try {
      const featuredQuery = query(
        collection(db, 'products'),
        where('creator.uid', '==', userId),
        orderBy('soldCount', 'desc'),
        limit(3)
      );
      const snapshot = await getDocs(featuredQuery);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      setFeaturedProducts(products);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  }, []);
  
  const fetchSimilarProfiles = useCallback(async (userProfile: UserProfile) => {
    if (!userProfile.uid) return;
    try {
      // In a real app, you'd want to implement actual similarity logic
      // This is a simplified version that just gets random active sellers
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'seller'),
        where('uid', '!=', userProfile.uid),
        limit(4)
      );
      const snapshot = await getDocs(usersQuery);
      const profiles = snapshot.docs
        .map(doc => toUserProfile(doc.id, doc.data()))
        .filter((p): p is UserProfile & { stats: { followers: number } } => 
          !!p.stats?.followers && p.stats.followers > 0
        );
      setSimilarProfiles(profiles);
    } catch (error) {
      console.error('Error fetching similar profiles:', error);
    }
  }, []);

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 space-y-8">
      {/* Profile Header */}
      <Card className="relative overflow-hidden">
        {/* Follow success notification */}
        {showFollowSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2 z-10"
          >
            <Check className="h-4 w-4" />
            <span>Following {profileUser.name.split(' ')[0]}</span>
          </motion.div>
        )}
        
        {/* Profile background */}
        <div className="h-32 bg-gradient-to-r from-pink-500 to-purple-600 w-full"></div>
        <CardHeader className="p-4 md:p-6 pt-0">
          <div className="flex flex-col md:flex-row items-start gap-6 -mt-16 relative z-10">
            <div className="relative group">
              <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-background relative">
                <AvatarImage src={profileUser.avatarUrl} alt={profileUser.name} className="object-cover" />
                <AvatarFallback className="text-3xl">
                  {profileUser.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {isSeller && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  {profileUser.verificationStatus === 'verified' ? 'Verified Seller' : 'Seller'}
                </div>
              )}
            </div>
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold font-headline">{profileUser.name}</h1>
                    {profileUser.verificationStatus === 'verified' && (
                      <Badge variant="secondary" className="text-xs">
                        <Check className="h-3 w-3 mr-1" /> Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">@{profileUser.username || profileUser.name?.toLowerCase().replace(/\s+/g, '')}</p>
                </div>
                
                {!isOwnProfile ? (
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      variant={isFollowing ? 'outline' : 'default'}
                      className={cn("relative overflow-hidden group", isFollowing && "border-primary text-primary")}
                      onClick={handleFollow}
                    >
                      <motion.span 
                        className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors"
                        initial={false}
                        animate={{ scale: isFollowing ? 1 : 0 }}
                      />
                      <span className="relative z-10 flex items-center">
                        {isFollowing ? (
                          <>
                            <Check className="h-4 w-4 mr-2" /> Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" /> Follow
                          </>
                        )}
                      </span>
                    </Button>
                    <Button variant="outline" size="icon">
                      <MessageSquare className="h-4 w-4" />
                      <span className="sr-only">Message</span>
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" asChild>
                    <Link href="/profile/edit" className="flex items-center gap-2">
                      <span>Edit Profile</span>
                    </Link>
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{(profileUser.stats?.followers || 0).toLocaleString()}</span>
                  <span className="text-muted-foreground">Followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{profileUser.stats?.following || 0}</span>
                  <span className="text-muted-foreground">Following</span>
                </div>
                {isSeller && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">
                      {profileUser.rating?.toFixed(1) || 'New'}
                      {profileUser.rating && <span className="text-muted-foreground"> ({profileUser.reviewCount || 0})</span>}
                    </span>
                  </div>
                )}
              </div>
              
              {profileUser.bio && (
                <p className="mt-4 text-sm md:text-base">{profileUser.bio}</p>
              )}
              
              {profileUser.website && (
                <a 
                  href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {profileUser.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
           <div className="md:hidden flex items-center justify-around gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="font-bold">{(profileUser.stats?.followers || 0).toLocaleString()}</div>
              <span className="text-xs text-muted-foreground">Followers</span>
            </div>
            <div className="text-center">
              <div className="font-bold">{profileUser.stats?.following || 0}</div>
              <span className="text-xs text-muted-foreground">Following</span>
            </div>
            {isSeller && (
              <div className="text-center">
                <div className="font-bold">
                  {profileUser.rating ? `${profileUser.rating.toFixed(1)} ★` : 'New'}
                </div>
                <span className="text-xs text-muted-foreground">Rating</span>
              </div>
            )}
          </div>
        </CardHeader>
        {/* Featured Products Section for Sellers */}
        {isSeller && featuredProducts.length > 0 && (
          <CardContent className="border-b">
            <div className="mb-2">
              <h3 className="font-semibold text-lg mb-3">Featured Creations</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {featuredProducts.map(product => (
                  <Link key={product.id} href={`/product/${product.id}`} className="group">
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-muted/50">
                      <Image 
                        src={product.imageUrl} 
                        alt={product.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      {product.salePrice && (
                        <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                          Sale
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2">
                      <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">${product.salePrice || product.price}</span>
                        {product.salePrice && (
                          <span className="text-xs text-muted-foreground line-through">${product.price}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        )}
        
        <CardContent className="p-0">
          <Tabs defaultValue="creations" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b px-4">
              {isSeller && (
                <TabsTrigger 
                  value="creations" 
                  className="flex-1 sm:flex-none gap-2 rounded-none px-4 py-6 data-[state=active]:shadow-[0_-2px_0_0_#000000_inset]"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span className="hidden sm:inline">Creations</span>
                  <span className="ml-1 text-xs bg-muted-foreground/10 text-foreground rounded-full px-2 py-0.5">
                    {userProducts.length}
                  </span>
                </TabsTrigger>
              )}
              <TabsTrigger 
                value="liked" 
                className="flex-1 sm:flex-none gap-2 rounded-none px-4 py-6 data-[state=active]:shadow-[0_-2px_0_0_#000000_inset]"
              >
                <Heart className="h-5 w-5" />
                <span className="hidden sm:inline">Liked</span>
                <span className="ml-1 text-xs bg-muted-foreground/10 text-foreground rounded-full px-2 py-0.5">
                  {likedProducts.length}
                </span>
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
                          <Image 
                            src={product.imageUrl} 
                            alt={product.name} 
                            fill 
                            className="object-cover" 
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            data-ai-hint="fashion product" 
                          />
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
                           <Image 
                            src={product.imageUrl} 
                            alt={product.name} 
                            fill 
                            className="object-cover" 
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            data-ai-hint="fashion product" 
                          />
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
      
      {/* Similar Profiles Section */}
      {similarProfiles.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Similar Creators</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {similarProfiles.map(profile => (
              <Link key={profile.uid} href={`/profile/${profile.uid}`} className="group">
                <Card className="overflow-hidden transition-all hover:shadow-md h-full">
                  <div className="relative pt-[100%] bg-muted/30">
                    <Avatar className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 border-4 border-background">
                      <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                      <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {profile.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {profile.stats?.followers?.toLocaleString()} followers
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
