import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface CartItem {
  id: string;
  book_id: string;
  quantity: number;
  book: {
    id: string;
    title: string;
    author: string;
    price: number;
    cover_image_url: string | null;
  };
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  isLoading: boolean;
  addToCart: (bookId: string) => Promise<void>;
  updateQuantity: (bookId: string, quantity: number) => Promise<void>;
  removeFromCart: (bookId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setItems([]);
    }
  }, [user]);

  const refreshCart = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          book_id,
          quantity,
          book:books (
            id,
            title,
            author,
            price,
            cover_image_url
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      setItems((data as unknown as CartItem[]) || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (bookId: string) => {
    if (!user) throw new Error("Must be logged in to add to cart");

    const existingItem = items.find((item) => item.book_id === bookId);
    
    if (existingItem) {
      await updateQuantity(bookId, existingItem.quantity + 1);
    } else {
      const { error } = await supabase
        .from("cart_items")
        .insert({ user_id: user.id, book_id: bookId, quantity: 1 });

      if (error) throw error;
      await refreshCart();
    }
  };

  const updateQuantity = async (bookId: string, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      await removeFromCart(bookId);
      return;
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("user_id", user.id)
      .eq("book_id", bookId);

    if (error) throw error;
    await refreshCart();
  };

  const removeFromCart = async (bookId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("book_id", bookId);

    if (error) throw error;
    await refreshCart();
  };

  const clearCart = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (error) throw error;
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.book?.price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalPrice,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
