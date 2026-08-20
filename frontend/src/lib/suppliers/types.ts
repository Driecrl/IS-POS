export interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface CreateSupplierPayload {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierPayload {
  name?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
}