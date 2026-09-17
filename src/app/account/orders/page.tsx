"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface OrderItem {
  id: number;
  productName: string;
  price: string;
  quantity: number;
}

interface Order {
  id: number;
  status: string;
  total: string;
  shippingAddress: string;
  shippingCity: string | null;
  shippingPhone: string | null;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
}

const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: "في الانتظار", color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
  confirmed: { label: "تم التأكيد", color: "bg-blue-100 text-blue-800", icon: "✅" },
  processing: { label: "قيد التجهيز", color: "bg-purple-100 text-purple-800", icon: "📦" },
  shipped: { label: "تم الشحن", color: "bg-indigo-100 text-indigo-800", icon: "🚚" },
  delivered: { label: "تم التوصيل", color: "bg-green-100 text-green-800", icon: "🎉" },
  cancelled: { label: "ملغي", color: "bg-red-100 text-red-800", icon: "❌" },
};

function OrdersContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const successId = searchParams.get("success");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((d) => {
          setOrders(d.orders || []);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-4">🔒</span>
        <h2 className="text-2xl font-bold mb-2">سجل دخولك أولاً</h2>
        <Link
          href="/auth/login"
          className="bg-gradient-to-l from-primary to-secondary text-white px-8 py-3 rounded-full font-bold inline-block"
        >
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {successId && (
        <div className="bg-green-50 border-2 border-green-200 text-green-800 px-6 py-4 rounded-2xl mb-8 text-center animate-fade-in">
          <span className="text-4xl block mb-2">🎉</span>
          <h3 className="text-xl font-bold mb-1">تم إنشاء الأوردر بنجاح!</h3>
          <p>رقم الأوردر: #{successId}</p>
          <p className="text-sm mt-1">هنتواصل معاك في أقرب وقت لتأكيد الطلب</p>
        </div>
      )}

      <h1 className="text-3xl font-black mb-8">📦 أوردراتي</h1>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-200 h-40 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl block mb-4">📋</span>
          <h3 className="text-xl font-bold mb-2">لا توجد أوردرات</h3>
          <p className="text-gray-500 mb-6">لم تقم بأي طلب بعد</p>
          <Link
            href="/products"
            className="bg-gradient-to-l from-primary to-secondary text-white px-8 py-3 rounded-full font-bold inline-block"
          >
            🛍️ ابدأ التسوق
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const st = statusLabels[order.status] || statusLabels.pending;
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-lg">طلب #{order.id}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`${st.color} px-4 py-1.5 rounded-full text-sm font-bold`}
                  >
                    {st.icon} {st.label}
                  </span>
                </div>

                {/* Status timeline */}
                <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2">
                  {["pending", "confirmed", "processing", "shipped", "delivered"].map(
                    (s, i) => {
                      const steps = ["pending", "confirmed", "processing", "shipped", "delivered"];
                      const currentIdx = steps.indexOf(order.status);
                      const isActive = i <= currentIdx && order.status !== "cancelled";
                      return (
                        <div key={s} className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isActive
                                ? "bg-primary text-white"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            {statusLabels[s]?.icon || (i + 1)}
                          </div>
                          {i < 4 && (
                            <div
                              className={`w-8 h-1 ${
                                i < currentIdx ? "bg-primary" : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                    );
                    }
                  )}
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm bg-gray-50 px-4 py-2 rounded-lg"
                    >
                      <span>
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="font-bold">
                        {(parseFloat(item.price) * item.quantity).toFixed(0)} ج.م
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total & Shipping */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="text-sm text-gray-500">
                    <p>📍 {order.shippingAddress}</p>
                    {order.shippingCity && <p>🏙️ {order.shippingCity}</p>}
                    {order.shippingPhone && <p>📞 {order.shippingPhone}</p>}
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500">الإجمالي</p>
                    <p className="text-xl font-black text-primary">
                      {parseFloat(order.total).toFixed(0)} ج.م
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8"><div className="animate-pulse h-8 w-48 bg-gray-200 rounded mb-4" /></div>}>
      <OrdersContent />
    </Suspense>
  );
}
