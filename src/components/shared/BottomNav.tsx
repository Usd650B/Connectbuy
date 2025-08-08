
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { SearchDialog } from './SearchDialog';
import { CartSheet } from '../cart/CartSheet';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLButtonElement>, href: string) => {
    if (href === '/search') {
      e.preventDefault();
      setSearchOpen(true);
    }
    if (href === '/cart') {
      e.preventDefault();
      setCartOpen(true);
    }
  };

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
        <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = (pathname === href && href !== '/search' && href !== '/cart') || (href === '/' && pathname.startsWith('/#'));
            const isCartOrSearch = href === '/cart' || href === '/search';
            
            const props = isCartOrSearch 
              ? { onClick: (e: React.MouseEvent<HTMLButtonElement>) => handleNavClick(e, href) }
              : { href: href };

            return (
                <Button
                  key={label}
                  variant="ghost"
                  className={cn(
                    "inline-flex flex-col items-center justify-center px-5 hover:bg-muted group h-full rounded-none",
                    isActive && "text-primary"
                  )}
                  asChild={!isCartOrSearch}
                  {...props}
                >
                  <Link href={href}>
                    <div className="relative">
                      <Icon className="w-5 h-5 mb-1" />
                      {href === '/cart' && itemCount > 0 && (
                         <Badge variant="default" className="absolute -top-2 -right-3 h-5 w-5 justify-center rounded-full p-0 text-xs bg-primary text-primary-foreground">{itemCount}</Badge>
                      )}
                    </div>
                    <span className={cn("text-sm", isActive ? "text-primary" : "text-muted-foreground")}>{label}</span>
                  </Link>
                </Button>
            );
          })}
        </div>
      </div>
      <SearchDialog open={isSearchOpen} onOpenChange={setSearchOpen} />
      <CartSheet open={isCartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
