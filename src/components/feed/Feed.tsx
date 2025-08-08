import type { Product } from "@/types";
import { ProductPost } from "./ProductPost";

interface FeedProps {
  products: Product[];
}

export function Feed({ products }: FeedProps) {
  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-y-auto snap-y snap-mandatory">
      {products.map((product) => (
        <div key={product.id} className="h-full w-full snap-start flex-shrink-0">
          <ProductPost product={product} />
        </div>
      ))}
    </div>
  );
}
