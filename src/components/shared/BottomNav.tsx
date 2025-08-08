
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, ShoppingCart, PlusCircle, User } from 'lucide-react';
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
      } else if (user) {
        toast({
          title: "Sellers only",
          description: "You must be a seller to add products.",
          duration: 3000,
        })
      } else {
         toast({
          title: "Login required",
          description: "Please login to add products.",
          duration: 3000,
        })
      }
    }
  };

  const mainNavItems = navItems.filter(item => item.id !== 'add');
  const addNavItem = navItems.find(item => item.id === 'add');

  return (
    <>
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
        <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
          {mainNavItems.map(({ href, icon: Icon, label, isAction, id }) => {
            const isActive = pathname === href && !isAction;
            
            return (
              <Link
                key={id}
                href={href}
                onClick={(e:any) => handleNavClick(e, href, id)}
                className="flex items-center justify-center"
              >
                <div
                  className={cn(
                    "inline-flex flex-col items-center justify-center px-5 w-full h-full group",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <div className={cn(
                    "relative p-2 rounded-full transition-colors",
                     isActive && "bg-primary/10",
                  )}>
                    <Icon className="w-6 h-6" />
                    {label === 'Cart' && itemCount > 0 && (
                        <Badge variant="default" className="absolute -top-1 -right-2 h-5 w-5 justify-center rounded-full p-0 text-xs bg-primary text-primary-foreground">{itemCount}</Badge>
                    )}
                  </div>
                  <span className={cn(
                    "text-xs",
                    isActive ? "text-primary" : "group-hover:text-foreground",
                  )}>
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      {addNavItem && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
           <Link
              href={addNavItem.href}
              onClick={(e:any) => handleNavClick(e, addNavItem.href, addNavItem.id)}
            >
              <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-colors">
                <PlusCircle className="w-7 h-7" />
              </div>
          </Link>
        </div>
      )}

      <SearchDialog open={isSearchOpen} onOpenChange={setSearchOpen} />
      <CartSheet open={isCartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
