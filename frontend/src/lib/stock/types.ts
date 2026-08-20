export interface StockLevelEntry {
  id: string;
  productId: string;
  quantity: number;
  lowStockThreshold: number;
  highStockThreshold: number;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
    category?: { id: string; name: string };
  };
}

export interface StockMovement {
  id: string;
  productId: string;
  userId: string;
  type: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT";
  quantity: number;
  reason: string | null;
  createdAt: string;
  product?: { name: string; sku: string };
}

export interface StockInOutPayload {
  productId: string;
  quantity: number;
  reason?: string;
}

export interface StockAdjustPayload {
  productId: string;
  quantity: number;
  reason: string;
}