"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  productName: string;
  basePrice: string;
  unitPrice: string;
  productPrice: string; // for backward compatibility
  productImage: string | null;
  stock: number;
  minOrderQuantity?: number;
  packageUnit?: string;
  piecesPerPackage?: number;
  tier1Min?: number | null;
  tier1Price?: string | null;
  tier2Min?: number | null;
  tier2Price?: string | null;
  tierApplied?: "base" | "tier1" | "tier2";
}

export interface ProductDetails {
  id: number;
  nameAr: string;
  price: string;
  image: string | null;
  stock: number;
  minOrderQuantity?: number;
  packageUnit?: string;
  piecesPerPackage?: number;
  tier1Min?: number | null;
  tier1Price?: string | null;
  tier2Min?: number | null;
  tier2Price?: string | null;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
  addToCart: (productId: number, quantity?: number, productDetails?: ProductDetails) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

function calculateItemUnitPrice(
  quantity: number,
  basePrice: string,
  tier1Min?: number | null,
  tier1Price?: string | null,
  tier2Min?: number | null,
  tier2Price?: string | null
): { unitPrice: number; tierApplied: "base" | "tier1" | "tier2" } {
  if (tier2Min && tier2Price && quantity >= tier2Min) {
    return { unitPrice: parseFloat(tier2Price), tierApplied: "tier2" };
  }
  if (tier1Min && tier1Price && quantity >= tier1Min) {
    return { unitPrice: parseFloat(tier1Price), tierApplied: "tier1" };
  }
  return { unitPrice: parseFloat(basePrice), tierApplied: "base" };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Helper to recompute guest items totals
  const recomputeGuestItems = (rawItems: CartItem[]): { processed: CartItem[]; sum: number } => {
    const processed = rawItems.map((item) => {
      const { unitPrice, tierApplied } = calculateItemUnitPrice(
        item.quantity,
        item.basePrice || item.productPrice,
        item.tier1Min,
        item.tier1Price,
        item.tier2Min,
        item.tier2Price
      );
      return {
        ...item,
        unitPrice: unitPrice.toFixed(2),
        productPrice: unitPrice.toFixed(2),
        tierApplied,
      };
    });
    const sum = processed.reduce(
      (acc, cur) => acc + parseFloat(cur.unitPrice) * cur.quantity,
      0
    );
    return { processed, sum };
  };

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      if (user) {
        // Check if there was a guest cart to merge
        if (typeof window !== "undefined") {
          const guestRaw = localStorage.getItem("guest_cart");
          if (guestRaw) {
            try {
              const parsed: CartItem[] = JSON.parse(guestRaw);
              if (parsed.length > 0) {
                await fetch("/api/cart", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    items: parsed.map((p) => ({
                      productId: p.productId,
                      quantity: p.quantity,
                    })),
                  }),
                });
              }
            } catch (err) {
              console.error("Failed merging guest cart:", err);
            } finally {
              localStorage.removeItem("guest_cart");
            }
          }
        }

        const res = await fetch("/api/cart");
        const data = await res.json();
        const serverItems = (data.items || []).map((it: CartItem) => ({
          ...it,
          productPrice: it.unitPrice || it.basePrice || it.productPrice,
        }));
        setItems(serverItems);
        setTotal(data.total || 0);
      } else {
        // Guest user from localStorage
        if (typeof window !== "undefined") {
          const guestRaw = localStorage.getItem("guest_cart");
          if (guestRaw) {
            const parsed: CartItem[] = JSON.parse(guestRaw);
            const { processed, sum } = recomputeGuestItems(parsed);
            setItems(processed);
            setTotal(sum);
          } else {
            setItems([]);
            setTotal(0);
          }
        }
      }
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (
    productId: number,
    quantity = 1,
    productDetails?: ProductDetails
  ) => {
    if (user) {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      await refreshCart();
    } else {
      // Handle Guest Cart
      let details = productDetails;
      if (!details) {
        try {
          const res = await fetch(`/api/products/${productId}`);
          const data = await res.json();
          details = data.product;
        } catch (e) {
          console.error("Error fetching product details for guest cart:", e);
        }
      }

      const guestRaw = typeof window !== "undefined" ? localStorage.getItem("guest_cart") : null;
      let current: CartItem[] = guestRaw ? JSON.parse(guestRaw) : [];

      const existingIdx = current.findIndex((i) => i.productId === productId);
      if (existingIdx > -1) {
        current[existingIdx].quantity += quantity;
      } else if (details) {
        const newItem: CartItem = {
          id: Date.now(),
          productId,
          quantity,
          productName: details.nameAr,
          basePrice: details.price,
          unitPrice: details.price,
          productPrice: details.price,
          productImage: details.image,
          stock: details.stock,
          minOrderQuantity: details.minOrderQuantity,
          packageUnit: details.packageUnit,
          piecesPerPackage: details.piecesPerPackage,
          tier1Min: details.tier1Min,
          tier1Price: details.tier1Price,
          tier2Min: details.tier2Min,
          tier2Price: details.tier2Price,
        };
        current.push(newItem);
      }

      const { processed, sum } = recomputeGuestItems(current);
      if (typeof window !== "undefined") {
        localStorage.setItem("guest_cart", JSON.stringify(processed));
      }
      setItems(processed);
      setTotal(sum);
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    if (user) {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity }),
      });
      await refreshCart();
    } else {
      let current = [...items];
      if (quantity <= 0) {
        current = current.filter((i) => i.id !== id);
      } else {
        current = current.map((i) => (i.id === id ? { ...i, quantity } : i));
      }
      const { processed, sum } = recomputeGuestItems(current);
      if (typeof window !== "undefined") {
        localStorage.setItem("guest_cart", JSON.stringify(processed));
      }
      setItems(processed);
      setTotal(sum);
    }
  };

  const removeItem = async (id: number) => {
    if (user) {
      await fetch(`/api/cart?id=${id}`, { method: "DELETE" });
      await refreshCart();
    } else {
      const filtered = items.filter((i) => i.id !== id);
      const { processed, sum } = recomputeGuestItems(filtered);
      if (typeof window !== "undefined") {
        localStorage.setItem("guest_cart", JSON.stringify(processed));
      }
      setItems(processed);
      setTotal(sum);
    }
  };

  const clearCart = async () => {
    if (user) {
      await fetch("/api/cart", { method: "DELETE" });
      await refreshCart();
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem("guest_cart");
      }
      setItems([]);
      setTotal(0);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
