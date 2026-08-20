"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "#lib/auth";
import { getProducts } from "#lib/products";
import type { Product } from "#lib/products/types";
import { createOrder } from "#lib/orders";
import type { Order } from "#lib/orders/types";
import { completePayment } from "#lib/payments";
import type { Transaction } from "#lib/payments/types";
import Navbar from "#components/navbar";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function POSPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [cashierName, setCashierName] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState("");
  const [step, setStep] = useState<"cart" | "payment" | "done">("cart");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "GCASH" | "MAYA">("CASH");
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    setToken(session.token);
    setCashierName(session.user.name);
    loadProducts(session.token);
  }, []);

  async function loadProducts(authToken: string) {
    try {
      const data = await getProducts(authToken);
      setProducts(data.filter((p) => p.status === "ACTIVE"));
    } catch (err: any) {
      setError(err.message);
    }
  }

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: Number(product.price), quantity: 1 }];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }
    setCart((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)));
  }

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Number(discount) || 0;
  const cartTotal = Math.max(cartSubtotal - discountAmount, 0);

  async function handleCreateOrder() {
    if (!token || cart.length === 0) return;
    if (discountAmount > cartSubtotal) {
      setError("Discount cannot be greater than the subtotal");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const order = await createOrder(
        {
          items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          discount: discountAmount,
        },
        token
      );
      setCurrentOrder(order);
      setStep("payment");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCompletePayment() {
    if (!token || !currentOrder) return;
    const paid = Number(amountPaid);
    if (!paid || paid < Number(currentOrder.total)) {
      setError("Amount paid must be at least the order total");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const txn = await completePayment(
        { orderId: currentOrder.id, amountPaid: paid, paymentMethod },
        token
      );
      setTransaction(txn);
      setStep("done");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleNewSale() {
    setCart([]);
    setDiscount("");
    setCurrentOrder(null);
    setAmountPaid("");
    setPaymentMethod("CASH");
    setTransaction(null);
    setStep("cart");
    setError("");
    if (token) loadProducts(token);
  }

  function handlePrint() {
    window.print();
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      <Navbar activePath="/pos" />
      <main className="flex-1 bg-surface p-8">
        <h1 className="mb-6 text-2xl font-bold text-text-primary print:hidden">Point of Sale</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-danger-bg p-3 text-danger-text print:hidden">{error}</div>
        )}

        {step === "cart" && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mb-4 w-full rounded-lg border border-surface-border bg-surface-card px-4 py-2.5 text-text-primary focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <div className="grid grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="rounded-xl border border-surface-border bg-surface-card p-5 text-left shadow-sm transition hover:border-brand-300 hover:shadow-md active:scale-[0.98]"
                  >
                    <p className="font-semibold text-text-primary">{product.name}</p>
                    <p className="text-sm text-text-muted">{product.sku}</p>
                    <p className="mt-2 text-lg font-bold text-brand-700">₱{Number(product.price).toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-text-primary">Cart</h2>
              {cart.length === 0 ? (
                <p className="text-text-muted">No items yet</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between border-b border-surface-border pb-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{item.name}</p>
                        <p className="text-xs text-text-muted">₱{item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="h-7 w-7 rounded-lg bg-surface text-text-secondary hover:bg-surface-border"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-medium text-text-primary">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="h-7 w-7 rounded-lg bg-surface text-text-secondary hover:bg-surface-border"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 border-t border-surface-border pt-3">
                <p className="flex justify-between text-sm text-text-secondary">
                  <span>Subtotal</span>
                  <span>₱{cartSubtotal.toFixed(2)}</span>
                </p>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <label className="text-sm text-text-secondary">Discount (₱)</label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0.00"
                    className="w-24 rounded-lg border border-surface-border px-2 py-1 text-right text-sm text-text-primary focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <p className="mt-3 flex justify-between text-2xl font-bold text-text-primary">
                  <span>Total</span>
                  <span>₱{cartTotal.toFixed(2)}</span>
                </p>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={busy || cart.length === 0}
                className="mt-4 w-full rounded-lg bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                {busy ? "Creating Order..." : "Create Order"}
              </button>
            </div>
          </div>
        )}

        {step === "payment" && currentOrder && (
          <div className="mx-auto max-w-md rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-text-primary">Payment</h2>
            {Number(currentOrder.discount) > 0 && (
              <p className="mb-1 flex justify-between text-sm text-text-secondary">
                <span>Discount Applied</span>
                <span>-₱{Number(currentOrder.discount).toFixed(2)}</span>
              </p>
            )}
            <p className="mb-4 flex justify-between text-2xl font-bold text-text-primary">
              <span>Order Total</span>
              <span>₱{Number(currentOrder.total).toFixed(2)}</span>
            </p>

            <label className="mb-1 block text-sm font-medium text-text-secondary">Amount Tendered</label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="mb-4 w-full rounded-lg border border-surface-border px-4 py-2.5 text-text-primary focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />

            <label className="mb-1 block text-sm font-medium text-text-secondary">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="mb-4 w-full rounded-lg border border-surface-border px-4 py-2.5 text-text-primary focus:border-brand-500 focus:outline-none"
            >
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="GCASH">GCash</option>
              <option value="MAYA">Maya</option>
            </select>

            <button
              onClick={handleCompletePayment}
              disabled={busy}
              className="w-full rounded-lg bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {busy ? "Processing..." : "Complete Payment"}
            </button>
          </div>
        )}

        {step === "done" && transaction && currentOrder && (
          <div className="mx-auto max-w-md">
            <div id="receipt" className="rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm print:border-0 print:shadow-none">
              <div className="mb-4 text-center">
                <h2 className="text-xl font-bold text-text-primary">Inventory POS</h2>
                <p className="text-sm text-text-muted">Official Receipt</p>
              </div>

              <div className="mb-3 border-b border-surface-border pb-3 text-sm text-text-secondary">
                <p className="flex justify-between"><span>Order ID</span><span className="font-mono">{currentOrder.id.slice(0, 8)}</span></p>
                <p className="flex justify-between"><span>Cashier</span><span>{cashierName}</span></p>
                <p className="flex justify-between"><span>Date</span><span>{new Date(transaction.createdAt).toLocaleString()}</span></p>
              </div>

              <div className="mb-3 border-b border-surface-border pb-3">
                <p className="mb-2 text-sm font-medium text-text-secondary">Items</p>
                <ul className="space-y-1 text-sm text-text-primary">
                  {currentOrder.orderItems.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.product?.name || "Item"} × {item.quantity}</span>
                      <span>₱{(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1 text-sm">
                {Number(currentOrder.discount) > 0 && (
                  <p className="flex justify-between text-text-secondary">
                    <span>Discount</span>
                    <span>-₱{Number(currentOrder.discount).toFixed(2)}</span>
                  </p>
                )}
                <p className="flex justify-between text-lg font-bold text-text-primary">
                  <span>Total</span>
                  <span>₱{Number(currentOrder.total).toFixed(2)}</span>
                </p>
                <p className="flex justify-between text-text-primary">
                  <span>Amount Paid ({transaction.paymentMethod})</span>
                  <span>₱{Number(transaction.amountPaid).toFixed(2)}</span>
                </p>
                <p className="flex justify-between font-bold text-success-text">
                  <span>Change</span>
                  <span>₱{Number(transaction.change).toFixed(2)}</span>
                </p>
              </div>

              <p className="mt-4 text-center text-xs text-text-muted">Thank you for your purchase!</p>
            </div>

            <div className="mt-4 flex gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 rounded-lg bg-text-secondary py-3 font-semibold text-white transition hover:bg-text-primary"
              >
                Print Receipt
              </button>
              <button
                onClick={handleNewSale}
                className="flex-1 rounded-lg bg-brand-600 py-3 font-semibold text-white transition hover:bg-brand-700"
              >
                New Sale
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}