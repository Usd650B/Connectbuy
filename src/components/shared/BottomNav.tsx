"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, ShoppingCart, PlusCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { SearchDialog } from './SearchDialog';
import { CartSheet } from '../cart/CartSheet';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';


export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);
  
  const navItems = [
    { href: '/', icon: Home, label: 'Home', id: 'home' },
    { href: '/search', icon: Search, label: 'Search', isAction: true, id: 'search' },
    { href: '/creator-studio', icon: PlusCircle, label: 'Add', isAction: true, id: 'add' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart', isAction: true, id: 'cart' },
  ];

  const handleNavClick = (e: React.MouseEvent, href: string, id?: string) => {
    if (id === 'search') {
      e.preventDefault();
      setSearchOpen(true);
    } else if (id === 'cart') {
      e.preventDefault();
      setCartOpen(true);
    } else if (id === 'add') {
      e.preventDefault();
      if (user?.role === 'seller') {
        router.push(href);
      } else {
        toast({
          title: "Sellers only",
          description: "You must be a seller to add products.",
          duration: 3000,
        })
      }
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
        <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
          {navItems.map(({ href, icon: Icon, label, isAction, id }, index) => {
            const isActive = pathname === href && !isAction;
            
            const linkContent = (
              <div
                className={cn(
                  "inline-flex flex-col items-center justify-center px-5 w-full h-full group",
                  isActive ? "text-primary" : "text-muted-foreground",
                  id === 'add' && "text-foreground", // Special color for add button
                )}
              >
                <div className={cn(
                  "relative p-3 rounded-full transition-colors",
                  id === 'add' && "-mt-6 bg-primary text-primary-foreground shadow-lg",
                  isActive && id !== 'add' && "bg-primary/10",
                )}>
                  <Icon className="w-6 h-6" />
                  {label === 'Cart' && itemCount > 0 && (
                      <Badge variant="default" className="absolute -top-1 -right-2 h-5 w-5 justify-center rounded-full p-0 text-xs bg-primary text-primary-foreground">{itemCount}</Badge>
                  )}
                </div>
                <span className={cn(
                  "text-xs",
                  isActive ? "text-primary" : "group-hover:text-foreground",
                  id === 'add' && "sr-only" // Hide label for add button
                )}>
                  {label}
                </span>
              </div>
            );
            
            return (
              <Link
                key={id}
                href={href}
                onClick={(e:any) => handleNavClick(e, href, id)}
                className="flex items-center justify-center"
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
