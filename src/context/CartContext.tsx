import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Product, CartItem } from "../types";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  updateQuantity: (productId: string, delta: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const userId = user?.id || null;
  const userIdRef = useRef<string | null>(null);
  userIdRef.current = userId;

  // 1. Fetch Cart from Supabase PostgreSQL database
  const fetchDBCart = useCallback(async (uid: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching cart in mobile app:", error);
        return;
      }

      if (data) {
        const mapped: CartItem[] = data.map((item: any) => ({
          id: item.product_id,
          name: item.product_name,
          category: "Tech Gadget",
          price: Number(item.price),
          originalPrice: Number(item.price) * 1.2,
          discount: "-15%",
          rating: 4.8,
          reviews: 25,
          image: item.image || "",
          specs: "",
          inStock: true,
          quantity: item.quantity,
        }));
        setCart(mapped);
      }
    } catch (err) {
      console.error("Failed to load mobile cart:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Fetch cart when user logs in or changes
  useEffect(() => {
    if (userId) {
      fetchDBCart(userId);
    } else {
      setCart([]);
    }
  }, [userId, fetchDBCart]);

  // 3. Supabase Realtime WebSocket Listener (Instant Sync with Web)
  useEffect(() => {
    if (!userId) return;

    // Listen to live database changes from the Web browser!
    const channel = supabase
      .channel(`realtime_mobile_cart_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Instant sync whenever web app makes a change
          fetchDBCart(userId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchDBCart]);

  // 4. Add to Cart (Persists to Supabase & broadcasts to Web)
  const addToCart = async (product: Product) => {
    const currentUid = userIdRef.current;

    // Optimistic UI update
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    if (currentUid) {
      try {
        const existing = cart.find((item) => item.id === product.id);
        const newQty = existing ? existing.quantity + 1 : 1;

        await supabase.from("cart_items").upsert(
          {
            user_id: currentUid,
            product_id: product.id,
            product_name: product.name,
            price: product.price,
            image: product.image,
            quantity: newQty,
          },
          { onConflict: "user_id,product_id" }
        );
      } catch (err) {
        console.error("Error adding to cart on mobile:", err);
      }
    }
  };

  // 5. Update Quantity (+ / -)
  const updateQuantity = async (productId: string, delta: number) => {
    const currentUid = userIdRef.current;
    const targetItem = cart.find((i) => i.id === productId);
    if (!targetItem) return;

    const newQty = targetItem.quantity + delta;

    if (newQty <= 0) {
      await removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQty } : item
      )
    );

    if (currentUid) {
      try {
        await supabase
          .from("cart_items")
          .update({ quantity: newQty })
          .eq("user_id", currentUid)
          .eq("product_id", productId);
      } catch (err) {
        console.error("Error updating quantity on mobile:", err);
      }
    }
  };

  // 6. Remove Item
  const removeFromCart = async (productId: string) => {
    const currentUid = userIdRef.current;

    setCart((prev) => prev.filter((item) => item.id !== productId));

    if (currentUid) {
      try {
        await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", currentUid)
          .eq("product_id", productId);
      } catch (err) {
        console.error("Error deleting cart item on mobile:", err);
      }
    }
  };

  // 7. Clear Entire Cart
  const clearCart = async () => {
    const currentUid = userIdRef.current;
    setCart([]);

    if (currentUid) {
      try {
        await supabase.from("cart_items").delete().eq("user_id", currentUid);
      } catch (err) {
        console.error("Error clearing cart on mobile:", err);
      }
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalAmount,
        isLoading,
        refreshCart: () => (userId ? fetchDBCart(userId) : Promise.resolve()),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
