import { apiFetch } from "#lib/api";
import type { Product, CreateProductPayload, UpdateProductPayload, Category } from "./types";

export async function getProducts(): Promise<Product[]> {
  const res = await apiFetch<{ products: Product[] }>("/products");
  return res.products;
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const res = await apiFetch<{ product: Product }>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.product;
}

export async function updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
  const res = await apiFetch<{ product: Product }>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.product;
}

export async function getCategories(): Promise<Category[]> {
  const res = await apiFetch<{ categories: Category[] }>("/categories");
  return res.categories;
}