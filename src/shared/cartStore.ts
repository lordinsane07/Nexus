import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from './types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: string, unit: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            // If same unit, add quantity. Otherwise, reject or replace.
            // For simplicity, we just replace if they add it again.
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? item : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity, unit) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, orderedQuantity: quantity, orderedUnit: unit } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'nexus-cart',
    }
  )
);
