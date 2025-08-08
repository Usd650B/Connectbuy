import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockProducts } from "@/lib/mock-data";
import { Settings, Heart, ShoppingBag } from "lucide-react";
import Image from "next/image";

// This is a placeholder for a real user profile
const userProfile = {
  name: "Jane Doe",
  username: "janedoe",
  avatarUrl: "https://placehold.co/128x128.png",
  bio: "Fashion enthusiast & creator. Sharing my favorite finds and creations. ✨",
  stats: {
    following: 120,
    followers: 4500,
    likes: 18000,
  },
};

const userProducts = mockProducts.slice(0, 2);
const likedProducts = mockProducts.slice(2, 4);

export default function ProfilePage() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background">
              <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
              <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-headline">{userProfile.username}</h1>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
              <p className="text-muted-foreground mt-1">{userProfile.name}</p>
              <div className="hidden md:flex items-center gap-6 mt-4">
                <div><span className="font-bold">{userProfile.stats.following}</span> following</div>
                <div><span className="font-bold">{userProfile.stats.followers.toLocaleString()}</span> followers</div>
                <div><span className="font-bold">{userProfile.stats.likes.toLocaleString()}</span> likes</div>
              </div>
              <p className="mt-4 font-body">{userProfile.bio}</p>
            </div>
          </div>
           <div className="flex md:hidden items-center justify-around gap-4 mt-4 border-t pt-4">
                <div className="text-center"><div className="font-bold">{userProfile.stats.following}</div> <span className="text-sm text-muted-foreground">following</span></div>
                <div className="text-center"><div className="font-bold">{userProfile.stats.followers.toLocaleString()}</div> <span className="text-sm text-muted-foreground">followers</span></div>
                <div className="text-center"><div className="font-bold">{userProfile.stats.likes.toLocaleString()}</div> <span className="text-sm text-muted-foreground">likes</span></div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="creations" className="w-full">
            <TabsList className="w-full justify-around rounded-none border-b">
              <TabsTrigger value="creations" className="flex-1 gap-2 rounded-none">
                <ShoppingBag className="h-5 w-5" />
                <span className="hidden sm:inline">My Creations</span>
              </TabsTrigger>
              <TabsTrigger value="liked" className="flex-1 gap-2 rounded-none">
                <Heart className="h-5 w-5" />
                <span className="hidden sm:inline">Liked</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="creations">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 p-1">
                {userProducts.map(product => (
                  <div key={product.id} className="relative aspect-square">
                    <Image src={product.imageUrl} alt={product.name} layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="fashion product" />
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="liked">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 p-1">
                {likedProducts.map(product => (
                  <div key={product.id} className="relative aspect-square">
                    <Image src={product.imageUrl} alt={product.name} layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="fashion product" />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
