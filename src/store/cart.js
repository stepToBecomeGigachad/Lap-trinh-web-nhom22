"use client";
import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (newItem) => set((state) => {
    const idx = state.items.findIndex(i => i.id === newItem.id);
    if (idx > -1) {
      const copy = [...state.items];
      copy[idx].quantity += newItem.quantity || 1;
      return { items: copy };
    }
    return { items: [...state.items, { ...newItem, quantity: newItem.quantity || 1 }] };
  }),

  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),

  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(i => i.id === id ? { ...i, quantity } : i)
  })),

  clearCart: () => set({ items: [] }),

  setItems: (items) => set({ items: Array.isArray(items) ? items : [] }),

  totalItems: () => get().items.reduce((t, i) => t + i.quantity, 0),
  totalPrice: () => get().items.reduce((t, i) => t + i.price * i.quantity, 0),

  setOpen: (val) => set({ isOpen: !!val }),
}));
