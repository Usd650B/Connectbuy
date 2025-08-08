"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, User, PlusCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { SearchDialog } from './SearchDialog';
import { CartSheet } from '../cart/CartSheet';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search', isAction: true },
  ];

  if (user && user.role === 'seller') {
    navItems.push({ href: '/creator-studio', icon: PlusCircle, label: 'Add' });
  }

  navItems.push(
    { href: '/cart', icon: ShoppingCart, label: 'Cart', isAction: true },
    { href: '/profile', icon: User, label: 'Profile' }
  );


  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === '/search') {
      setSearchOpen(true);
    }
    if (href === '/cart') {
      setCartOpen(true);
    }
  };

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
        <div className={`grid h-full max-w-lg mx-auto font-medium grid-cols-${navItems.length}`}>
          {navItems.map(({ href, icon: Icon, label, isAction }) => {
            const isActive = pathname === href && !isAction;
            
            const linkProps: any = {};
            if (!isAction) {
                linkProps.href = href;
            }
            
            return (
              <Link
                key={label}
                {...linkProps}
                onClick={(e) => isAction && handleNavClick(e, href)}
                className={cn(
                  "inline-flex flex-col items-center justify-center px-5 hover:bg-muted group h-full",
                  isActive && "text-primary"
                )}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5 mb-1" />
                    {href === '/cart' && itemCount > 0 && (
                        <Badge variant="default" className="absolute -top-2 -right-3 h-5 w-5 justify-center rounded-full p-0 text-xs bg-primary text-primary-foreground">{itemCount}</Badge>
                    )}
                  </div>
                  <span className={cn("text-sm", isActive ? "text-primary" : "text-muted-foreground")}>{label}</span>
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
