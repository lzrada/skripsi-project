export interface Product {
  id: string;
  name: string;
  category: string;
  condition?: string;
  originalPrice?: number;
  price: number;
  stock: number;
  sold?: number;
  reorderPoint: number;
  description?: string;
  images: string[];
  averageRating?: number;
  totalReviews?: number;
  createdAt?: any;
}

export interface AddProductPayload {
  name: string;
  category: string;
  condition?: string;
  originalPrice?: number;
  price: number;
  stock: number;
  reorderPoint: number;
  description?: string;
  images: string[];
}

export interface UpdateProductPayload {
  name: string;
  category: string;
  condition?: string;
  originalPrice?: number;
  price: number;
  stock: number;
  reorderPoint: number;
  description?: string;
  images: string[];
}

export interface Review {
  id: string;
  productId: string;
  uid: string;
  userName: string;
  userPhoto?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: any;
}
