const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

import type { AppUser, CreateUserPayload } from "./types";

async function request<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data as T;
}

export async function getUsers(token: string): Promise<AppUser[]> {
  const res = await request<{ users: AppUser[] }>("/users", token);
  return res.users;
}

export async function createUser(payload: CreateUserPayload, token: string): Promise<AppUser> {
  const res = await request<{ user: AppUser }>("/users", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.user;
}