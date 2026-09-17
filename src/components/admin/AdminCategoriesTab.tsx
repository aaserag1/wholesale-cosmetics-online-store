"use client";

import { useState } from "react";

interface Category {
  id: number;
  name: string;
  nameAr: string;
  slug: string;
  icon: string | null;
}

export default function AdminCategoriesTab({
  categories,
  onRefresh,
}: {
  categories: Category[];
  onRefresh: () => Promise<void>;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", nameAr: "", slug: "", icon: "🧴" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const openAddModal = () => {
    setEditingCategory(null);
    setForm({ name: "", nameAr: "", slug: "", icon: "🧴" });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      nameAr: cat.nameAr,
      slug: cat.slug,
      icon: cat.icon || "✨",
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = editingCategory
        ? await fetch("/api/admin/categories", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editingCategory.id, ...form }),
          })
        : await fetch("/api/admin/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل حفظ القسم");
        setSaving(false);
        return;
      }

      setIsModalOpen(false);
      await onRefresh();
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`هل أنت متأكد من حذف قسم "${cat.nameAr}"؟`)) return;

    const res = await fetch(`/api/admin/categories?id=${cat.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "فشل حذف القسم");
    } else {
      await onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-black text-gray-900 text-sm sm:text-base">
            📁 تصنيفات وأقسام منتجات الجملة
          </h3>
          <p className="text-gray-500 text-xs">إدارة الأقسام المعروضة في الكتالوج الرئيسي</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-gradient-to-l from-primary to-secondary text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:shadow-pink-200 transition-all active:scale-95 flex items-center gap-2"
        >
          <span>➕</span> إضافة قسم جديد
        </button>
      </div>

      {/* Categories Grid / Table */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:border-pink-200 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2 bg-pink-50 rounded-xl">{cat.icon || "✨"}</span>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{cat.nameAr}</h4>
                <span className="text-gray-400 text-xs block">{cat.name}</span>
                <span className="text-primary text-[11px] font-mono block">/{cat.slug}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => openEditModal(cat)}
                className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg text-xs"
                title="تعديل القسم"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(cat)}
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg text-xs"
                title="حذف القسم"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-slide-down">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-lg font-black text-gray-900">
                {editingCategory ? "✏️ تعديل القسم" : "➕ إضافة قسم جديد"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الاسم بالعربية *</label>
                <input
                  type="text"
                  required
                  value={form.nameAr}
                  onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                  placeholder="مثال: العناية بالأظافر"
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
                  placeholder="Nail Care"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الرابط اللطيف (Slug) *</label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="nail-care"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">الأيقونة (Emoji) *</label>
                <input
                  type="text"
                  required
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="💅"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? "جاري الحفظ..." : "حفظ القسم"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
