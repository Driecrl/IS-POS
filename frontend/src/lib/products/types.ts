export interface Category {
  id: string;
  name: string;
}

export interface StockLevel {
  quantity: number;
  lowStockThreshold: number;
  highStockThreshold: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  price: string;
  status: string;
  category: Category;
  stockLevel: StockLevel;
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  price: number;
  categoryId: string;
  supplierId?: string;
}

export interface UpdateProductPayload {
  name?: string;
  sku?: string;
  price?: number;
  categoryId?: string;
  supplierId?: string;
  status?: string;
}