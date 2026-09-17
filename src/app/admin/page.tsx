"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";
import AdminAnalyticsTab from "@/components/admin/AdminAnalyticsTab";
import AdminOrdersTab from "@/components/admin/AdminOrdersTab";
import AdminProductsTab from "@/components/admin/AdminProductsTab";
import AdminCustomersTab from "@/components/admin/AdminCustomersTab";
import AdminCategoriesTab from "@/components/admin/AdminCategoriesTab";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"analytics" | "orders" | "products" | "customers" | "categories">("analytics");

  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      const [ordersRes, productsRes, categoriesRes, usersRes] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/products?limit=200"),
        fetch("/api/categories"),
        fetch("/api/admin/users"),
      ]);

      const [ordersData, productsData, categoriesData, usersData] = await Promise.all([
        ordersRes.json(),
        productsRes.json(),
        categoriesRes.json(),
        usersRes.json(),
      ]);

      setOrders(ordersData.orders || []);
      setProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
      setUsers(usersData.users || []);
    } catch (e) {
      console.error("Admin fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    setUpdatingOrderId(orderId);
    try {
      await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      // Refresh orders
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (authLoading || (user?.isAdmin && loading)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin text-5xl mb-4">🌸</div>
        <p className="text-gray-500 font-bold">جاري تحميل لوحة تحكم الإدارة الشاملة...</p>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-4">🚫</span>
        <h2 className="text-2xl font-black text-gray-900 mb-2">منطقة غير مصرح بها</h2>
        <p className="text-gray-500 text-sm mb-6">هذه اللوحة مخصصة لإدارة منصة BeautyMart B2B فقط</p>
        <Link
          href="/"
          className="inline-block bg-gradient-to-l from-primary to-secondary text-white px-8 py-3 rounded-full font-bold shadow-lg"
        >
          العودة للمتجر
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚙️</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                لوحة تحكم إدارة المتجر (Enterprise B2B)
              </h1>
              <p className="text-gray-500 text-xs mt-0.5">
                مرحباً {user.name} • متابعة عمليات التوريد، الفواتير، المخزون، والعملاء
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/account/profile"
            className="bg-white border border-gray-200 hover:border-primary text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            🏢 بروفايل الحساب
          </Link>
          <Link
            href="/products"
            className="bg-pink-50 hover:bg-pink-100 text-primary px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            🛍️ واجهة المتجر
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "analytics"
              ? "bg-gray-900 text-white shadow-md"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <span>📊</span> التحليلات والإحصائيات
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "orders"
              ? "bg-primary text-white shadow-md shadow-pink-200"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <span>📦</span> إدارة الطلبات ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "products"
              ? "bg-primary text-white shadow-md shadow-pink-200"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <span>🏷️</span> كتالوج المنتجات ({products.length})
        </button>

        <button
          onClick={() => setActiveTab("customers")}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "customers"
              ? "bg-primary text-white shadow-md shadow-pink-200"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <span>🏢</span> الصالونات والعملاء ({users.length})
        </button>

        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === "categories"
              ? "bg-primary text-white shadow-md shadow-pink-200"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <span>📁</span> الأقسام والتصنيفات ({categories.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "analytics" && (
        <AdminAnalyticsTab orders={orders} products={products} users={users} />
      )}

      {activeTab === "orders" && (
        <AdminOrdersTab
          orders={orders}
          onUpdateStatus={handleUpdateOrderStatus}
          updatingId={updatingOrderId}
        />
      )}

      {activeTab === "products" && (
        <AdminProductsTab
          products={products}
          categories={categories}
          onRefresh={fetchAllData}
        />
      )}

      {activeTab === "customers" && (
        <AdminCustomersTab
          users={users}
          onRefresh={fetchAllData}
          currentAdminId={user.id}
        />
      )}

      {activeTab === "categories" && (
        <AdminCategoriesTab
          categories={categories}
          onRefresh={fetchAllData}
        />
      )}
    </div>
  );
}
