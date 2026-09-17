"use client";

import Link from "next/link";
import { useSettings } from "./SettingsContext";

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-gradient-to-b from-dark to-darker text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">💄</span>
              <span className="text-2xl font-black">
                {settings.siteNameAr || settings.siteName}
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {settings.tagline ||
                "وجهتك الأولى لمستحضرات التجميل والعناية بالبشرة والشعر. نقدم لك أفضل المنتجات بأفضل أسعار الجملة."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-pink-300">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors">
                  جميع المنتجات
                </Link>
              </li>
              <li>
                <Link href="/products?category=skincare" className="text-gray-400 hover:text-white transition-colors">
                  العناية بالبشرة
                </Link>
              </li>
              <li>
                <Link href="/products?category=makeup" className="text-gray-400 hover:text-white transition-colors">
                  المكياج
                </Link>
              </li>
              <li>
                <Link href="/products?category=haircare" className="text-gray-400 hover:text-white transition-colors">
                  العناية بالشعر
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-pink-300">خدمة العملاء</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">
                  تسجيل الدخول
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-gray-400 hover:text-white transition-colors">
                  حساب جديد
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="text-gray-400 hover:text-white transition-colors">
                  تتبع الأوردرات
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-pink-300">تواصل معنا</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              {settings.contactPhone && (
                <li className="flex items-center gap-2">
                  <span>📞</span>
                  <a href={`tel:${settings.contactPhone}`} className="hover:text-white transition-colors" dir="ltr">
                    {settings.contactPhone}
                  </a>
                </li>
              )}
              {settings.contactWhatsapp && (
                <li className="flex items-center gap-2">
                  <span>💬</span>
                  <a
                    href={`https://wa.me/${settings.contactWhatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 transition-colors"
                    dir="ltr"
                  >
                    واتساب خدمة العملاء
                  </a>
                </li>
              )}
              {settings.contactEmail && (
                <li className="flex items-center gap-2">
                  <span>📧</span>
                  <a href={`mailto:${settings.contactEmail}`} className="hover:text-white transition-colors">
                    {settings.contactEmail}
                  </a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-center gap-2">
                  <span>📍</span> {settings.address}
                </li>
              )}
            </ul>
            <div className="flex gap-3 mt-4">
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors text-sm"
                  title="فيسبوك"
                >
                  📘
                </a>
              )}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors text-sm"
                  title="إنستغرام"
                >
                  📷
                </a>
              )}
              {settings.tiktokUrl && (
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors text-sm"
                  title="تيك توك"
                >
                  🎬
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} {settings.siteNameAr || settings.siteName}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
