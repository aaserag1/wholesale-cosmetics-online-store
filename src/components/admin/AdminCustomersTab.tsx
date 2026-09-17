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

  const handleToggleAdmin = async (targetUser: User) => {
    const newStatus = !targetUser.isAdmin;
    const actionText = newStatus ? "ترقية هذا المستخدم ليكون مديراً للنظام؟" : "إلغاء صلاحية الإدارة من هذا المستخدم؟";
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

        <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
          <span>👥 إجمالي العملاء: <b className="text-gray-900">{users.length}</b></span>
          <span>🏢 الأنشطة التجارية: <b className="text-primary">{users.filter((u) => u.businessName).length}</b></span>
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
                  <th className="py-3.5 px-4 font-black">الطلبات</th>
                  <th className="py-3.5 px-4 font-black">إجمالي المشتريات</th>
                  <th className="py-3.5 px-4 font-black">الرتبة</th>
                  <th className="py-3.5 px-4 font-black text-center">الإجراء</th>
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
                      <span className="text-gray-400 text-[11px] line-clamp-1">{u.address || "—"}</span>
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
                      {u.id !== currentAdminId && (
                        <button
                          onClick={() => handleToggleAdmin(u)}
                          disabled={updatingUserId === u.id}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                            u.isAdmin
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                          }`}
                        >
                          {updatingUserId === u.id
                            ? "جاري التحديث..."
                            : u.isAdmin
                            ? "إلغاء الإدارة"
                            : "تعيين كمدير"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
