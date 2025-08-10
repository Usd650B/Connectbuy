
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, ShoppingCart } from "lucide-react";
import type { Product, UserProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ProductPostProps {
  product: Product;
}

interface Comment {
    id: string;
    user: {
        uid: string;
        name: string;
        avatarUrl: string;
    };
    text: string;
    createdAt: any;
}


export function ProductPost({ product }: ProductPostProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(product.likeCount || 0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isCommentsOpen, setCommentsOpen] = useState(false);

  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setLiked(product.likes?.includes(user.uid) || false);
    }
  }, [user, product.likes]);
  
  useEffect(() => {
    const productRef = doc(db, "products", product.id);
    const unsub = onSnapshot(productRef, (doc) => {
        const data = doc.data();
        setLikeCount(data()?.likeCount || 0);
        setLiked(data()?.likes?.includes(user?.uid || '') || false);
    });
    return () => unsub();
  }, [product.id, user?.uid]);

  useEffect(() => {
    const commentsQuery = query(collection(db, `products/${product.id}/comments`), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
        setComments(fetchedComments);
    });
    return () => unsubscribe();
  }, [product.id]);


  const handleLike = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Login Required", description: "You need to be logged in to like a post." });
      return;
    }
    const productRef = doc(db, "products", product.id);
    const userDocRef = doc(db, "users", product.creator.uid);
    
    try {
        if (liked) {
            await updateDoc(productRef, {
                likes: arrayRemove(user.uid),
                likeCount: Math.max(0, likeCount - 1)
            });
            // Decrement creator's total likes
             const userDoc = await getDoc(userDocRef);
             if(userDoc.exists()){
                const currentLikes = userDoc.data().stats.likes || 0;
                await updateDoc(userDocRef, { "stats.likes": Math.max(0, currentLikes - 1) });
             }

        } else {
            await updateDoc(productRef, {
                likes: arrayUnion(user.uid),
                likeCount: likeCount + 1
            });
            // Increment creator's total likes
            const userDoc = await getDoc(userDocRef);
            if(userDoc.exists()){
                const currentLikes = userDoc.data().stats.likes || 0;
                await updateDoc(userDocRef, { "stats.likes": currentLikes + 1 });
             }
        }
    } catch(error) {
        console.error("Error updating like: ", error);
        toast({variant: "destructive", title: "Error", description: "Could not update like."})
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/product/${product.id}`; // Assuming a product page exists
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "Product link copied to clipboard.",
      duration: 3000,
    });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
        await addDoc(collection(db, `products/${product.id}/comments`), {
            user: {
                uid: user.uid,
                name: user.name,
                avatarUrl: user.avatarUrl
            },
            text: newComment,
            createdAt: serverTimestamp()
        });
        setNewComment("");
    } catch (error) {
        console.error("Error adding comment: ", error);
        toast({ variant: "destructive", title: "Error", description: "Could not post your comment." });
    }
  }


  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to cart!",
      description: <span className="font-body">{product.name} has been added to your cart.</span>,
      duration: 3000,
    });
  };

  const ActionButton = ({
    icon: Icon,
    label,
    onClick,
    isActive = false,
  }: {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
    isActive?: boolean;
  }) => (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "rounded-full h-12 w-12 bg-black/30 hover:bg-black/50 text-white",
          isActive && "text-primary bg-primary/20 hover:bg-primary/30"
        )}
        onClick={onClick}
      >
        <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
      </Button>
      <span className="text-xs font-bold text-white">{label}</span>
    </div>
  );

  return (
    <div className="relative h-full w-full bg-background">
      <Image
        src={product.imageUrl}
        alt={product.name}
        layout="fill"
        objectFit="cover"
        className="z-0"
        priority
        data-ai-hint="fashion product"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10"></div>

      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 text-white">
        <div className="flex items-end justify-between">
          <div className="flex-1 pr-12">
            <Link href={`/profile/${product.creator.uid}`} className="flex items-center gap-2 group">
              <Avatar>
                <AvatarImage src={product.creator.avatarUrl} alt={product.creator.name} />
                <AvatarFallback>{product.creator.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-bold font-headline group-hover:underline">{product.creator.name}</span>
            </Link>
            <h2 className="mt-2 text-2xl font-bold font-headline">{product.name}</h2>
            <p className="mt-1 text-sm font-body opacity-90">{product.description}</p>
            <p className="mt-2 text-xl font-bold font-headline">${product.price.toFixed(2)}</p>
          </div>

          <div className="flex flex-col gap-4">
            <ActionButton
              icon={Heart}
              label={likeCount.toLocaleString()}
              isActive={liked}
              onClick={handleLike}
            />
             <Sheet open={isCommentsOpen} onOpenChange={setCommentsOpen}>
              <SheetTrigger asChild>
                <div>
                   <ActionButton
                      icon={MessageCircle}
                      label={comments.length.toLocaleString()}
                    />
                </div>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] flex flex-col">
                <SheetHeader className="text-center">
                  <SheetTitle className="font-headline">Comments</SheetTitle>
                </SheetHeader>
                <Separator />
                <ScrollArea className="flex-1 px-4 py-2">
                    <div className="space-y-4">
                        {comments.map(comment => (
                             <div key={comment.id} className="flex items-start gap-3">
                                <Link href={`/profile/${comment.user.uid}`}>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={comment.user.avatarUrl} />
                                        <AvatarFallback>{comment.user.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div>
                                    <p className="text-sm font-semibold">{comment.user.name}</p>
                                    <p className="text-sm">{comment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                 <Separator />
                 <div className="p-4">
                    {user ? (
                        <form onSubmit={handleCommentSubmit} className="flex gap-2">
                            <Input 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1"
                            />
                            <Button type="submit" disabled={!newComment.trim()}>Post</Button>
                        </form>
                    ) : (
                        <p className="text-center text-sm text-muted-foreground">You must be logged in to comment.</p>
                    )}
                 </div>
              </SheetContent>
            </Sheet>
            <ActionButton icon={Share2} label="Share" onClick={handleShare} />
            <ActionButton icon={ShoppingCart} label="Buy" onClick={handleAddToCart} />
          </div>
        </div>
      </div>
    </div>
  );
}
