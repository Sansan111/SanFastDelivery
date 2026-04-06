import { create } from 'zustand';

export interface CartItem { // โครงสร้างข้อมูลของตะกร้าใส่สินค้า
  cartItemId: string; // ID แบบสุ่มเพื่อให้แยกแยะรายการที่มี note ต่างกันได้
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  note?: string; // ข้อความเพิ่มเติมของออเดอร์
}

interface CartState { // 
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'cartItemId'>) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addToCart: (item) => {
    set((state) => {
      // ตรวจสอบว่ามีสินค้านี้ และมี note ที่เหมือนกันเป๊ะๆ หรือไม่
      const existingItem = state.items.find(
        (i) => i.productId === item.productId && (i.note || '') === (item.note || '')
      );
      
      if (existingItem) {
        // อัปเดตจำนวนถ้ามีอยู่ในตะกร้าแล้ว
        return {
          items: state.items.map((i) =>
            i.cartItemId === existingItem.cartItemId 
              ? { ...i, quantity: i.quantity + item.quantity } 
              : i
          ),
        };
      }
      // ถ้ายังไม่มีให้เพิ่มเข้าไปใหม่ พร้อมสร้าง uuid
      const newItem: CartItem = {
        ...item,
        cartItemId: Math.random().toString(36).substring(7),
      };
      return { items: [...state.items, newItem] };
    });
  },

  removeFromCart: (cartItemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.cartItemId !== cartItemId),
    }));
  },

  clearCart: () => set({ items: [] }),

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
