"use client";

import { useState, useEffect } from "react";
import { useSettings, type SiteSettingsData } from "../SettingsContext";

export default function AdminSettingsTab() {
  const { settings, refreshSettings, updateSettings } = useSettings();
  const [formData, setFormData] = useState<SiteSettingsData>(settings);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sync state if settings change externally
  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (
    field: keyof SiteSettingsData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const result = await updateSettings(formData);
    if (result.error) {
      setStatusMessage({ type: "error", text: result.error });
    } else {
      setStatusMessage({
        type: "success",
        text: result.message || "تم حفظ وتطبيق الإعدادات على كامل المتجر بنجاح!",
      });
      await refreshSettings();
      setTimeout(() => setStatusMessage(null), 4000);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8 animate-fade-in text-right">
      {/* Header bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-2xl shadow-md">
              ⚙️
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                إعدادات وهوية المتجر العامة (Enterprise Store Settings)
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                التحكم الكامل في اسم المنصة، أرقام التواصل، الواتساب، شريط الإعلانات، وروابط السوشيال ميديا
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-l from-primary to-secondary text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-pink-200 hover:shadow-xl transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="animate-spin">⏳</span> جاري الحفظ...
              </>
            ) : (
              <>
                <span>💾</span> حفظ جميع الإعدادات
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2.5 transition-all shadow-sm ${
            statusMessage.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <span className="text-xl">
            {statusMessage.type === "success" ? "✅" : "⚠️"}
          </span>
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Brand & Names */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <span className="text-2xl">🏛️</span>
              <div>
                <h3 className="font-black text-gray-900 text-base">
                  هوية واسم المتجر (Branding)
                </h3>
                <p className="text-xs text-gray-400">
                  الاسم الظاهر في الهيدر، الفوتر، رسائل التأكيد، والفواتير
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                اسم المتجر باللغة العربية *
              </label>
              <input
                type="text"
                required
                value={formData.siteNameAr}
                onChange={(e) => handleChange("siteNameAr", e.target.value)}
                placeholder="مثال: بيوتي مارت لمستحضرات التجميل"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                اسم المتجر باللغة الإنجليزية *
              </label>
              <input
                type="text"
                required
                value={formData.siteName}
                onChange={(e) => handleChange("siteName", e.target.value)}
                placeholder="e.g. BeautyMart B2B"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                الشعار الترويجي والوصف المختصر (Tagline)
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                placeholder="مثال: المنصة الأولى لتوريد مستحضرات التجميل بالجملة للصالونات والمتاجر"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                الحد الأدنى لقيمة الطلب بالجملة (ج.م)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={formData.minOrderTotal}
                onChange={(e) => handleChange("minOrderTotal", e.target.value)}
                placeholder="500"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Card 2: Contact Channels */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <span className="text-2xl">📞</span>
              <div>
                <h3 className="font-black text-gray-900 text-base">
                  بيانات التواصل وخدمة العملاء (Contact & Support)
                </h3>
                <p className="text-xs text-gray-400">
                  تظهر في الهيدر، الفوتر، وزر الواتساب العائم
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                رقم الهاتف الأساسي للاتصال المباشر *
              </label>
              <input
                type="tel"
                required
                value={formData.contactPhone}
                onChange={(e) => handleChange("contactPhone", e.target.value)}
                placeholder="01000000000 أو +201000000000"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left"
                dir="ltr"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                يظهر أعلى الموقع وفي أسفل الصفحة ويمكن للعميل النقر عليه للاتصال فوراً.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                رقم الواتساب المباشر لطلبات الجملة *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.contactWhatsapp}
                  onChange={(e) => handleChange("contactWhatsapp", e.target.value)}
                  placeholder="201000000000 (كود الدولة + الرقم)"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-left pl-10"
                  dir="ltr"
                />
                <span className="absolute left-3 top-3 text-lg">💬</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                اكتب الرقم مع مفتاح الدولة بدون علامة + (مثال: 201012345678).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                البريد الإلكتروني الرسمي للمتجر *
              </label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
                placeholder="support@beautymart.com"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                المقر والعنوان الرئيسي
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="القاهرة، مدينة نصر، مصر"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Card 3: Announcement Bar */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📢</span>
                <div>
                  <h3 className="font-black text-gray-900 text-base">
                    شريط الإعلانات أعلى الموقع (Top Bar)
                  </h3>
                  <p className="text-xs text-gray-400">
                    لإبراز عروض الخصم الحصرية أو الشحن المجاني
                  </p>
                </div>
              </div>

              {/* Toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.announcementEnabled}
                  onChange={(e) => handleChange("announcementEnabled", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="mr-2 text-xs font-bold text-gray-700">
                  {formData.announcementEnabled ? "مفعل" : "معطل"}
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                نص الإعلان الترويجي
              </label>
              <textarea
                rows={3}
                value={formData.announcementText}
                onChange={(e) => handleChange("announcementText", e.target.value)}
                placeholder="مثال: 🔥 خصم 10% على جميع طلبيات الجملة التي تتجاوز 10,000 ج.م | شحن مجاني لكافة المحافظات"
                className="w-full border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all leading-relaxed"
              />
            </div>

            {/* Live banner preview */}
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2">
                معاينة الشريط كما يظهر للزوار:
              </p>
              {formData.announcementEnabled && formData.announcementText ? (
                <div className="bg-gradient-to-l from-gray-900 via-gray-800 to-gray-900 text-white text-xs py-2.5 px-4 rounded-xl shadow-inner flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-pink-200 font-bold truncate">
                    <span>🔥</span>
                    <span className="truncate">{formData.announcementText}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0 mr-2">📞 {formData.contactPhone}</span>
                </div>
              ) : (
                <div className="bg-gray-100 text-gray-400 text-xs py-3 px-4 rounded-xl text-center font-bold">
                  الشريط معطل حالياً (سيظهر الوصف الافتراضي)
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Social Media Links */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <span className="text-2xl">🌐</span>
              <div>
                <h3 className="font-black text-gray-900 text-base">
                  قنوات التواصل الاجتماعي (Social Media)
                </h3>
                <p className="text-xs text-gray-400">
                  روابط الحسابات الرسمية التي تظهر في فوتر المتجر
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                رابط صفحة فيسبوك (Facebook)
              </label>
              <input
                type="url"
                value={formData.facebookUrl}
                onChange={(e) => handleChange("facebookUrl", e.target.value)}
                placeholder="https://facebook.com/your-page"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                رابط حساب إنستغرام (Instagram)
              </label>
              <input
                type="url"
                value={formData.instagramUrl}
                onChange={(e) => handleChange("instagramUrl", e.target.value)}
                placeholder="https://instagram.com/your-profile"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                رابط حساب تيك توك (TikTok)
              </label>
              <input
                type="url"
                value={formData.tiktokUrl}
                onChange={(e) => handleChange("tiktokUrl", e.target.value)}
                placeholder="https://tiktok.com/@your-account"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-bold">
            ℹ️ عند الضغط على "حفظ التغييرات"، ستنعكس الأسماء والأرقام فوراً لجميع الزوار على الموقع بدون أي تأخير.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-l from-primary to-secondary text-white px-10 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-pink-200 hover:shadow-xl transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2 shrink-0"
          >
            {saving ? "جاري الحفظ..." : "💾 حفظ وتطبيق الإعدادات"}
          </button>
        </div>
      </form>
    </div>
  );
}
