export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: string;
  rating: number;
  reviews: number;
  image: string;
  specs: string;
  inStock: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryState: string;
  deliveryAddress: string;
  items: {
    id: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    image?: string;
  }[];
}
