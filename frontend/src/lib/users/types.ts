export interface AppUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: string | null;
}

export type RoleName = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "CASHIER";

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  roleName: RoleName;
}