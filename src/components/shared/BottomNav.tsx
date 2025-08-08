"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, ShoppingCart, User, PlusCircle, LogOut } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { SearchDialog } from './SearchDialog';
import { CartSheet } from '../cart/CartSheet';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '../ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';


export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { user, loading } = useAuth();
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const getNavItems = () => {
    const baseItems = [
      { href: '/', icon: Home, label: 'Home', id: 'home' },
      { href: '/search', icon: Search, label: 'Search', isAction: true, id: 'search' },
    ];

    const sellerItems = user && user.role === 'seller' 
      ? [{ href: '/creator-studio', icon: PlusCircle, label: 'Add', id: 'add' }] 
      : [];

    const finalItems = [
      ...sellerItems,
      { href: '/cart', icon: ShoppingCart, label: 'Cart', isAction: true, id: 'cart' },
      { href: '/profile', icon: User, label: 'Profile', id: 'profile' }
    ];
    
    return [...baseItems.slice(0, 2), ...sellerItems, ...baseItems.slice(2), ...finalItems];
  };
  
  const navItems = getNavItems().filter(Boolean);


  const handleNavClick = (e: React.MouseEvent, href: string, id?: string) => {
    if (id === 'search') {
      e.preventDefault();
      setSearchOpen(true);
    } else if (id === 'cart') {
      e.preventDefault();
      setCartOpen(true);
    } else if (id === 'add') {
      e.preventDefault();
      router.push(href);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
        <div className={`grid h-full max-w-lg mx-auto font-medium grid-cols-${navItems.length}`}>
          {navItems.map(({ href, icon: Icon, label, isAction, id }) => {
            const isActive = pathname === href && !isAction;
            
            const linkContent = (
               <div className={cn(
                  "inline-flex flex-col items-center justify-center px-5 group h-full w-full",
                   isActive ? "text-primary" : "text-muted-foreground",
                   isAction && "text-muted-foreground"
                )}>
                  <div className="relative">
                    <Icon className="w-5 h-5 mb-1" />
                    {label === 'Cart' && itemCount > 0 && (
                        <Badge variant="default" className="absolute -top-2 -right-3 h-5 w-5 justify-center rounded-full p-0 text-xs bg-primary text-primary-foreground">{itemCount}</Badge>
                    )}
                  </div>
                  <span className={cn("text-sm", isActive ? "text-primary" : "group-hover:text-foreground")}>{label}</span>
              </div>
            );

            if (id === 'profile') {
               if(loading) return <div key="profile-loader" className="flex items-center justify-center"><User className="w-5 h-5 mb-1 text-muted-foreground" /></div>;
               if(!user) return (
                 <Link key="profile-login" href="/login" className="flex-1">
                    {linkContent}
                 </Link>
               );
               
               return (
                <DropdownMenu key="profile-dropdown">
                  <DropdownMenuTrigger asChild>
                    <button className="flex-1 h-full">
                       {linkContent}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mb-2" align="end" side="top" forceMount>
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
               )
            }
            
            return (
              <Link
                key={id}
                href={href}
                onClick={(e:any) => handleNavClick(e, href, id)}
                className="flex-1"
                >
                  {linkContent}
              </Link>
            );
          })}
        </div>
      </div>
      <SearchDialog open={isSearchOpen} onOpenChange={setSearchOpen} />
      <CartSheet open={isCartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
