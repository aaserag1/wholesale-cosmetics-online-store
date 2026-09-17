"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useSettings } from "./SettingsContext";
import { useState } from "react";

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      {/* Top Announcement & Quick Contact Bar */}
      <div className="bg-gradient-to-l from-gray-900 via-gray-800 to-gray-900 text-white text-xs py-1.5 px-4 shadow-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            {settings.announcementEnabled && settings.announcementText ? (
              <span className="truncate font-medium flex items-center gap-1.5 text-pink-200">
                <span className="animate-pulse">🔥</span>
                {settings.announcementText}
              </span>
            ) : (
              <span className="truncate text-gray-300 font-medium">
                🌸 {settings.tagline || "المنصة الأولى لتوريد مستحضرات التجميل بالجملة"}
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-4 shrink-0 text-[11px] font-bold">
            {settings.contactPhone && (
              <a
                href={`tel:${settings.contactPhone}`}
                className="flex items-center gap-1 text-gray-200 hover:text-white transition-colors"
                dir="ltr"
              >
                <span>📞</span>
                <span>{settings.contactPhone}</span>
              </a>
            )}
            {settings.contactWhatsapp && (
              <a
                href={`https://wa.me/${settings.contactWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                dir="ltr"
              >
                <span>💬</span>
                <span>واتساب الإدارة</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <nav className="glass sticky top-0 z-50 border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">💄</span>
              <div className="flex flex-col">
                <span className="text-xl font-black gradient-text leading-tight">
                  {settings.siteNameAr || settings.siteName}
                </span>
                <span className="text-[10px] text-gray-400 font-bold hidden sm:inline -mt-0.5">
                  B2B توريد جملة
                </span>
              </div>
            </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary transition-colors font-medium"
            >
              الرئيسية
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-primary transition-colors font-medium"
            >
              المنتجات
            </Link>
            {user?.isAdmin && (
              <Link
                href="/admin"
                className="text-secondary hover:text-secondary/80 transition-colors font-medium"
              >
                لوحة التحكم
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-primary transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse-glow">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-gradient-to-l from-primary to-secondary text-white px-3 py-1.5 rounded-full text-sm font-medium hover:shadow-lg transition-all"
                >
                  <span className="hidden sm:inline">{user.name}</span>
                  <span className="sm:hidden">👤</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-slide-down">
                    <Link
                      href="/account/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-primary transition-colors text-sm font-semibold"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      🏢 الملف الشخصي للتاجر
                    </Link>
                    <Link
                      href="/account/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-primary transition-colors text-sm font-semibold"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      📦 سجل الطلبات
                    </Link>
                    <Link
                      href="/account/wishlist"
                      className="block px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-primary transition-colors text-sm font-semibold"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      ❤️ قائمة المفضلة
                    </Link>
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-purple-700 hover:bg-purple-50 font-bold transition-colors text-sm"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        ⚙️ لوحة تحكم الإدارة
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-right px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      🚪 تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="bg-gradient-to-l from-primary to-secondary text-white px-4 py-1.5 rounded-full text-sm font-medium hover:shadow-lg transition-all"
              >
                تسجيل الدخول
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-pink-100 py-3 animate-slide-down">
            <Link
              href="/"
              className="block py-2 text-gray-700 hover:text-primary"
              onClick={() => setMenuOpen(false)}
            >
              🏠 الرئيسية
            </Link>
            <Link
              href="/products"
              className="block py-2 text-gray-700 hover:text-primary"
              onClick={() => setMenuOpen(false)}
            >
              🛍️ المنتجات
            </Link>
            {user && (
              <>
                <Link
                  href="/account/profile"
                  className="block py-2 text-gray-700 hover:text-primary font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  🏢 الملف الشخصي للتاجر
                </Link>
                <Link
                  href="/account/orders"
                  className="block py-2 text-gray-700 hover:text-primary font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  📦 سجل الطلبات
                </Link>
                <Link
                  href="/account/wishlist"
                  className="block py-2 text-gray-700 hover:text-primary font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  ❤️ قائمة المفضلة
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="block py-2 text-purple-700 font-bold hover:text-purple-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    ⚙️ لوحة تحكم الإدارة
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
    </>
  );
}
