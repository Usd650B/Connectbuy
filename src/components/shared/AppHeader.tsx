"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingCart, Feather, User, ArrowLeft, LogOut, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { CartSheet } from "@/components/cart/CartSheet";
import { useState } from "react";
import { SearchDialog } from "./SearchDialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function AppHeader() {
  const { itemCount } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const showBackButton = pathname !== "/";

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
          <div className="hidden md:flex items-center gap-4 text-sm font-medium font-headline">
             <Link href="/" className={cn("text-foreground/80 hover:text-foreground transition-colors", pathname === '/' && "text-primary font-bold")}>Home</Link>
             {user && user.role === 'seller' && (
                <Link href="/creator-studio" className={cn("text-foreground/80 hover:text-foreground transition-colors", pathname === '/creator-studio' && "text-primary font-bold")}>My Shop</Link>
             )}
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="hidden md:flex"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden md:flex"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs bg-primary text-primary-foreground"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>
            
            <div className="hidden md:flex items-center gap-4 text-sm font-medium font-headline">
               {!loading && (
                 <>
                  {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <User className="h-5 w-5" />
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
                            <Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link>
                          </DropdownMenuItem>
                           {user.role === 'seller' && (
                            <DropdownMenuItem asChild>
                               <Link href="/creator-studio"><PlusCircle className="mr-2 h-4 w-4" />Add Product</Link>
                            </DropdownMenuItem>
                           )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  ) : (
                    <Link href="/login" className="text-foreground/80 hover:text-foreground transition-colors">Login</Link>
                  )}
                 </>
               )}
            </div>
          </div>
        </div>
      </header>
      <CartSheet open={isCartOpen} onOpenChange={setCartOpen} />
      <SearchDialog open={isSearchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
