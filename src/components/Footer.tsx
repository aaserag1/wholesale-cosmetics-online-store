import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-dark to-darker text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">💄</span>
              <span className="text-2xl font-bold">BeautyMart</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              وجهتك الأولى لمستحضرات التجميل والعناية بالبشرة والشعر.
              نقدم لك أفضل المنتجات بأفضل الأسعار الجملة.
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
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <span>📞</span> 01000000000
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span> info@beautymart.com
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span> القاهرة، مصر
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                📘
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                📷
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                🐦
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>© 2024 BeautyMart. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
