"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";

interface Product {
  id: number;
  name: string;
  nameAr: string;
  descriptionAr: string | null;
  price: string;
  originalPrice: string | null;
  image: string | null;
  stock: number;
  rating: string | null;
  reviewCount: number;
  categoryName: string | null;
  minOrderQuantity?: number;
  packageUnit?: string;
  tier1Price?: string | null;
  tier1Min?: number | null;
}

interface Category {
  id: number;
  name: string;
  nameAr: string;
  slug: string;
  icon: string | null;
}

export default function HomePage() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/products?featured=true&limit=8")
      .then((r) => r.json())
      .then((d) => setFeatured(d.products || []));
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-pattern relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="animate-fade-in">
              {user ? (
                <span className="inline-flex items-center gap-2 bg-pink-100 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                  <span>🌸</span> أهلاً بك يا {user.name} | {user.businessName || (user.isAdmin ? "👑 مسؤول النظام" : "حساب تاجر معتمد")}
                </span>
              ) : (
                <span className="inline-block bg-pink-100 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                  🏢 المنصة الأولى لتوريد مستحضرات التجميل بالجملة
                </span>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                مستحضرات التجميل
                <br />
                <span className="gradient-text">بأسعار الجملة المباشرة</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                نوفر للصالونات، مراكز التجميل، والتجار أكبر تشكيلة منتجات أصلية بنظام الدستة والكرتونة، مع خصومات تصاعدية على الكميات وحد أدنى مرن للطلب 1,000 ج.م فقط.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="bg-gradient-to-l from-primary to-secondary text-white px-8 py-3.5 rounded-full font-bold text-lg hover:shadow-xl hover:shadow-pink-200 transition-all active:scale-95 flex items-center gap-2"
                >
                  <span>📦</span> تصفح كتالوج الجملة
                </Link>

                {user ? (
                  user.isAdmin ? (
                    <Link
                      href="/admin"
                      className="bg-purple-700 hover:bg-purple-800 text-white px-8 py-3.5 rounded-full font-bold text-lg shadow-lg hover:shadow-purple-200 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <span>⚙️</span> لوحة تحكم الإدارة
                    </Link>
                  ) : (
                    <Link
                      href="/account/profile"
                      className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3.5 rounded-full font-bold text-lg transition-all active:scale-95 flex items-center gap-2"
                    >
                      <span>🏢</span> حسابك التجاري
                    </Link>
                  )
                ) : (
                  <Link
                    href="/auth/register"
                    className="border-2 border-primary text-primary px-8 py-3.5 rounded-full font-bold text-lg hover:bg-primary hover:text-white transition-all"
                  >
                    فتح حساب تاجر / صالون
                  </Link>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚚</span>
                  <span>شحن كراتين آمن</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  <span>أسعار جملة متدرجة</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <span>بضاعة أصلية 100%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">💳</span>
                  <span>دفع عند الاستلام</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden md:block">
              <div className="relative w-full h-[450px]">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200 rounded-3xl rotate-3 opacity-50"></div>
                <div className="absolute inset-4 bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="text-8xl mb-4">📦💄✨</div>
                    <p className="text-2xl font-bold text-primary">خصومات كميات تصل إلى 40%</p>
                    <p className="text-gray-600 mt-2">أسعار خاصة للدستة والكرتونة للمحلات والصالونات</p>
                    <div className="inline-block mt-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 shadow-sm border border-pink-200">
                      الحد الأدنى للطلب: 1,000 ج.م
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-pink-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-black gradient-text">+500</p>
              <p className="text-gray-500 text-sm mt-1">منتج أصلي بالجملة</p>
            </div>
            <div>
              <p className="text-3xl font-black gradient-text">+1,200</p>
              <p className="text-gray-500 text-sm mt-1">صالون ومتجر شريك</p>
            </div>
            <div>
              <p className="text-3xl font-black gradient-text">1,000 ج.م</p>
              <p className="text-gray-500 text-sm mt-1">أقل حد أدنى للطلب (MOV)</p>
            </div>
            <div>
              <p className="text-3xl font-black gradient-text">100%</p>
              <p className="text-gray-500 text-sm mt-1">ضمان أصالة المنتجات</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black mb-2">تسوق حسب القسم</h2>
          <p className="text-gray-500">اختر القسم اللي يناسبك</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/30 transition-all group"
            >
              <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className="font-bold text-gray-800 group-hover:text-primary transition-colors">
                {cat.nameAr}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white border-y border-pink-100">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black">⭐ المنتجات الأكثر مبيعاً</h2>
              <p className="text-gray-500 mt-1">اختيارات عملائنا المفضلة</p>
            </div>
            <Link
              href="/products"
              className="text-primary font-bold hover:underline"
            >
              عرض الكل ←
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="bg-gradient-to-l from-primary to-secondary rounded-3xl p-10 md:p-16 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 text-8xl">🌸</div>
            <div className="absolute bottom-10 left-10 text-8xl">💄</div>
            <div className="absolute top-1/2 left-1/2 text-8xl">✨</div>
          </div>
          {user ? (
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-black mb-4">
                أهلاً بك مجدداً يا {user.name} 👋
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                {user.businessName
                  ? `حساب نشاطك التجاري (${user.businessName}) معتمد وجاهز لطلب الكميات بخصومات الجملة المباشرة.`
                  : "حسابك التجاري مفعل وجاهز لطلب كميات الجملة مباشرة مع عروض الدست والكراتين."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/products"
                  className="bg-white text-primary px-10 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all inline-block active:scale-95"
                >
                  🛍️ مواصلة التسوق وتجهيز الطلبية
                </Link>
                {user.isAdmin ? (
                  <Link
                    href="/admin"
                    className="bg-purple-900/80 hover:bg-purple-900 text-white px-8 py-4 rounded-full font-bold text-lg transition-all inline-block shadow-lg"
                  >
                    ⚙️ إدارة المنصة والطلبات
                  </Link>
                ) : (
                  <Link
                    href="/account/orders"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur border border-white/40 text-white px-8 py-4 rounded-full font-bold text-lg transition-all inline-block"
                  >
                    📦 تتبع طلباتك السابقة
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-black mb-4">
                سجّل كتاجر أو صالون واستفد بخصومات الكميات
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                انضم لمئات الصالونات وتجار مستحضرات التجميل الذين يعتمدون على BeautyMart لتوريد بضاعتهم بأعلى هامش ربح
              </p>
              <Link
                href="/auth/register"
                className="bg-white text-primary px-10 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all inline-block active:scale-95"
              >
                🏢 فتح حساب تاجر الآن
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
