"use client";

import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MIN_ORDER_VALUE = 1000;

export default function CartPage() {
  const { items, total, loading, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-4">🛒</span>
        <h2 className="text-2xl font-bold mb-2">سلة مشتريات الجملة فارغة</h2>
        <p className="text-gray-500 mb-6">تصفح كتالوج المنتجات واختر الكميات المناسبة لمتجرك أو صالونك</p>
        <Link
          href="/products"
          className="bg-gradient-to-l from-primary to-secondary text-white px-8 py-3 rounded-full font-bold inline-block shadow-lg hover:shadow-pink-200 transition-all"
        >
          🛍️ تصفح منتجات الجملة
        </Link>
      </div>
    );
  }

  const movProgress = Math.min(100, Math.round((total / MIN_ORDER_VALUE) * 100));
  const remainingForMov = Math.max(0, MIN_ORDER_VALUE - total);
  const isMovMet = total >= MIN_ORDER_VALUE;

  // Check if any item has quantity below its MOQ
  const hasMoqViolation = items.some(
    (i) => i.quantity < (i.minOrderQuantity || 6)
  );

  const handleCheckoutClick = () => {
    if (!user) {
      router.push("/auth/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-3xl font-black">🛒 سلة مشتريات الجملة</h1>
        <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {items.length} أصناف
        </span>
      </div>

      {/* MOV Wholesale Notice & Progress Bar */}
      <div
        className={`rounded-2xl p-5 mb-8 border transition-all ${
          isMovMet
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-amber-50 border-amber-200 text-amber-900"
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{isMovMet ? "✅" : "⚠️"}</span>
            <div>
              <p className="font-bold text-sm">
                {isMovMet
                  ? "طلبك مؤهل للشحن بأسعار الجملة!"
                  : `الحد الأدنى لطلب الجملة هو ${MIN_ORDER_VALUE} ج.م`}
              </p>
              <p className="text-xs opacity-80 mt-0.5">
                {isMovMet
                  ? "لقد استوفيت الحد الأدنى لقيمة الفاتورة ويمكنك إتمام الطلب الآن."
                  : `متبقي ${remainingForMov.toFixed(0)} ج.م للوصول إلى الحد الأدنى للطلب.`}
              </p>
            </div>
          </div>
          <span className="font-black text-sm">
            {total.toFixed(0)} / {MIN_ORDER_VALUE} ج.م
          </span>
        </div>

        {/* Bar */}
        <div className="h-3 bg-white/70 rounded-full overflow-hidden border border-black/5 mt-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isMovMet
                ? "bg-green-500"
                : "bg-gradient-to-l from-primary to-amber-500"
            }`}
            style={{ width: `${movProgress}%` }}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => {
            const moq = item.minOrderQuantity || 6;
            const isBelowMoq = item.quantity < moq;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 relative"
              >
                {/* Image */}
                <div className="w-24 h-24 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl overflow-hidden shrink-0">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      🧴
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-800 text-sm md:text-base">
                      {item.productName}
                    </h3>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 text-xs shrink-0 p-1"
                      title="حذف"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Packaging & Tier badge */}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {item.packageUnit && (
                      <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                        📦 {item.packageUnit}
                      </span>
                    )}
                    {item.tierApplied === "tier2" ? (
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        🎉 خصم الكرتونة
                      </span>
                    ) : item.tierApplied === "tier1" ? (
                      <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                        🏷️ خصم الدستة
                      </span>
                    ) : null}
                  </div>

                  {/* Pricing per piece */}
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-primary font-bold text-base">
                      {parseFloat(item.unitPrice || item.productPrice).toFixed(0)} ج.م
                    </span>
                    <span className="text-xs text-gray-400">للقطعة</span>
                  </div>

                  {isBelowMoq && (
                    <p className="text-red-600 text-xs mt-1 font-bold">
                      ⚠️ أقل كمية مسموحة لهذا الصنف هي {moq} قطع
                    </p>
                  )}

                  {/* Quantity & Subtotal controls */}
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2 pt-2 border-t border-gray-50">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 hover:bg-gray-200 text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-sm font-bold min-w-[36px] text-center bg-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 hover:bg-gray-200 text-sm font-bold"
                        disabled={item.quantity >= item.stock}
                      >
                        +
                      </button>
                    </div>

                    <div className="text-left">
                      <span className="text-xs text-gray-400 block">الإجمالي</span>
                      <span className="font-black text-gray-900 text-base">
                        {(parseFloat(item.unitPrice || item.productPrice) * item.quantity).toFixed(0)} ج.م
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <h3 className="font-bold text-lg mb-4 text-gray-900">ملخص فاتورة الجملة</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">إجمالي الأصناف</span>
                <span className="font-bold">{items.reduce((s, i) => s + i.quantity, 0)} قطعة</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">المجموع الفرعي</span>
                <span className="font-bold">{total.toFixed(0)} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">مصاريف الشحن</span>
                <span className="text-green-600 font-bold">مجاني للطلبات الجملة</span>
              </div>

              <hr />

              <div className="flex justify-between text-lg pt-1">
                <span className="font-bold">الإجمالي النهائي</span>
                <span className="font-black text-primary text-2xl">
                  {total.toFixed(0)} ج.م
                </span>
              </div>
            </div>

            {!isMovMet && (
              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl mt-4 leading-relaxed border border-amber-200">
                يرجى إضافة منتجات بقيمة <strong>{remainingForMov.toFixed(0)} ج.م</strong> لتتمكن من إتمام الطلب بالجملة.
              </p>
            )}

            {hasMoqViolation && (
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl mt-3 leading-relaxed border border-red-200">
                يوجد أصناف في سلتك تقل كميتها عن الحد الأدنى (MOQ). يرجى زيادة الكمية للمتابعة.
              </p>
            )}

            <button
              onClick={handleCheckoutClick}
              disabled={!isMovMet || hasMoqViolation}
              className="w-full mt-5 bg-gradient-to-l from-primary to-secondary text-white py-3.5 rounded-xl font-bold text-base hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {!user
                ? "متابعة الطلب وتسجيل الدخول 🚀"
                : "إتمام طلب الجملة 🚀"}
            </button>

            <Link
              href="/products"
              className="block text-center mt-3 text-primary text-xs font-bold hover:underline"
            >
              ← إضافة أصناف أخرى من الكتالوج
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
