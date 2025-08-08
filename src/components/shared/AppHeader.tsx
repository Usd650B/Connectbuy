"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Feather, ArrowLeft, User, PlusCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Skeleton } from "../ui/skeleton";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };


  const showBackButton = !['/', '/login', '/signup'].includes(pathname);

  const renderUserMenu = () => {
    if (loading) {
      return <Skeleton className="h-8 w-8 rounded-full" />;
    }

    if (!user) {
      return (
        <Button asChild variant="outline" size="sm">
          <Link href="/login">Login</Link>
        </Button>
      );
    }

    const profileLabel = user.role === 'seller' ? "My Shop" : "Profile";
    
    return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>{profileLabel}</span>
            </Link>
          </DropdownMenuItem>
          {user.role === 'seller' && (
            <DropdownMenuItem asChild>
              <Link href="/creator-studio">
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Add Product</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            {showBackButton ? (
              <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            ) : (
              <Link href="/" className="flex items-center gap-2">
                <Feather className="h-7 w-7 text-primary" />
                <span className="text-xl font-bold font-headline text-primary">
                  ConnectBuy
                </span>
              </Link>
            )}
          </div>
           <div className="flex items-center gap-4">
            {renderUserMenu()}
          </div>
        </div>
      </header>
    </>
  );
}
