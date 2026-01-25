import React, { createContext, useContext, useState, ReactNode } from "react";

interface CartItem {
  book: any;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addToCart: (book: any) => void;
  removeFromCart: (bookId: number) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (book: any) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.book.id === book.id);
      if (existing) {
        return prev.map((item) =>
          item.book.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { book, quantity: 1 }];
    });
  };

  const removeFromCart = (bookId: number) => {
    setItems((prev) => prev.filter((item) => item.book.id !== bookId));
  };

  const updateQuantity = (bookId: number, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.book.id === bookId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.book.memberPrice, 0);

  return (
    <CartContext.Provider
      value={{ items, itemCount, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
