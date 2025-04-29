import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  slug: string;
}

interface CartState {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      setCart: (cart) => set({ cart }),
      addToCart: (product) => {
        const cart = get().cart;
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
          // If item already exists, update quantity
          set({
            cart: cart.map(item => 
              item.id === product.id 
                ? { ...item, quantity: item.quantity + product.quantity }
                : item
            )
          });
        } else {
          // Add new item to cart
          set({ cart: [...cart, product] });
        }
      },
      removeFromCart: (id) => {
        set({ cart: get().cart.filter(item => item.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        set({
          cart: get().cart.map(item => 
            item.id === id ? { ...item, quantity } : item
          )
        });
      },
      clearCart: () => set({ cart: [] }),
      get totalItems() {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
      },
      get totalPrice() {
        return get().cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'cart-storage', // unique name for localStorage key
    }
  )
);