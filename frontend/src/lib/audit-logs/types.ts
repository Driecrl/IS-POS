export interface AuditLog {
  id: string;
  userId: string | null;
  username: string | null;
  userRole: string | null;
  module: string;
  action: string;
  description: string;
  status: string;
  createdAt: string;
}