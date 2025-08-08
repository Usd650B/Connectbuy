"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Feather, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

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
        </div>
      </header>
    </>
  );
}
