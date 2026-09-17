"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface SiteSettingsData {
  id?: number;
  siteName: string;
  siteNameAr: string;
  tagline: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
  address: string;
  announcementText: string;
  announcementEnabled: boolean;
  minOrderTotal: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
}

const defaultSettings: SiteSettingsData = {
  siteName: "BeautyMart",
  siteNameAr: "بيوتي مارت",
  tagline: "المنصة الأولى لتوريد مستحضرات التجميل بالجملة",
  contactPhone: "01000000000",
  contactWhatsapp: "201000000000",
  contactEmail: "info@beautymart.com",
  address: "القاهرة، جمهورية مصر العربية",
  announcementText: "🔥 خصم 10% على جميع طلبيات الجملة التي تتجاوز 10,000 ج.م | شحن لجميع المحافظات",
  announcementEnabled: true,
  minOrderTotal: "500.00",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
};

interface SettingsContextType {
  settings: SiteSettingsData;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (
    newSettings: Partial<SiteSettingsData>
  ) => Promise<{ error?: string; message?: string }>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: false,
  refreshSettings: async () => {},
  updateSettings: async () => ({}),
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data?.settings) {
        setSettings(data.settings);
      }
    } catch {
      // keep fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSettings = async (newSettings: Partial<SiteSettingsData>) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("beautymart_token")
          : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers,
        body: JSON.stringify(newSettings),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || "فشل حفظ الإعدادات" };
      }

      if (data.settings) {
        setSettings(data.settings);
      }
      return { message: data.message };
    } catch {
      return { error: "حدث خطأ في الاتصال بالخادم" };
    }
  };

  return (
    <SettingsContext.Provider
      value={{ settings, loading, refreshSettings, updateSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
