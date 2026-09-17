"use client";

import { useState } from "react";

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

export default function AdminProductsTab({
  products,
  categories,
  onRefresh,
}: {
  products: Product[];
  categories: Category[];
  onRefresh: () => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "low" | "out">("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(initialProductForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [adjustingStockId, setAdjustingStockId] = useState<number | null>(null);

  const filteredProducts = products.filter((p) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.nameAr.toLowerCase().includes(query) ||
      p.name.toLowerCase().includes(query);

    const matchesCat = selectedCat === "all" || String(p.categoryId) === selectedCat;

    let matchesStock = true;
    if (stockFilter === "low") matchesStock = p.stock <= 20 && p.stock > 0;
    if (stockFilter === "out") matchesStock = p.stock === 0;
    if (stockFilter === "in") matchesStock = p.stock > 20;

    return matchesSearch && matchesCat && matchesStock;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(initialProductForm);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setForm({
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const payload = {
      name: form.name,
      nameAr: form.nameAr,
      descriptionAr: form.descriptionAr || null,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      minOrderQuantity: parseInt(form.minOrderQuantity) || 6,
      packageUnit: form.packageUnit,
      piecesPerPackage: parseInt(form.piecesPerPackage) || 12,
      tier1Min: form.tier1Min ? parseInt(form.tier1Min) : null,
      tier1Price: form.tier1Price ? parseFloat(form.tier1Price) : null,
      tier2Min: form.tier2Min ? parseInt(form.tier2Min) : null,
      tier2Price: form.tier2Price ? parseFloat(form.tier2Price) : null,
      image: form.image || null,
      stock: parseInt(form.stock) || 0,
      categoryId: parseInt(form.categoryId) || 1,
      isFeatured: form.isFeatured,
    };

    try {
      const res = editingProduct
        ? await fetch("/api/admin/products", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editingProduct.id, ...payload }),
          })
        : await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "خطأ أثناء الحفظ");
        setSaving(false);
        return;
      }

      setIsModalOpen(false);
      await onRefresh();
    } catch {
      setFormError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    await onRefresh();
  };

  const handleQuickStock = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    setAdjustingStockId(product.id);
    try {
      await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          name: product.name,
          nameAr: product.nameAr,
          price: parseFloat(product.price),
          stock: newStock,
          categoryId: product.categoryId,
        }),
      });
      await onRefresh();
    } finally {
      setAdjustingStockId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Filters Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="w-full sm:w-64 relative">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="ابحث باسم المنتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="all">جميع الأقسام ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.nameAr}
              </option>
            ))}
          </select>

          {/* Stock filter */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs">
            <button
              onClick={() => setStockFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                stockFilter === "all" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setStockFilter("in")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                stockFilter === "in" ? "bg-white shadow-sm text-green-700" : "text-gray-500"
              }`}
            >
              متوفر
            </button>
            <button
              onClick={() => setStockFilter("low")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                stockFilter === "low" ? "bg-white shadow-sm text-amber-700" : "text-gray-500"
              }`}
            >
              منخفض
            </button>
            <button
              onClick={() => setStockFilter("out")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                stockFilter === "out" ? "bg-white shadow-sm text-red-700" : "text-gray-500"
              }`}
            >
              نفد
            </button>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="w-full md:w-auto bg-gradient-to-l from-primary to-secondary text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:shadow-pink-200 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span>➕</span> إضافة منتج جملة جديد
        </button>
      </div>

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <span className="text-5xl block mb-3">🏷️</span>
          <h3 className="text-lg font-bold text-gray-800 mb-1">لا توجد منتجات مطابقة</h3>
          <p className="text-gray-500 text-xs">جرب تغيير معايير البحث أو تصفية الأقسام</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                <tr>
                  <th className="py-3.5 px-4 font-black">المنتج</th>
                  <th className="py-3.5 px-4 font-black">القسم</th>
                  <th className="py-3.5 px-4 font-black">سعر القطعة</th>
                  <th className="py-3.5 px-4 font-black">أسعار الجملة للكميات</th>
                  <th className="py-3.5 px-4 font-black">المخزون السريع</th>
                  <th className="py-3.5 px-4 font-black text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-pink-50/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                          {p.image ? (
                            <img src={p.image} alt={p.nameAr} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">🧴</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900 line-clamp-1">{p.nameAr}</span>
                            {p.isFeatured && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                                مميز
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 block font-sans">{p.name}</span>
                          <span className="text-[11px] text-primary font-bold">
                            📦 {p.packageUnit} (أقل كمية: {p.minOrderQuantity})
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-bold text-[11px]">
                        {p.categoryName || "غير محدد"}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-gray-900">
                      {parseFloat(p.price).toFixed(2)} ج.م
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        {p.tier1Price && (
                          <div className="text-[11px] text-green-700 font-semibold flex items-center gap-1">
                            <span>≥ {p.tier1Min}:</span>
                            <span className="font-bold">{parseFloat(p.tier1Price).toFixed(2)} ج.م</span>
                          </div>
                        )}
                        {p.tier2Price && (
                          <div className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                            <span>≥ {p.tier2Min}:</span>
                            <span className="font-bold">{parseFloat(p.tier2Price).toFixed(2)} ج.م</span>
                          </div>
                        )}
                        {!p.tier1Price && !p.tier2Price && (
                          <span className="text-[11px] text-gray-400">سعر موحد</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuickStock(p, -10)}
                          disabled={adjustingStockId === p.id || p.stock <= 0}
                          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center transition-all disabled:opacity-30"
                          title="إنقاص 10 قطع"
                        >
                          -
                        </button>
                        <span
                          className={`font-black px-2 py-0.5 rounded-md text-xs min-w-[32px] text-center ${
                            p.stock === 0
                              ? "bg-red-100 text-red-700"
                              : p.stock <= 20
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {p.stock}
                        </span>
                        <button
                          onClick={() => handleQuickStock(p, 10)}
                          disabled={adjustingStockId === p.id}
                          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center transition-all"
                          title="إضافة 10 قطع للمخزون"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="bg-gray-100 hover:bg-primary hover:text-white text-gray-700 px-2.5 py-1 rounded-lg font-bold transition-all text-xs"
                        >
                          ✏️ تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="bg-red-50 hover:bg-red-600 hover:text-white text-red-600 px-2.5 py-1 rounded-lg font-bold transition-all text-xs"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-slide-down">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-xl font-black text-gray-900">
                {editingProduct ? "✏️ تعديل منتج جملة" : "➕ إضافة منتج جملة جديد"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-xs flex items-center gap-2">
                <span>⚠️</span> {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الاسم بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={form.nameAr}
                    onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                    placeholder="مثال: سيروم فيتامين سي نقي"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الاسم بالإنجليزية *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Vitamin C Serum"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">القسم *</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">رابط الصورة (Image URL)</label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">وصف المنتج ومميزاته للصالونات</label>
                <textarea
                  rows={2}
                  value={form.descriptionAr}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  placeholder="وصف مكونات وفوائد المنتج وطريقة الاستخدام..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* B2B Packaging & Prices Box */}
              <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 space-y-4">
                <span className="text-xs font-black text-primary block">
                  🏢 مواصفات التعبئة والتسعير بالجملة
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      سعر القطعة الأساسي *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="180.00"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      سعر التجزئة المقترح
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.originalPrice}
                      onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                      placeholder="250.00"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      الحد الأدنى للطلب (MOQ)
                    </label>
                    <input
                      type="number"
                      value={form.minOrderQuantity}
                      onChange={(e) => setForm({ ...form, minOrderQuantity: e.target.value })}
                      placeholder="6"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      الكمية بالمخزن
                    </label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="50"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      وحدة التعبئة
                    </label>
                    <input
                      type="text"
                      value={form.packageUnit}
                      onChange={(e) => setForm({ ...form, packageUnit: e.target.value })}
                      placeholder="دستة (12 قطعة) أو كرتونة (24 قطعة)"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <label htmlFor="isFeatured" className="text-xs font-bold text-gray-700 cursor-pointer">
                      ⭐ تثبيت كمنتج مميز في الصفحة الرئيسية
                    </label>
                  </div>
                </div>

                {/* Tiered Wholesale Discounts */}
                <div className="pt-2 border-t border-pink-200/60">
                  <span className="text-[11px] font-bold text-gray-600 block mb-2">
                    🎯 مستويات خصم الجملة للكميات (Tiered Pricing)
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-pink-100">
                      <span className="text-[11px] font-black text-green-700 block mb-1">المستوى 1 (مثلاً: دستة)</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="الكمية (12)"
                          value={form.tier1Min}
                          onChange={(e) => setForm({ ...form, tier1Min: e.target.value })}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs"
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="السعر (160)"
                          value={form.tier1Price}
                          onChange={(e) => setForm({ ...form, tier1Price: e.target.value })}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-green-700"
                        />
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-pink-100">
                      <span className="text-[11px] font-black text-purple-700 block mb-1">المستوى 2 (مثلاً: كرتونة)</span>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="الكمية (48)"
                          value={form.tier2Min}
                          onChange={(e) => setForm({ ...form, tier2Min: e.target.value })}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs"
                        />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="السعر (140)"
                          value={form.tier2Price}
                          onChange={(e) => setForm({ ...form, tier2Price: e.target.value })}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-purple-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-l from-primary to-secondary text-white px-7 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-pink-200 transition-all disabled:opacity-50"
                >
                  {saving ? "جاري الحفظ..." : editingProduct ? "تحديث المنتج" : "إضافة المنتج"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
