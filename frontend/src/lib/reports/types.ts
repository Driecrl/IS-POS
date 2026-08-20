export interface SalesReport {
  totalSales: number;
  totalDiscount: number;
  totalOrders: number;
}

export interface BestSeller {
  productId: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface InventoryMovementReport {
  stockIn: number;
  stockOut: number;
  adjustments: number;
  totalMovements: number;
}