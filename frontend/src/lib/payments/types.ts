export interface Transaction {
  id: string;
  orderId: string;
  amountPaid: string;
  paymentMethod: "CASH" | "CARD" | "GCASH" | "MAYA";
  change: string;
  status: "COMPLETED" | "REFUNDED" | "FAILED";
  createdAt: string;
}

export interface CompletePaymentPayload {
  orderId: string;
  amountPaid: number;
  paymentMethod: "CASH" | "CARD" | "GCASH" | "MAYA";
}