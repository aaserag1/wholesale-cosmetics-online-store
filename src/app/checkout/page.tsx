"use client";

import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const MIN_ORDER_VALUE = 1000;

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    shippingAddress: "",
    shippingCity: "",
    shippingPhone: "",
    businessName: "",
    notes: "",
  });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-4">🔒</span>
        <h2 className="text-2xl font-bold mb-2">سجل دخولك أولاً لإتمام طلب الجملة</h2>
        <p className="text-gray-500 mb-6">سجل الدخول لحساب التاجر الخاص بك لمتابعة الفاتورة وشحن الطلب</p>
        <Link
          href="/auth/login?redirect=/checkout"
          className="bg-gradient-to-l from-primary to-secondary text-white px-8 py-3 rounded-full font-bold inline-block shadow-lg hover:shadow-pink-200 transition-all"
        >
          تسجيل الدخول / إنشاء حساب
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-4">🛒</span>
        <h2 className="text-2xl font-bold mb-2">سلة المشتريات فارغة</h2>
        <Link
          href="/products"
          className="bg-gradient-to-l from-primary to-secondary text-white px-8 py-3 rounded-full font-bold inline-block"
        >
          تصفح كتالوج الجملة
        </Link>
      </div>
    );
  }

  if (total < MIN_ORDER_VALUE) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-4">⚠️</span>
        <h2 className="text-2xl font-bold mb-2">قيمة الطلب أقل من الحد الأدنى للجملة</h2>
        <p className="text-gray-600 mb-6">
          الحد الأدنى لطلب الجملة هو <strong>{MIN_ORDER_VALUE} ج.م</strong>. قيمة سلتك الحالية هي <strong>{total.toFixed(0)} ج.م</strong>.
        </p>
        <Link
          href="/products"
          className="bg-gradient-to-l from-primary to-secondary text-white px-8 py-3 rounded-full font-bold inline-block shadow-lg hover:shadow-pink-200 transition-all"
        >
          ← العودة لإضافة أصناف أخرى
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }
      await clearCart();
      router.push(`/account/orders?success=${data.order.id}`);
    } catch {
      setError("حدث خطأ أثناء إنشاء الطلب");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-8">📦 إتمام طلب الجملة</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4">بيانات المنشأة والشحن</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المتجر / الصالون / المؤسسة (اختياري)
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) =>
                    setForm({ ...form, businessName: e.target.value })
                  }
                  placeholder="مثال: صالون لمسة جمال / سنتر تجميل الورد"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  العنوان بالتفصيل لاستلام البضاعة *
                </label>
                <textarea
                  required
                  value={form.shippingAddress}
                  onChange={(e) =>
                    setForm({ ...form, shippingAddress: e.target.value })
                  }
                  placeholder="المحافظة، الحي، اسم الشارع، رقم العمارة أو المحل..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المدينة / المركز
                </label>
                <input
                  type="text"
                  value={form.shippingCity}
                  onChange={(e) =>
                    setForm({ ...form, shippingCity: e.target.value })
                  }
                  placeholder="القاهرة، الجيزة، الإسكندرية، المنصورة..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف للتواصل والتأكيد *
                </label>
                <input
                  type="tel"
                  required
                  value={form.shippingPhone}
                  onChange={(e) =>
                    setForm({ ...form, shippingPhone: e.target.value })
                  }
                  placeholder="01xxxxxxxxx"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظات الشحن أو تجهيز البضاعة
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  placeholder="أي تعليمات خاصة بالسائق أو مواعيد الاستلام..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  rows={2}
                />
              </div>
            </div>

            {/* Payment method */}
            <div className="mt-6">
              <h3 className="font-bold text-base mb-3">طريقة الدفع</h3>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-bold text-green-800 text-sm">الدفع عند الاستلام (COD)</p>
                  <p className="text-xs text-green-600">افحص البضاعة واستلم الفاتورة الضريبية وادفع للمندوب</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-l from-primary to-secondary text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? "جاري تأكيد الطلب..." : `تأكيد طلب الجملة - ${total.toFixed(0)} ج.م`}
            </button>
          </div>
        </form>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <h3 className="font-bold text-lg mb-4">فاتورة الطلب</h3>
            <div className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 text-sm pb-2 border-b border-gray-50"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        🧴
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-bold text-xs text-gray-800">{item.productName}</p>
                    <p className="text-gray-500 text-[11px]">الكمية: {item.quantity} قطعة</p>
                  </div>
                  <span className="font-bold text-xs shrink-0">
                    {(parseFloat(item.unitPrice || item.productPrice) * item.quantity).toFixed(0)} ج.م
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">المجموع الفرعي</span>
                <span>{total.toFixed(0)} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">الشحن لكافة المحافظات</span>
                <span className="text-green-600 font-bold">مجاني</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg pt-1">
                <span className="font-bold">الإجمالي النهائي</span>
                <span className="font-black text-primary text-xl">
                  {total.toFixed(0)} ج.م
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
