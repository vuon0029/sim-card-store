import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { CartItem, SimCard } from '../types';

const CART_STORAGE_KEY = 'sim-card-store-cart';

interface CartContextType {
  items: CartItem[];
  addToCart: (simCard: SimCard) => void;
  removeFromCart: (simCardId: string) => void;
  clearCart: () => void;
  isInCart: (simCardId: string) => boolean;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((item: CartItem) => ({
      ...item,
      addedAt: new Date(item.addedAt),
    }));
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);

  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addToCart = useCallback((simCard: SimCard) => {
    setItems((prev) => {
      if (prev.some((item) => item.simCard.id === simCard.id)) {
        return prev;
      }
      return [...prev, { simCard, addedAt: new Date() }];
    });
  }, []);

  const removeFromCart = useCallback((simCardId: string) => {
    setItems((prev) => prev.filter((item) => item.simCard.id !== simCardId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (simCardId: string) => items.some((item) => item.simCard.id === simCardId),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        itemCount: items.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
