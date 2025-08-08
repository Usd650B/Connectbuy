import type { Timestamp } from "firebase/firestore";

export type UserRole = "buyer" | "seller";

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  stats?: {
    following: number;
    followers: number;
    likes: number;
  };
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
  createdAt: Timestamp;
};

export type CartItem = Product & {
  quantity: number;
};