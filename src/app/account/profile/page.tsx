"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading, updateProfile } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    taxId: "",
    city: "",
    address: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // User stats
  const [ordersCount, setOrdersCount] = useState<number | null>(null);
  const [totalSpent, setTotalSpent] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        businessName: user.businessName || "",
        taxId: user.taxId || "",
        city: user.city || "",
        address: user.address || "",
      });

      // Fetch user orders summary
      fetch("/api/orders")
        .then((r) => r.json())
        .then((d) => {
          if (d.orders) {
            setOrdersCount(d.orders.length);
            const total = d.orders.reduce(
              (sum: number, o: { total: string; status: string }) =>
                o.status !== "cancelled" ? sum + parseFloat(o.total || "0") : sum,
              0
            );
            setTotalSpent(total);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin text-5xl mb-4">🌸</div>
        <p className="text-gray-500 font-medium">جاري تحميل بيانات الملف الشخصي...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-4">🔒</span>
        <h1 className="text-2xl font-black mb-2">يرجى تسجيل الدخول</h1>
        <p className="text-gray-500 mb-6">يجب تسجيل الدخول لعرض وتعديل ملفك الشخصي</p>
        <Link
          href="/auth/login"
          className="inline-block bg-gradient-to-l from-primary to-secondary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-pink-200 transition-all"
        >
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess("");

    const res = await updateProfile({
      name: form.name,
      phone: form.phone,
      businessName: form.businessName,
      taxId: form.taxId,
      city: form.city,
      address: form.address,
    });

    setProfileSaving(false);
    if (res.error) {
      setProfileError(res.error);
    } else {
      setProfileSuccess(res.message || "تم حفظ بيانات النشاط التجاري بنجاح!");
      setTimeout(() => setProfileSuccess(""), 4000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("كلمة المرور الجديدة غير متطابقة مع تأكيد كلمة المرور");
      setPasswordSaving(false);
      return;
    }

    const res = await updateProfile({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });

    setPasswordSaving(false);
    if (res.error) {
      setPasswordError(res.error);
    } else {
      setPasswordSuccess("تم تغيير كلمة المرور بنجاح!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setPasswordSuccess(""), 4000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header Profile Card */}
      <div className="bg-gradient-to-r from-pink-50 via-white to-purple-50 rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-4xl shadow-md font-black">
            {user.businessName ? "🏢" : "👤"}
          </div>
          <div className="flex-1 text-center sm:text-right">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                {user.businessName || user.name}
              </h1>
              {user.businessName && (
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  <span>✓</span> حساب تجاري معتمد
                </span>
              )}
              {user.isAdmin && (
                <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-bold">
                  👑 مسؤول النظام
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm mb-4">
              مسؤول الحساب: <span className="font-semibold text-gray-800">{user.name}</span> •{" "}
              {user.email}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <Link
                href="/account/orders"
                className="bg-white border border-gray-200 hover:border-primary text-gray-700 hover:text-primary px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>📦</span> سجل الطلبات
              </Link>
              <Link
                href="/account/wishlist"
                className="bg-white border border-gray-200 hover:border-pink-500 text-gray-700 hover:text-pink-600 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>❤️</span> قائمة المفضلة
              </Link>
              {user.isAdmin && (
                <Link
                  href="/admin"
                  className="bg-secondary/10 text-secondary hover:bg-secondary hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5"
                >
                  <span>⚙️</span> لوحة تحكم الإدارة
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-pink-100/70">
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center border border-gray-100">
            <span className="text-2xl font-black gradient-text block">
              {ordersCount !== null ? ordersCount : "..."}
            </span>
            <span className="text-xs font-semibold text-gray-500">إجمالي الطلبات</span>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center border border-gray-100">
            <span className="text-2xl font-black text-gray-900 block">
              {totalSpent !== null ? `${totalSpent.toLocaleString()} ج.م` : "..."}
            </span>
            <span className="text-xs font-semibold text-gray-500">إجمالي المشتريات بالجملة</span>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center border border-gray-100">
            <span className="text-sm font-black text-gray-800 block truncate">
              {user.taxId || "غير مسجل"}
            </span>
            <span className="text-xs font-semibold text-gray-500">السجل التجاري / الضريبي</span>
          </div>

          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center border border-gray-100">
            <span className="text-sm font-black text-gray-800 block truncate">
              {user.city || "لم يحدد"}
            </span>
            <span className="text-xs font-semibold text-gray-500">محافظة التسليم</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-4 px-6 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "profile"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>🏢</span> بيانات النشاط التجاري والشحن
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`pb-4 px-6 font-bold text-sm sm:text-base border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "security"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>🔐</span> الأمان وكلمة المرور
        </button>
      </div>

      {/* Profile Details Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <span>📋</span> تعديل بيانات التاجر / الصالون
          </h2>

          {profileError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm flex items-center gap-2">
              <span>⚠️</span> {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl mb-6 text-sm flex items-center gap-2">
              <span>✓</span> {profileSuccess}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  اسم المسؤول / المشتري *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  البريد الإلكتروني (المسجل)
                </label>
                <input
                  type="email"
                  disabled
                  value={form.email}
                  className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  اسم المتجر / الصالون / المركز التجاري
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder="مثال: صالون الملكة للتجميل"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  رقم السجل التجاري / البطاقة الضريبية
                </label>
                <input
                  type="text"
                  value={form.taxId}
                  onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                  placeholder="TAX-12345678"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  رقم الهاتف / الواتساب للتواصل *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="01xxxxxxxxx"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  المحافظة / المدينة الافتراضية للتسليم
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="القاهرة / الجيزة / الإسكندرية..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                العنوان التفصيلي للتوريد والشحن
              </label>
              <textarea
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="الشارع، رقم المبنى، المعلم المميز..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={profileSaving}
                className="bg-gradient-to-l from-primary to-secondary text-white px-8 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
              >
                {profileSaving ? "جاري الحفظ..." : "💾 حفظ بيانات النشاط التجاري"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm max-w-2xl">
          <h2 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-2">
            <span>🔒</span> تغيير كلمة المرور
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            احرص على استخدام كلمة مرور قوية للحفاظ على أمان حسابك التجاري وبيانات فواتيرك.
          </p>

          {passwordError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm flex items-center gap-2">
              <span>⚠️</span> {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl mb-6 text-sm flex items-center gap-2">
              <span>✓</span> {passwordSuccess}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                كلمة المرور الحالية *
              </label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                placeholder="أدخل كلمة المرور الحالية"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                كلمة المرور الجديدة * (6 أحرف على الأقل)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                placeholder="أدخل كلمة المرور الجديدة"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                تأكيد كلمة المرور الجديدة *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                placeholder="أعد إدخال كلمة المرور الجديدة"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={passwordSaving}
                className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
              >
                {passwordSaving ? "جاري التحديث..." : "🔑 تحديث كلمة المرور"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
