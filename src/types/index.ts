export type Product = {
  id: string;
  creator: {
    name: string;
    avatarUrl: string;
  };
  imageUrl: string;
  name: string;
  description: string;
  price: number;
};

export type CartItem = Product & {
  quantity: number;
};
