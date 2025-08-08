import { Feed } from "@/components/feed/Feed";
import { mockProducts } from "@/lib/mock-data";

export default function Home() {
  // TODO: Replace with real data
  return <Feed products={mockProducts} />;
}
