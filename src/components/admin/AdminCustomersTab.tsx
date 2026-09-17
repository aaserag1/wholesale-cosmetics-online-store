"use client";

import { useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  businessName: string | null;
  taxId: string | null;
  isAdmin: boolean;
  isVerified?: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export default function AdminCustomersTab({
  users,
  onRefresh,
  currentAdminId,
}: {
  users: User[];
  onRefresh: () => Promise<void>;
  currentAdminId?: number;
}) {
  const [search, setSearch] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    taxId: "",
    city: "",
    address: "",
    isAdmin: false,
    isVerified: true,
    newPassword: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Delete User Modal State
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/users?id=${deletingUser.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || "فشل حذف العميل");
      } else {
        await onRefresh();
        setDeletingUser(null);
        if (editingUser?.id === deletingUser.id) {
          setEditingUser(null);
        }
      }
    } catch {
      setDeleteError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.businessName && u.businessName.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.taxId && u.taxId.toLowerCase().includes(q))
    );
  });

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setEditForm({
      name: u.name,
      email: u.email,
      phone: u.phone || "",
      businessName: u.businessName || "",
      taxId: u.taxId || "",
      city: u.city || "",
      address: u.address || "",
      isAdmin: u.isAdmin,
      isVerified: u.isVerified ?? true,
      newPassword: "",
    });
    setEditError("");
    setEditSuccess("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSavingEdit(true);
    setEditError("");
    setEditSuccess("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: editingUser.id,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone || null,
          businessName: editForm.businessName || null,
          taxId: editForm.taxId || null,
          city: editForm.city || null,
          address: editForm.address || null,
          isAdmin: editForm.isAdmin,
          isVerified: editForm.isVerified,
          ...(editForm.newPassword ? { newPassword: editForm.newPassword } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "فشل حفظ التعديلات");
      } else {
        setEditSuccess("تم حفظ التعديلات بنجاح!");
        await onRefresh();
        setTimeout(() => {
          setEditingUser(null);
        }, 1200);
      }
    } catch {
      setEditError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleAdmin = async (targetUser: User) => {
    const newStatus = !targetUser.isAdmin;
    const actionText = newStatus
      ? "ترقية هذا المستخدم ليكون مديراً للنظام؟"
      : "إلغاء صلاحية الإدارة من هذا المستخدم؟";
    if (!confirm(`هل أنت متأكد من رغبتك في ${actionText}`)) return;

    setUpdatingUserId(targetUser.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: targetUser.id, isAdmin: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "فشل تحديث الصلاحية");
      } else {
        await onRefresh();
      }
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Stats Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="ابحث بالاسم، المتجر، الهاتف، أو الرقم الضريبي..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-600">
          <span>
            👥 إجمالي الحسابات: <b className="text-gray-900">{users.length}</b>
          </span>
          <span>
            🏢 الأنشطة التجارية:{" "}
            <b className="text-primary">{users.filter((u) => u.businessName).length}</b>
          </span>
          <span>
            👑 المدراء:{" "}
            <b className="text-purple-700">{users.filter((u) => u.isAdmin).length}</b>
          </span>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <span className="text-5xl block mb-3">👥</span>
          <h3 className="text-lg font-bold text-gray-800 mb-1">لا يوجد عملاء مطابقين</h3>
          <p className="text-gray-500 text-xs">جرب البحث بكلمات أخرى</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                <tr>
                  <th className="py-3.5 px-4 font-black">الصالون / النشاط</th>
                  <th className="py-3.5 px-4 font-black">المسؤول وبيانات الاتصال</th>
                  <th className="py-3.5 px-4 font-black">المدينة والعنوان</th>
                  <th className="py-3.5 px-4 font-black">حالة التوثيق</th>
                  <th className="py-3.5 px-4 font-black">الطلبات</th>
                  <th className="py-3.5 px-4 font-black">إجمالي المشتريات</th>
                  <th className="py-3.5 px-4 font-black">الرتبة</th>
                  <th className="py-3.5 px-4 font-black text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-pink-50/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center font-black text-base shrink-0">
                          {u.businessName ? "🏢" : "👤"}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block">
                            {u.businessName || "حساب تجزئة"}
                          </span>
                          {u.taxId ? (
                            <span className="text-[10px] text-green-700 font-mono font-bold bg-green-50 px-1.5 py-0.5 rounded">
                              ✓ {u.taxId}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">بدون رقم ضريبي</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-800 block">{u.name}</span>
                      <span className="text-gray-500 text-[11px] block">{u.email}</span>
                      <span className="text-gray-400 text-[11px] block" dir="ltr">
                        {u.phone || "—"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-700 block">{u.city || "—"}</span>
                      <span className="text-gray-400 text-[11px] line-clamp-1">
                        {u.address || "—"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {u.isVerified ?? true ? (
                        <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <span>✓</span> موثق
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <span>⏳</span> غير مفعل
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-gray-700">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-md">
                        {u.orderCount} طلب
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-black text-gray-900">
                      {u.totalSpent.toLocaleString()} ج.م
                    </td>

                    <td className="py-3.5 px-4">
                      {u.isAdmin ? (
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-purple-200">
                          👑 مدير
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          عميل
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1"
                          title="تعديل بيانات الحساب"
                        >
                          <span>✏️</span> تعديل
                        </button>

                        {u.id !== currentAdminId && (
                          <button
                            onClick={() => setDeletingUser(u)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1"
                            title="حذف العميل نهائياً"
                          >
                            <span>🗑️</span> حذف
                          </button>
                        )}

                        {u.id !== currentAdminId && (
                          <button
                            onClick={() => handleToggleAdmin(u)}
                            disabled={updatingUserId === u.id}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                              u.isAdmin
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                            }`}
                          >
                            {updatingUserId === u.id
                              ? "..."
                              : u.isAdmin
                              ? "سحب الإدارة"
                              : "تعيين مدير"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-lg font-black">
                  ✏️
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    تعديل بيانات الحساب (#{editingUser.id})
                  </h3>
                  <p className="text-xs text-gray-500">
                    {editingUser.isAdmin ? "👑 حساب مسؤول النظام" : "👤 حساب عميل / صالون"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold transition-all"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-4 text-xs font-bold flex items-center gap-2">
                <span>⚠️</span> {editError}
              </div>
            )}

            {editSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl mb-4 text-xs font-bold flex items-center gap-2">
                <span>✓</span> {editSuccess}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-right">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    اسم الصالون / المتجر
                  </label>
                  <input
                    type="text"
                    value={editForm.businessName}
                    onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                    placeholder="مثال: صالون الملكة"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    الرقم الضريبي / السجل
                  </label>
                  <input
                    type="text"
                    value={editForm.taxId}
                    onChange={(e) => setEditForm({ ...editForm, taxId: e.target.value })}
                    placeholder="TAX-123456"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    رقم الهاتف / الواتساب
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="01xxxxxxxxx"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    المدينة / المحافظة
                  </label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    placeholder="القاهرة"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  العنوان التفصيلي
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="الشارع، رقم العمارة..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Password reset option */}
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  تعيين كلمة مرور جديدة (اتركها فارغة إذا لم ترغب في التغيير)
                </label>
                <input
                  type="password"
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                  placeholder="كلمة مرور جديدة (6 أحرف على الأقل)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Checkboxes: Role & Verification */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isAdmin}
                    disabled={editingUser.id === currentAdminId}
                    onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-xs font-bold text-gray-800">
                    👑 صلاحية إدارة النظام (Admin)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isVerified}
                    onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <span className="text-xs font-bold text-gray-800">
                    ✓ الحساب مفعل وموثق
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
                {editingUser.id !== currentAdminId ? (
                  <button
                    type="button"
                    onClick={() => setDeletingUser(editingUser)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>🗑️</span> حذف هذا العميل
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-bold transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="bg-gradient-to-l from-primary to-secondary text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {savingEdit ? "جاري الحفظ..." : "💾 حفظ التعديلات"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-scale-up text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4">
              ⚠️
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-2">
              تأكيد حذف العميل
            </h3>

            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف حساب العميل{" "}
              <b className="text-gray-900">"{deletingUser.name}"</b> (
              <span className="font-mono text-xs">{deletingUser.email}</span>)؟
            </p>

            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-3 text-xs mb-6 text-right space-y-1">
              <p className="font-bold flex items-center gap-1">
                <span>⚠️</span> سيؤدي هذا الإجراء إلى:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-900/80 mr-2">
                <li>حذف الحساب نهائياً من قاعدة البيانات</li>
                <li>إلغاء سلة المشتريات الخاصة به</li>
                <li>حذف أرشيف طلبات هذا العميل ({deletingUser.orderCount} طلب)</li>
              </ul>
            </div>

            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-4 text-xs font-bold flex items-center gap-2 text-right">
                <span>⚠️</span> {deleteError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={isDeleting}
                className="flex-1 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-2xl text-sm font-bold transition-all disabled:opacity-50"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-red-200 transition-all disabled:opacity-50 active:scale-95"
              >
                {isDeleting ? "جاري الحذف..." : "نعم، احذف نهائياً"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
