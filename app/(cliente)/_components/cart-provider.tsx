"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { CartItem, DurationId } from "../_lib/cart-types";

const STORAGE_KEY = "chuloplaya.cart.v1";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  changeQty: (index: number, nextQty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function sameLine(a: CartItem, b: CartItem) {
  return (
    a.productId === b.productId &&
    a.dur === b.dur &&
    (a.dur !== "horas" || a.hours === b.hours)
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hidratar desde localStorage al montar.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setItems(parsed);
        }
      }
    } catch {
      // ignore corrupted state
    }
    setHydrated(true);
  }, []);

  // Persistir cambios.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // quota / private mode → ignore
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: CartItem) => {
    setItems((cur) => {
      const idx = cur.findIndex((x) => sameLine(x, item));
      if (idx >= 0) {
        const next = [...cur];
        next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
        return next;
      }
      return [...cur, item];
    });
  }, []);

  const changeQty = useCallback((index: number, nextQty: number) => {
    setItems((cur) => {
      if (index < 0 || index >= cur.length) return cur;
      if (nextQty <= 0) {
        return cur.filter((_, i) => i !== index);
      }
      const next = [...cur];
      next[index] = { ...next[index], qty: nextQty };
      return next;
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((acc, it) => acc + it.qty, 0);
    const subtotalRaw = items.reduce((acc, it) => acc + it.unit * it.qty, 0);
    const subtotal = Math.round(subtotalRaw * 10) / 10;
    return { items, count, subtotal, addItem, changeQty, clear };
  }, [items, addItem, changeQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>.");
  return ctx;
}

export type { DurationId };
