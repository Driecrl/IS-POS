export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string | null;
}

export interface AuthResponse {
  status: string;
  token: string;
  user: AuthUser;
}

export interface Session {
  token: string;
  user: AuthUser;
}