"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

interface Product {
  id: number;
  name: string;
  nameAr: string;
  description: string | null;
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

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(6);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.product) {
          setProduct(d.product);
          setQuantity(d.product.minOrderQuantity || 6);
        }
        setLoading(false);
      });
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    await addToCart(product.id, quantity, product);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-4">😕</span>
        <h2 className="text-2xl font-bold mb-2">المنتج غير موجود</h2>
        <Link href="/products" className="text-primary hover:underline">
          العودة للمنتجات
        </Link>
      </div>
    );
  }

  const moq = product.minOrderQuantity || 6;

  // Active unit price based on quantity
  let currentUnitPrice = parseFloat(product.price);
  let activeTier = "base";
  if (product.tier2Min && product.tier2Price && quantity >= product.tier2Min) {
    currentUnitPrice = parseFloat(product.tier2Price);
    activeTier = "tier2";
  } else if (product.tier1Min && product.tier1Price && quantity >= product.tier1Min) {
    currentUnitPrice = parseFloat(product.tier1Price);
    activeTier = "tier1";
  }

  const currentTotal = (currentUnitPrice * quantity).toFixed(0);

  const discount = product.originalPrice
    ? Math.round(
        ((parseFloat(product.originalPrice) - parseFloat(product.price)) /
          parseFloat(product.originalPrice)) *
          100
      )
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">الرئيسية</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary">المنتجات</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{product.nameAr}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image & Package info */}
        <div>
          <div className="relative aspect-square bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl overflow-hidden shadow-lg border border-pink-100">
            {product.image ? (
              <img
                src={product.image}
                alt={product.nameAr}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                🧴
              </div>
            )}
            {discount > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white font-bold px-4 py-1.5 rounded-full text-sm shadow">
                خصم {discount}%
              </span>
            )}
            {product.packageUnit && (
              <span className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white font-bold px-3 py-1 rounded-xl text-xs">
                📦 {product.packageUnit}
              </span>
            )}
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-pink-50 border border-pink-100 rounded-2xl p-3 text-center">
              <span className="text-2xl block mb-1">🚚</span>
              <span className="text-xs font-bold text-gray-700">شحن سريع</span>
              <p className="text-[11px] text-gray-500 mt-0.5">لكافة المحافظات</p>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3 text-center">
              <span className="text-2xl block mb-1">✅</span>
              <span className="text-xs font-bold text-gray-700">منتجات أصلية 100%</span>
              <p className="text-[11px] text-gray-500 mt-0.5">مباشرة من الوكلاء</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-center">
              <span className="text-2xl block mb-1">🏷️</span>
              <span className="text-xs font-bold text-gray-700">أسعار تجار الجملة</span>
              <p className="text-[11px] text-gray-500 mt-0.5">وفر أكثر مع الكميات</p>
            </div>
          </div>
        </div>

        {/* Details & Wholesale Tiers */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {product.categoryName && (
              <span className="text-xs text-secondary font-bold bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                {product.categoryName}
              </span>
            )}
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              أقل كمية للطلب: {moq} قطعة
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black mt-2 mb-3 text-gray-900">{product.nameAr}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-base">
                  {i < Math.round(parseFloat(product.rating || "0")) ? "★" : "☆"}
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {product.rating} ({product.reviewCount} تقييم تاجر)
            </span>
          </div>

          {/* Wholesale Tier Pricing Cards */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mb-6">
            <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-1.5">
              <span>📊</span> شرائح أسعار الجملة حسب الكمية:
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div
                className={`p-2.5 rounded-xl border transition-all ${
                  activeTier === "base"
                    ? "bg-white border-primary shadow-sm ring-2 ring-primary/20"
                    : "bg-white/60 border-gray-200"
                }`}
              >
                <p className="text-gray-500 font-medium">من {moq} إلى {(product.tier1Min || 12) - 1}</p>
                <p className="text-sm font-black text-primary mt-1">
                  {parseFloat(product.price).toFixed(0)} ج.م
                </p>
                <p className="text-[10px] text-gray-400">سعر القطعة</p>
              </div>

              {product.tier1Price && (
                <div
                  className={`p-2.5 rounded-xl border transition-all ${
                    activeTier === "tier1"
                      ? "bg-white border-primary shadow-sm ring-2 ring-primary/20"
                      : "bg-white/60 border-gray-200"
                  }`}
                >
                  <p className="text-gray-500 font-medium">
                    {product.tier1Min}+ قطعة
                  </p>
                  <p className="text-sm font-black text-green-700 mt-1">
                    {parseFloat(product.tier1Price).toFixed(0)} ج.م
                  </p>
                  <p className="text-[10px] text-green-600 font-bold">سعر الدستة</p>
                </div>
              )}

              {product.tier2Price && (
                <div
                  className={`p-2.5 rounded-xl border transition-all ${
                    activeTier === "tier2"
                      ? "bg-white border-primary shadow-sm ring-2 ring-primary/20"
                      : "bg-white/60 border-gray-200"
                  }`}
                >
                  <p className="text-gray-500 font-medium">
                    {product.tier2Min}+ قطعة
                  </p>
                  <p className="text-sm font-black text-purple-700 mt-1">
                    {parseFloat(product.tier2Price).toFixed(0)} ج.م
                  </p>
                  <p className="text-[10px] text-purple-600 font-bold">سعر الكرتونة</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {product.descriptionAr && (
            <div className="mb-6">
              <h3 className="font-bold mb-1.5 text-sm text-gray-800">تفاصيل المنتج والمواصفات:</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.descriptionAr}
              </p>
            </div>
          )}

          {/* Stock */}
          <div className="mb-6">
            {product.stock > 10 ? (
              <span className="text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                ✅ متوفر بالمخزن ({product.stock} قطعة متاحة)
              </span>
            ) : product.stock > 0 ? (
              <span className="text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                ⚠️ متبقي {product.stock} قطع فقط
              </span>
            ) : (
              <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                ❌ نفد من المخزن حالياً
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <div>
                <span className="font-bold text-sm text-gray-800 block">حدد الكمية المطلوبة:</span>
                <span className="text-xs text-gray-400">الحد الأدنى: {moq} قطع</span>
              </div>
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                <button
                  onClick={() => setQuantity(Math.max(moq, quantity - 1))}
                  disabled={quantity <= moq}
                  className="px-4 py-2 hover:bg-gray-200 transition-colors font-bold disabled:opacity-30"
                >
                  -
                </button>
                <input
                  type="number"
                  min={moq}
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || moq;
                    setQuantity(Math.max(moq, Math.min(product.stock, val)));
                  }}
                  className="w-16 text-center font-bold text-base bg-white py-2 focus:outline-none border-x border-gray-200"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="px-4 py-2 hover:bg-gray-200 transition-colors font-bold disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Increment Buttons */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">إضافة سريعة:</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 6))}
                className="bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg font-bold"
              >
                +6 قطع
              </button>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 12))}
                className="bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg font-bold"
              >
                +12 (دستة)
              </button>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 24))}
                className="bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg font-bold"
              >
                +24 قطعة
              </button>
            </div>

            <hr className="my-3" />

            {/* Total calculation */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                السعر الفعلي المطبق ({quantity} قطعة × {currentUnitPrice.toFixed(0)} ج.م):
              </span>
              <span className="text-2xl font-black text-primary">
                {currentTotal} ج.م
              </span>
            </div>
          </div>

          {/* Add to cart */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all disabled:opacity-50 active:scale-95 ${
                added
                  ? "bg-green-600 text-white shadow-xl shadow-green-200"
                  : "bg-gradient-to-l from-primary to-secondary text-white hover:shadow-xl hover:shadow-pink-200"
              }`}
            >
              {adding
                ? "جاري الإضافة..."
                : added
                ? `✅ تمت إضافة ${quantity} قطعة للسلة!`
                : `🛒 أضف ${quantity} قطعة للسلة`}
            </button>
            <Link
              href="/cart"
              className="bg-gray-100 text-gray-700 px-6 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center text-xl"
            >
              🛍️
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
