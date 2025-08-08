import { Feed } from "@/components/feed/Feed";
import { mockProducts } from "@/lib/mock-data";

export default function Home() {
  return <Feed products={mockProducts} />;
}
