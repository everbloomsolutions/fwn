import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  images: string[];
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const items = [...get().items];
        const existing = items.find(item => item.product.slug === product.slug);
        if (existing) {
          existing.quantity += quantity;
        } else {
          items.push({ product, quantity });
        }
        set({ items });
      },
      removeItem: (slug) => {
        set({ items: get().items.filter(item => item.product.slug !== slug) });
      },
      updateQuantity: (slug, quantity) => {
        if (quantity < 1) {
          get().removeItem(slug);
          return;
        }
        const items = get().items.map(item =>
          item.product.slug === slug ? { ...item, quantity } : item
        );
        set({ items });
      },
      clearCart: () => set({ items: [] }),
      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
      get subtotal() {
        return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },
    }),
    {
      name: 'fwn-cart',
    }
  )
);
