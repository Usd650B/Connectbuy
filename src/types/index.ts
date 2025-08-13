
import type { Timestamp } from "firebase/firestore";

export type UserRole = "buyer" | "seller";

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  displayName?: string; // Alias for name, matches Firebase Auth
  username?: string;
  role: UserRole;
  avatarUrl?: string;
  photoURL?: string; // Alias for avatarUrl, matches Firebase Auth
  coverPhotoUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected'; // Added verification status
  socials?: {
    twitter?: string;
    instagram?: string;
    tiktok?: string;
  };
  stats?: {
    following: number;
    followers: number;
    likes: number;
    products?: number;
    rating?: number;
    reviews?: number;
    reviewCount?: number; // Alias for reviews
  };
  likedProducts?: string[];
  featuredProducts?: string[];
  // For display purposes in the UI
  rating?: number; // Overall rating (0-5)
  reviewCount?: number; // Number of reviews
};

export type Product = {
  id: string;
  creator: {
    uid: string;
    name: string;
    avatarUrl: string;
  };
  imageUrl: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number; // Optional sale price
  originalPrice?: number; // Original price before sale
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  likes?: string[];
  likeCount?: number;
  // Additional product metadata
  category?: string;
  tags?: string[];
  inStock?: boolean;
  stockCount?: number;
  // For display purposes
  isOnSale?: boolean; // Derived from salePrice < price
};

export type CartItem = Product & {
  quantity: number;
};
