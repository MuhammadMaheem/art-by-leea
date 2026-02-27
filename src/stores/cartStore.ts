/**
 * Zustand Cart Store — Manages shopping cart state with localStorage persistence.
 *
 * Zustand is a tiny state management library (~1KB). The `persist` middleware
 * automatically saves the cart to localStorage so it survives page refreshes
 * and browser restarts.
 *
 * Usage:
 *   const { items, addItem, removeItem, clearCart, totalPrice } = useCartStore();
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Artwork, CartItem } from "@/types";

interface CartState {
  items: CartItem[];

  /** Add an artwork to the cart. If it already exists, increment quantity. */
  addItem: (artwork: Artwork) => void;

  /** Remove an item from the cart entirely by artwork ID. */
  removeItem: (artworkId: string) => void;

  /** Update the quantity of a specific item. Removes if quantity <= 0. */
  updateQuantity: (artworkId: string, quantity: number) => void;

  /** Clear all items from the cart. */
  clearCart: () => void;

  /** Get the total number of items in the cart. */
  totalItems: () => number;

  /** Get the total price of all items in the cart. */
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (artwork: Artwork) => {
        set((state) => {
          // Check if this artwork is already in the cart
          const existingIndex = state.items.findIndex(
            (item) => item.id === artwork.id
          );

          if (existingIndex >= 0) {
            // Already in cart — increase quantity by 1
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + 1,
            };
            return { items: updatedItems };
          }

          // Not in cart — add as new item with quantity 1
          return { items: [...state.items, { ...artwork, quantity: 1 }] };
        });
      },

      removeItem: (artworkId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== artworkId),
        }));
      },

      updateQuantity: (artworkId: string, quantity: number) => {
        if (quantity <= 0) {
          // Remove item if quantity drops to 0 or below
          get().removeItem(artworkId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === artworkId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "art-gallery-cart", // localStorage key
    }
  )
);
