"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface WishlistContextType {
  wishlistIds: number[];
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (productId: number) => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("beautymart_wishlist");
      if (saved) {
        setWishlistIds(JSON.parse(saved));
      }
    } catch {}
    setLoaded(true);
  }, []);

  const saveWishlist = (ids: number[]) => {
    setWishlistIds(ids);
    try {
      localStorage.setItem("beautymart_wishlist", JSON.stringify(ids));
    } catch {}
  };

  const isInWishlist = (productId: number) => {
    return wishlistIds.includes(productId);
  };

  const toggleWishlist = (productId: number) => {
    if (wishlistIds.includes(productId)) {
      saveWishlist(wishlistIds.filter((id) => id !== productId));
    } else {
      saveWishlist([...wishlistIds, productId]);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        wishlistCount: wishlistIds.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
