
"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share2, ShoppingCart, Volume2, VolumeX, Play, Pause, Reply } from "lucide-react";
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
  product: Product & {
    videoUrl?: string;
    mediaType?: 'image' | 'video';
  };
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
  const [showThankYou, setShowThankYou] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isCommentsOpen, setCommentsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wasPlayingRef = useRef(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

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
        setLikeCount(data?.likeCount || 0);
        setLiked(data?.likes?.includes(user?.uid || '') || false);
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
    
    // Show thank you message only when liking (not unliking)
    if (!liked) {
      setShowThankYou(true);
      // Hide the thank you message after 2 seconds
      setTimeout(() => setShowThankYou(false), 2000);
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
        toast({variant: "destructive", title: "Error", description: "Could not update like."});
        setShowThankYou(false); // Hide the thank you message if there was an error
    }
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        // On mobile, we need to handle autoplay restrictions
        if (videoRef.current.paused) {
          // If muted, we can try to autoplay
          if (isMuted) {
            videoRef.current.muted = true;
            await videoRef.current.play();
          } else {
            // If not muted, we need user interaction to play with sound
            const playPromise = videoRef.current.play();
            
            if (playPromise !== undefined) {
              playPromise.catch(() => {
                // If play was rejected, try muting and playing
                videoRef.current!.muted = true;
                setIsMuted(true);
                videoRef.current!.play();
              });
            }
          }
        }
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
      setHasError(true);
    }
  };

  const toggleMute = async () => {
    if (!videoRef.current) return;
    
    const newMutedState = !isMuted;
    videoRef.current.muted = newMutedState;
    
    // If we're unmuting, we need to handle autoplay restrictions
    if (newMutedState === false && isPlaying) {
      try {
        await videoRef.current.play();
      } catch (error) {
        console.error('Error playing after unmute:', error);
        // If unmute fails, keep it muted
        videoRef.current.muted = true;
        return;
      }
    }
    
    setIsMuted(newMutedState);
  };

  const handleVideoClick = () => {
    // Only toggle play/pause if not loading and no error
    if (!isLoading && !hasError) {
      togglePlayPause();
    }
  };

  // Handle video ended event
  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  // Handle video playing event
  const handleVideoPlaying = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Handle video error
  const handleVideoError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
      }
    };
  }, []);

  const handleShare = () => {
    const url = `${window.location.origin}/product/${product.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "Product link copied to clipboard.",
      duration: 3000,
    });
  };

  const handleReply = (commentId: string, userName: string) => {
    setReplyingTo(commentId);
    setReplyText(`@${userName} `);
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!user || !replyText.trim()) return;

    try {
      await addDoc(collection(db, `products/${product.id}/comments`), {
        user: {
          uid: user.uid,
          name: user.name,
          avatarUrl: user.avatarUrl
        },
        text: replyText,
        parentId: parentId,
        createdAt: serverTimestamp()
      });
      setReplyText("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error adding reply: ", error);
      toast({ variant: "destructive", title: "Error", description: "Could not post your reply." });
    }
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
      {product.mediaType === 'video' ? (
        <div className="relative h-full w-full bg-black">
          <div className="relative h-full w-full">
            <video
              ref={videoRef}
              src={product.videoUrl}
              className="h-full w-full object-cover"
              loop
              muted={isMuted}
              onClick={handleVideoClick}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={handleVideoEnded}
              onPlaying={handleVideoPlaying}
              onError={handleVideoError}
              playsInline
              preload="metadata"
              disablePictureInPicture
            />
            
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
            
            {/* Error overlay */}
            {hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-4 text-center">
                <p className="text-lg font-medium mb-2">Couldn't load video</p>
                <Button 
                  variant="outline" 
                  className="text-white border-white hover:bg-white/10"
                  onClick={() => {
                    setHasError(false);
                    setIsLoading(true);
                    if (videoRef.current) {
                      videoRef.current.load();
                    }
                  }}
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
          {!hasError && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-6 w-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  </div>
                ) : isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                disabled={isLoading}
              >
                {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </button>
            </div>
          )}
        </div>
      ) : (
        <Image
          src={product.imageUrl}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className="z-0"
          priority
          data-ai-hint="fashion product"
        />
      )}
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
            <div className="relative flex flex-col items-center gap-1">
              <ActionButton
                icon={Heart}
                label={likeCount.toLocaleString()}
                isActive={liked}
                onClick={handleLike}
              />
              <div 
                className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap 
                  transition-all duration-300 ease-in-out transform
                  ${showThankYou ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-2 pointer-events-none'}
                  shadow-lg shadow-pink-500/20`}
              >
                <div className="relative">
                  THANK YOU
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-pink-500 transform rotate-45"></div>
                </div>
              </div>
            </div>
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
                        {comments.map((comment) => (
                          <div key={comment.id} className="space-y-2">
                            <div className="flex gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} />
                                <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="bg-muted rounded-lg p-2 flex-1">
                                <p className="font-medium text-sm">{comment.user.name}</p>
                                <p className="text-sm">{comment.text}</p>
                                <button 
                                  onClick={() => handleReply(comment.id, comment.user.name)}
                                  className="text-xs text-muted-foreground mt-1 flex items-center gap-1"
                                >
                                  <Reply className="h-3 w-3" /> Reply
                                </button>
                              </div>
                            </div>
                            

                            {/* Reply form */}
                            {replyingTo === comment.id && (
                              <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="ml-10 flex gap-2">
                                <Input
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Write a reply..."
                                  className="flex-1"
                                />
                                <Button type="submit" size="sm">Reply</Button>
                              </form>
                            )}
                            

                            {/* Replies */}
                            {comments
                              .filter(reply => (reply as any).parentId === comment.id)
                              .map(reply => (
                                <div key={reply.id} className="ml-10 mt-2 flex gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={reply.user.avatarUrl} alt={reply.user.name} />
                                    <AvatarFallback>{reply.user.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="bg-muted/50 rounded-lg p-2 flex-1">
                                    <p className="font-medium text-xs">{reply.user.name}</p>
                                    <p className="text-xs">{reply.text}</p>
                                  </div>
                                </div>
                              ))}
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
