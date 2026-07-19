import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Vehicle } from '../api/client';

export interface CartItem {
  vehicle: Vehicle;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (vehicle: Vehicle) => void;
  removeFromCart: (vehicleId: string) => void;
  updateQuantity: (vehicleId: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  tax: number;
  totalBill: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('autoluxe_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('autoluxe_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  function addToCart(vehicle: Vehicle) {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.vehicle.id === vehicle.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(updated[existingIndex].quantity + 1, vehicle.quantity);
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      }
      return [...prev, { vehicle, quantity: 1 }];
    });
  }

  function removeFromCart(vehicleId: string) {
    setCartItems((prev) => prev.filter((item) => item.vehicle.id !== vehicleId));
  }

  function updateQuantity(vehicleId: string, quantity: number) {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.vehicle.id === vehicleId) {
          const validQuantity = Math.max(1, Math.min(quantity, item.vehicle.quantity));
          return { ...item, quantity: validQuantity };
        }
        return item;
      })
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.vehicle.price) * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const totalBill = subtotal + tax;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        tax,
        totalBill,
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
