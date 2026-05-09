export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  condition: string;
  stock: number;
  image: string;
  qty: number;
}
