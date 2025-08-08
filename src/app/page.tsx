"use client";

import { Feed } from "@/components/feed/Feed";
import { Product } from "@/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, "products");
        const q = query(productsCollection, orderBy("createdAt", "desc"));
        const productSnapshot = await getDocs(q);
        const productsList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="relative h-[calc(100vh-4rem)] w-full flex items-center justify-center">
        <div className="w-full max-w-lg space-y-4 p-4">
           <Skeleton className="h-16 w-1/2" />
           <Skeleton className="h-8 w-3/4" />
           <Skeleton className="h-[50vh] w-full" />
        </div>
      </div>
    )
  }

  return <Feed products={products} />;
}
