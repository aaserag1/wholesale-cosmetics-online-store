import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getCurrentUser(req);
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = await req.json();

    const [existing] = await db.select().from(siteSettings).limit(1);

    const updateData: Partial<typeof siteSettings.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (typeof body.siteName === "string") updateData.siteName = body.siteName.trim();
    if (typeof body.siteNameAr === "string") updateData.siteNameAr = body.siteNameAr.trim();
    if (typeof body.tagline === "string") updateData.tagline = body.tagline.trim();
    if (typeof body.contactPhone === "string") updateData.contactPhone = body.contactPhone.trim();
    if (typeof body.contactWhatsapp === "string") updateData.contactWhatsapp = body.contactWhatsapp.trim();
    if (typeof body.contactEmail === "string") updateData.contactEmail = body.contactEmail.trim();
    if (typeof body.address === "string") updateData.address = body.address.trim();
    if (typeof body.announcementText === "string") updateData.announcementText = body.announcementText.trim();
    if (typeof body.announcementEnabled === "boolean") updateData.announcementEnabled = body.announcementEnabled;
    if (body.minOrderTotal !== undefined) updateData.minOrderTotal = String(body.minOrderTotal);
    if (typeof body.facebookUrl === "string") updateData.facebookUrl = body.facebookUrl.trim();
    if (typeof body.instagramUrl === "string") updateData.instagramUrl = body.instagramUrl.trim();
    if (typeof body.tiktokUrl === "string") updateData.tiktokUrl = body.tiktokUrl.trim();

    let savedSettings;

    if (existing) {
      const [updated] = await db
        .update(siteSettings)
        .set(updateData)
        .where(eq(siteSettings.id, existing.id))
        .returning();
      savedSettings = updated;
    } else {
      const [inserted] = await db
        .insert(siteSettings)
        .values({
          siteName: updateData.siteName || "BeautyMart",
          siteNameAr: updateData.siteNameAr || "بيوتي مارت",
          tagline: updateData.tagline || "المنصة الأولى لتوريد مستحضرات التجميل بالجملة",
          contactPhone: updateData.contactPhone || "01000000000",
          contactWhatsapp: updateData.contactWhatsapp || "201000000000",
          contactEmail: updateData.contactEmail || "info@beautymart.com",
          address: updateData.address || "القاهرة، جمهورية مصر العربية",
          announcementText: updateData.announcementText || "🔥 خصم 10% على جميع طلبيات الجملة التي تتجاوز 10,000 ج.م",
          announcementEnabled: updateData.announcementEnabled ?? true,
          minOrderTotal: updateData.minOrderTotal || "500.00",
          facebookUrl: updateData.facebookUrl || "",
          instagramUrl: updateData.instagramUrl || "",
          tiktokUrl: updateData.tiktokUrl || "",
        })
        .returning();
      savedSettings = inserted;
    }

    return NextResponse.json({
      success: true,
      message: "تم حفظ وتحديث إعدادات المتجر العامة بنجاح!",
      settings: savedSettings,
    });
  } catch (e) {
    console.error("Admin settings PATCH error:", e);
    return NextResponse.json({ error: "حدث خطأ أثناء حفظ الإعدادات" }, { status: 500 });
  }
}
