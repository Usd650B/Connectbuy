import type { Product } from "@/types";

export const mockProducts: Product[] = [
  {
    id: "1",
    creator: {
      name: "ChicBoutique",
      avatarUrl: "https://placehold.co/40x40.png",
    },
    imageUrl: "https://placehold.co/500x700.png",
    name: "Elegant Summer Dress",
    description: "A light and airy dress perfect for warm summer days. Made from 100% organic cotton.",
    price: 79.99,
  },
  {
    id: "2",
    creator: {
      name: "Modernista Shoes",
      avatarUrl: "https://placehold.co/40x40.png",
    },
    imageUrl: "https://placehold.co/500x700.png",
    name: "Sleek Leather Heels",
    description: "Handcrafted leather heels that combine comfort and style, perfect for any occasion.",
    price: 129.99,
  },
  {
    id: "3",
    creator: {
      name: "VogueVibes",
      avatarUrl: "https://placehold.co/40x40.png",
    },
    imageUrl: "https://placehold.co/500x700.png",
    name: "Vintage Denim Jacket",
    description: "A timeless denim jacket with a unique vintage wash and custom embroidery.",
    price: 89.50,
  },
  {
    id: "4",
    creator: {
      name: "Glamour Gaze",
      avatarUrl: "https://placehold.co/40x40.png",
    },
    imageUrl: "https://placehold.co/500x700.png",
    name: "Designer Sunglasses",
    description: "Protect your eyes in style with these UV400 protected designer sunglasses.",
    price: 250.00,
  },
  {
    id: "5",
    creator: {
      name: "UrbanTote Co.",
      avatarUrl: "https://placehold.co/40x40.png",
    },
    imageUrl: "https://placehold.co/500x700.png",
    name: "Canvas Tote Bag",
    description: "A spacious and durable canvas tote bag for your everyday needs.",
    price: 45.00,
  },
];
