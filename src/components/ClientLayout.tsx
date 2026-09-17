"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { CartProvider } from "./CartContext";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
