import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from '@/shared/core/http/apiClient';

export interface CartItem {
  _id: string;
  productId: string;
  variantId: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  image?: string;
}

export interface ApiCart {
  _id: string;
  items: {
    product: string;
    variant: string;
    name: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    image?: string;
  }[];
  shipping: number;
  discount: number;
  grandTotal: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  loadCart: () => Promise<void>;
  addItem: (productId: string, variantId: string, name: string, unit: string, unitPrice: number, quantity?: number, image?: string) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  freeShippingProgress: number;
  remainingForFreeShipping: number;
  isFreeShipping: boolean;
}

function mapCartItems(cart: ApiCart): CartItem[] {
  return cart.items.map((item) => ({
    _id: item.variant,
    productId: item.product,
    variantId: item.variant,
    name: item.name,
    unit: item.unit,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discount: item.discount || 0,
    image: item.image,
  }));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      loadCart: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiRequest<{ data: ApiCart }>({ method: 'get', url: '/cart' });
          const cart = response.data;
          set({ items: mapCartItems(cart), isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to load cart' });
        }
      },

      addItem: async (productId, variantId, name, unit, unitPrice, quantity = 1, image) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiRequest<{ data: ApiCart }>({
            method: 'post',
            url: '/cart/items',
            data: { productId, variantId, quantity },
          });
          const cart = response.data;
          set({ items: mapCartItems(cart), isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to add item' });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiRequest<{ data: ApiCart }>({
            method: 'patch',
            url: `/cart/items/${variantId}`,
            data: { quantity },
          });
          const cart = response.data;
          set({ items: mapCartItems(cart), isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to update cart' });
        }
      },

      removeItem: async (variantId) => {
        try {
          set({ isLoading: true, error: null });
          const response = await apiRequest<{ data: ApiCart }>({
            method: 'delete',
            url: `/cart/items/${variantId}`,
          });
          const cart = response.data;
          set({ items: mapCartItems(cart), isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to remove item' });
        }
      },

      clearCart: async () => {
        try {
          set({ isLoading: true, error: null });
          await apiRequest({ method: 'delete', url: '/cart' });
          set({ items: [], isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: error instanceof Error ? error.message : 'Failed to clear cart' });
        }
      },

      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      get subtotal() {
        return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      },

      get freeShippingProgress() {
        const { subtotal } = get();
        const threshold = 4999;
        return Math.min(100, Math.round((subtotal / threshold) * 100));
      },

      get remainingForFreeShipping() {
        const threshold = 4999;
        return Math.max(0, threshold - get().subtotal);
      },

      get isFreeShipping() {
        return get().subtotal >= 4999;
      },
    }),
    {
      name: 'fwn-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
