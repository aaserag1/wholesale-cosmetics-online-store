"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

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
  categoryId: number;
  categoryName: string | null;
  isFeatured: boolean;
}

interface Category {
  id: number;
  nameAr: string;
  slug: string;
}

const statusOptions = [
  { value: "pending", label: "⏳ في الانتظار" },
  { value: "confirmed", label: "✅ تم التأكيد" },
  { value: "processing", label: "📦 قيد التجهيز" },
  { value: "shipped", label: "🚚 تم الشحن" },
  { value: "delivered", label: "🎉 تم التوصيل" },
  { value: "cancelled", label: "❌ ملغي" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const initialProductForm = {
  name: "",
  nameAr: "",
  descriptionAr: "",
  price: "",
  originalPrice: "",
  minOrderQuantity: "6",
  packageUnit: "دستة (12 قطعة)",
  piecesPerPackage: "12",
  tier1Min: "12",
  tier1Price: "",
  tier2Min: "48",
  tier2Price: "",
  image: "",
  stock: "50",
  categoryId: "1",
  isFeatured: false,
};

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "stats">("orders");

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (user?.isAdmin) {
      fetchOrders();
      fetchCategories();
      fetchProducts();
    }
  }, [user]);

  const fetchOrders = async () => {
    const res = await fetch("/api/orders?all=true");
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data.categories || []);
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    const res = await fetch("/api/products?limit=100");
    const data = await res.json();
    setProducts(data.products || []);
    setProductsLoading(false);
  };

  const updateStatus = async (orderId: number, status: string) => {
    setUpdatingId(orderId);
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    await fetchOrders();
    setUpdatingId(null);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm(initialProductForm);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      nameAr: p.nameAr,
      descriptionAr: p.descriptionAr || "",
      price: p.price,
      originalPrice: p.originalPrice || "",
      minOrderQuantity: String(p.minOrderQuantity || 6),
      packageUnit: p.packageUnit || "دستة (12 قطعة)",
      piecesPerPackage: String(p.piecesPerPackage || 12),
      tier1Min: p.tier1Min ? String(p.tier1Min) : "12",
      tier1Price: p.tier1Price || "",
      tier2Min: p.tier2Min ? String(p.tier2Min) : "48",
      tier2Price: p.tier2Price || "",
      image: p.image || "",
      stock: String(p.stock),
      categoryId: String(p.categoryId || 1),
      isFeatured: p.isFeatured || false,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    setFormError("");

    const payload = {
      name: productForm.name,
      nameAr: productForm.nameAr,
      descriptionAr: productForm.descriptionAr || null,
      price: parseFloat(productForm.price),
      originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
      minOrderQuantity: parseInt(productForm.minOrderQuantity) || 6,
      packageUnit: productForm.packageUnit,
      piecesPerPackage: parseInt(productForm.piecesPerPackage) || 12,
      tier1Min: productForm.tier1Min ? parseInt(productForm.tier1Min) : null,
      tier1Price: productForm.tier1Price ? parseFloat(productForm.tier1Price) : null,
      tier2Min: productForm.tier2Min ? parseInt(productForm.tier2Min) : null,
      tier2Price: productForm.tier2Price ? parseFloat(productForm.tier2Price) : null,
      image: productForm.image || null,
      stock: parseInt(productForm.stock) || 0,
      categoryId: parseInt(productForm.categoryId) || 1,
      isFeatured: productForm.isFeatured,
    };

    try {
      let res;
      if (editingProduct) {
        res = await fetch("/api/admin/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });
      } else {
        res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "خطأ أثناء الحفظ");
        setFormSaving(false);
        return;
      }

      setIsModalOpen(false);
      await fetchProducts();
    } catch {
      setFormError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا المنتج؟")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    await fetchProducts();
  };

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-4">🚫</span>
        <h2 className="text-2xl font-bold mb-2">غير مصرح</h2>
        <p className="text-gray-500 mb-6">هذه الصفحة متاحة فقط لإدارة بيوتي مارت</p>
        <Link
          href="/"
          className="bg-gradient-to-l from-primary to-secondary text-white px-8 py-3 rounded-full font-bold inline-block"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    totalRevenue: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + parseFloat(o.total), 0),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black">⚙️ لوحة تحكم الجملة</h1>
          <p className="text-gray-500 text-sm">مرحباً {user.name} - إدارة المبيعات والمخزون</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
              activeTab === "orders"
                ? "bg-primary text-white shadow-md shadow-pink-200"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            📦 طلبات الجملة ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
              activeTab === "products"
                ? "bg-primary text-white shadow-md shadow-pink-200"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            🏷️ إدارة المنتجات ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
              activeTab === "stats"
                ? "bg-primary text-white shadow-md shadow-pink-200"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            📊 إحصائيات المبيعات
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-3xl font-black gradient-text">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">إجمالي الأوردرات</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-yellow-200 text-center">
          <p className="text-3xl font-black text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-gray-500 mt-1">في الانتظار</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-200 text-center">
          <p className="text-3xl font-black text-purple-600">{stats.processing}</p>
          <p className="text-xs text-gray-500 mt-1">قيد التجهيز</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-200 text-center">
          <p className="text-3xl font-black text-indigo-600">{stats.shipped}</p>
          <p className="text-xs text-gray-500 mt-1">تم الشحن</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-200 text-center">
          <p className="text-3xl font-black text-green-600">{stats.delivered}</p>
          <p className="text-xs text-gray-500 mt-1">تم التوصيل</p>
        </div>
        <div className="bg-gradient-to-l from-primary to-secondary rounded-2xl p-4 text-white text-center">
          <p className="text-2xl font-black">{stats.totalRevenue.toFixed(0)}</p>
          <p className="text-xs opacity-80 mt-1">إجمالي المبيعات ج.م</p>
        </div>
      </div>

      {/* TAB 1: PRODUCTS MANAGEMENT */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-gray-800">قائمة مستحضرات التجميل بالجملة</h2>
              <p className="text-xs text-gray-500 mt-0.5">تحكم في الأسعار، الحد الأدنى للطلب (MOQ)، والمخزون</p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-gradient-to-l from-primary to-secondary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-pink-200 transition-all flex items-center gap-1.5"
            >
              <span>➕</span> إضافة منتج جملة جديد
            </button>
          </div>

          {productsLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs">
                  <tr>
                    <th className="p-4">المنتج</th>
                    <th className="p-4">القسم</th>
                    <th className="p-4">سعر القطعة</th>
                    <th className="p-4">سعر الدستة / الكرتونة</th>
                    <th className="p-4">أقل طلب (MOQ)</th>
                    <th className="p-4">المخزون</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-pink-50 rounded-xl overflow-hidden shrink-0">
                            {p.image ? (
                              <img src={p.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">🧴</div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 line-clamp-1">{p.nameAr}</p>
                            <p className="text-[11px] text-gray-400">{p.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-medium">
                          {p.categoryName || "عام"}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-primary">
                        {parseFloat(p.price).toFixed(0)} ج.م
                      </td>
                      <td className="p-4 text-xs">
                        {p.tier1Price ? (
                          <div className="text-green-700 font-semibold">
                            {parseFloat(p.tier1Price).toFixed(0)} ج.م ({p.tier1Min}+ ق)
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                        {p.tier2Price && (
                          <div className="text-purple-700 font-semibold">
                            {parseFloat(p.tier2Price).toFixed(0)} ج.م ({p.tier2Min}+ ق)
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-xs">
                          {p.minOrderQuantity || 6} قطع
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-bold text-xs px-2.5 py-1 rounded-full ${
                            p.stock > 20
                              ? "bg-green-50 text-green-700"
                              : p.stock > 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {p.stock} قطعة
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded-lg text-xs font-bold transition-colors"
                            title="تعديل"
                          >
                            ✏️ تعديل
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-lg text-xs font-bold transition-colors"
                            title="حذف"
                          >
                            🗑️ حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 h-40 rounded-2xl" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <span className="text-6xl block mb-4">📋</span>
              <h3 className="text-xl font-bold">لا توجد أوردرات مسجلة بعد</h3>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">طلب جملة #{order.id}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className={`${statusColors[order.status]} border-0 rounded-xl px-3 py-2 font-bold text-xs cursor-pointer focus:outline-none`}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-xs bg-gray-50 px-4 py-2.5 rounded-xl"
                    >
                      <span className="font-medium text-gray-800">
                        {item.productName} × {item.quantity} قطعة
                      </span>
                      <span className="font-black text-gray-900">
                        {(parseFloat(item.price) * item.quantity).toFixed(0)} ج.م
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4 flex-wrap gap-2">
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>📍 {order.shippingAddress}</p>
                    {order.shippingCity && <p>🏙️ المدينة: {order.shippingCity}</p>}
                    {order.shippingPhone && <p>📞 هاتف: {order.shippingPhone}</p>}
                    {order.notes && <p className="text-amber-800 font-medium">📝 {order.notes}</p>}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400">إجمالي الفاتورة</p>
                    <p className="text-2xl font-black text-primary">
                      {parseFloat(order.total).toFixed(0)} ج.م
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: STATS */}
      {activeTab === "stats" && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">📊 ملخص وتوزيع مبيعات الجملة</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              {statusOptions.map((opt) => {
                const count = orders.filter((o) => o.status === opt.value).length;
                const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;
                return (
                  <div key={opt.value}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>{opt.label}</span>
                      <span>{count} طلب ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-l from-primary to-secondary rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center border-r md:border-r-gray-100 pr-4">
              <div className="text-center">
                <p className="text-5xl md:text-6xl font-black gradient-text">
                  {stats.totalRevenue.toFixed(0)}
                </p>
                <p className="text-gray-500 mt-2 font-bold">إجمالي إيرادات الجملة (ج.م)</p>
                <p className="text-xs text-gray-400 mt-1">
                  متوسط قيمة فاتورة التاجر: {stats.total > 0 ? (stats.totalRevenue / stats.total).toFixed(0) : 0} ج.م
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-gray-800">
                {editingProduct ? "✏️ تعديل بيانات منتج الجملة" : "➕ إضافة منتج جملة جديد"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-xs font-bold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">الاسم بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={productForm.nameAr}
                    onChange={(e) => setProductForm({ ...productForm, nameAr: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary"
                    placeholder="مثال: سيروم الهيالورونيك المرطب"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">الاسم بالإنجليزية *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary"
                    placeholder="Hyaluronic Serum"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">القسم *</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nameAr}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">سعر القطعة (ج.م) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">المخزون الكلي *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary"
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Wholesale Specifications */}
              <div className="bg-pink-50/50 border border-pink-100 rounded-2xl p-4 space-y-3">
                <h3 className="font-black text-primary text-sm">مواصفات وشرائح الجملة (B2B):</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">أقل كمية للطلب (MOQ) *</label>
                    <input
                      type="number"
                      required
                      value={productForm.minOrderQuantity}
                      onChange={(e) => setProductForm({ ...productForm, minOrderQuantity: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
                      placeholder="6"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">وحدة التعبئة</label>
                    <input
                      type="text"
                      value={productForm.packageUnit}
                      onChange={(e) => setProductForm({ ...productForm, packageUnit: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
                      placeholder="دستة (12 قطعة)"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">عدد القطع بالعبوة</label>
                    <input
                      type="number"
                      value={productForm.piecesPerPackage}
                      onChange={(e) => setProductForm({ ...productForm, piecesPerPackage: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
                      placeholder="12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-pink-100">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">شريحة 1 (الكمية)</label>
                    <input
                      type="number"
                      value={productForm.tier1Min}
                      onChange={(e) => setProductForm({ ...productForm, tier1Min: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none"
                      placeholder="12"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">سعر الشريحة 1 (ج.م)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.tier1Price}
                      onChange={(e) => setProductForm({ ...productForm, tier1Price: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">شريحة 2 (الكمية)</label>
                    <input
                      type="number"
                      value={productForm.tier2Min}
                      onChange={(e) => setProductForm({ ...productForm, tier2Min: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none"
                      placeholder="48"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">سعر الشريحة 2 (ج.م)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.tier2Price}
                      onChange={(e) => setProductForm({ ...productForm, tier2Price: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none"
                      placeholder="90"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">رابط الصورة (URL)</label>
                <input
                  type="url"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">الوصف بالعربية</label>
                <textarea
                  value={productForm.descriptionAr}
                  onChange={(e) => setProductForm({ ...productForm, descriptionAr: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary resize-none"
                  rows={2}
                  placeholder="تفاصيل المنتج والمواصفات للتجار..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={productForm.isFeatured}
                  onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded text-primary"
                />
                <label htmlFor="isFeatured" className="font-bold text-gray-700 cursor-pointer">
                  عرض في المنتجات المميزة بالرئيسية ⭐
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={formSaving}
                  className="flex-1 bg-gradient-to-l from-primary to-secondary text-white py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {formSaving ? "جاري الحفظ..." : "💾 حفظ بيانات المنتج"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
