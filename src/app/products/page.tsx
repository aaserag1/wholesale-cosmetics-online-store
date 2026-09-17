"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: number;
  name: string;
  nameAr: string;
  descriptionAr: string | null;
  price: string;
  originalPrice: string | null;
  minOrderQuantity: number;
  packageUnit: string;
  piecesPerPackage: number;
  tier1Min: number | null;
  tier1Price: string | null;
  tier2Min: number | null;
  tier2Price: string | null;
  image: string | null;
  stock: number;
  rating: string | null;
  reviewCount: number;
  categoryName: string | null;
}

interface Category {
  id: number;
  name: string;
  nameAr: string;
  slug: string;
  icon: string | null;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const activeCategory = searchParams.get("category") || "";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    params.set("limit", "100");

    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    let prods = data.products || [];
    if (inStockOnly) {
      prods = prods.filter((p: Product) => p.stock > 0);
    }
    setProducts(prods);
    setTotal(prods.length);
    setLoading(false);
  }, [activeCategory, search, sort, inStockOnly]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Wholesale Banner */}
      <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 border border-pink-200 rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏪</span>
          <div>
            <h2 className="font-black text-gray-800 text-sm md:text-base">
              كتالوج أسعار الجملة لقطاع مستحضرات التجميل
            </h2>
            <p className="text-xs text-gray-600">
              جميع الأسعار معروضة للقطعة عند استيفاء الحد الأدنى للطلب (MOQ) | خصومات فورية عند شراء الدستة والكرتونة
            </p>
          </div>
        </div>
        <span className="bg-white text-primary border border-pink-200 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
          الحد الأدنى للفاتورة: 1,000 ج.م
        </span>
      </div>

      {/* Horizontal Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
        <Link
          href="/products"
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
            !activeCategory
              ? "bg-primary text-white shadow-md shadow-pink-200"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          ✨ جميع المنتجات
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/products?category=${c.slug}`}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeCategory === c.slug
                ? "bg-primary text-white shadow-md shadow-pink-200"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>{c.icon || "💄"}</span>
            <span>{c.nameAr}</span>
          </Link>
        ))}
      </div>

      {/* Header with Sort & Stock Filter */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black mb-1 text-gray-900">
            {activeCategory
              ? categories.find((c) => c.slug === activeCategory)?.icon + " " +
                categories.find((c) => c.slug === activeCategory)?.nameAr
              : "🛍️ جميع منتجات الجملة"}
          </h1>
          <p className="text-gray-500 text-xs">{total} منتج متاح للتوريد الفوري</p>
        </div>

        {/* Sort & Quick Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-3.5 h-3.5 text-primary rounded"
            />
            <span>فقط المتوفر بالمخزن</span>
          </label>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-500">الترتيب:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="newest">✨ الأحدث</option>
              <option value="price-asc">💵 السعر: من الأقل للأعلى</option>
              <option value="price-desc">💎 السعر: من الأعلى للأقل</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          {/* Search */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
            <h3 className="font-bold text-xs mb-3 text-gray-700">🔍 بحث فوري بالاسم</h3>
            <input
              type="text"
              placeholder="ابحث عن منتج بالاسم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Categories Sidebar List */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-xs mb-3 text-gray-700">📂 الأقسام والتصنيفات</h3>
            <div className="space-y-1">
              <Link
                href="/products"
                className={`block px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  !activeCategory
                    ? "bg-pink-50 text-primary font-bold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                📦 عرض جميع الأقسام
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={`block px-3 py-2 rounded-xl text-xs transition-colors ${
                    activeCategory === cat.slug
                      ? "bg-pink-50 text-primary font-bold"
                      : "text-gray-600 hover:bg-gray-50 font-medium"
                  }`}
                >
                  {cat.icon} {cat.nameAr}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse"
                >
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
              <span className="text-6xl block mb-4">🔍</span>
              <h3 className="text-xl font-bold mb-2">لا توجد منتجات مطابقة</h3>
              <p className="text-gray-500 text-sm">جرب البحث بكلمات أخرى أو اختر قسماً آخر</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse h-8 w-48 bg-gray-200 rounded mb-4" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
