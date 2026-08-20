export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    price: string;
  };
}

export interface Order {
  id: string;
  cashierId: string;
  total: string;
  discount: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  createdAt: string;
  orderItems: OrderItem[];
  cashier?: { id: string; name: string };
}

export interface CreateOrderPayload {
  items: OrderItemInput[];
  discount?: number;
}