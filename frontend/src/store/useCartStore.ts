import { create } from 'zustand';

export interface CartItem { // โครงสร้างข้อมูลของตะกร้าใส่สินค้า
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState { // 
  items: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addToCart: (item) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.productId === item.productId);
      if (existingItem) {
        // อัปเดตจำนวนถ้ามีอยู่ในตะกร้าแล้ว
        return {
          items: state.items.map((i) =>
            i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        };
      }
      // ถ้ายังไม่มีให้เพิ่มเข้าไปใหม่
      return { items: [...state.items, item] };
    });
  },

  removeFromCart: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    }));
  },

  clearCart: () => set({ items: [] }),

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
