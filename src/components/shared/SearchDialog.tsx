"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Product } from "@/types";
import { collection, getDocs, query, where, or, and } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.trim() === "") {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const q = query(collection(db, 'products'), 
          or(
            where('name', '>=', searchQuery),
            where('name', '<=', searchQuery + '\uf8ff'),
            // Note: Firestore does not support full text search on multiple fields easily.
            // This is a simplified search. For a more robust search, you would use a 
            // dedicated search service like Algolia or Elasticsearch.
          )
        );
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Product))
          .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()));

        setResults(products);
      } catch (error) {
        console.error("Error searching products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const debounceTimer = setTimeout(() => {
        fetchResults();
    }, 300);

    return () => clearTimeout(debounceTimer);

  }, [searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Search Products</DialogTitle>
        </DialogHeader>
        <div className="p-1">
          <Input
            placeholder="Type to search for clothes, shoes, and more..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-base"
          />
        </div>
        <ScrollArea className="h-[60vh] mt-4">
          {loading ? (
            <div className="text-center p-8 text-muted-foreground">Searching...</div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 p-1">
              {results.map((product) => (
                <Link href="/" key={product.id} onClick={() => onOpenChange(false)}>
                  <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={60}
                      height={80}
                      className="rounded-md object-cover"
                      data-ai-hint="product photo"
                    />
                    <div className="flex-1">
                      <p className="font-semibold font-headline">{product.name}</p>
                      <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            searchQuery.trim() !== "" && (
              <div className="text-center p-8 text-muted-foreground">
                No results found for "{searchQuery}"
              </div>
            )
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}