import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [settings] = await db.select().from(siteSettings).limit(1);

    if (settings) {
      return NextResponse.json({ settings });
    }

    // Initialize default settings if table is empty
    const [created] = await db
      .insert(siteSettings)
      .values({
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
      })
      .returning();

    return NextResponse.json({ settings: created });
  } catch (e) {
    console.error("Settings GET error:", e);
    // Return hardcoded fallback if database query fails
    return NextResponse.json({
      settings: {
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
      },
    });
  }
}
