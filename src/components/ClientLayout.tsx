"use client";

import { type ReactNode } from "react";
import { SettingsProvider } from "./SettingsContext";
import { AuthProvider } from "./AuthContext";
import { CartProvider } from "./CartContext";
import { WishlistProvider } from "./WishlistContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <WhatsAppButton />
            </div>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
