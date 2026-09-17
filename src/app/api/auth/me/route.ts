import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  businessName: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف").optional(),
});

export async function GET() {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        address: users.address,
        city: users.city,
        businessName: users.businessName,
        taxId: users.taxId,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, payload.userId));
    return NextResponse.json({ user: user || null });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Fetch existing user to verify password if requested
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId));

    if (!existing) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const updateValues: Partial<typeof users.$inferInsert> = {};

    if (data.name !== undefined) updateValues.name = data.name;
    if (data.phone !== undefined) updateValues.phone = data.phone;
    if (data.address !== undefined) updateValues.address = data.address;
    if (data.city !== undefined) updateValues.city = data.city;
    if (data.businessName !== undefined) updateValues.businessName = data.businessName;
    if (data.taxId !== undefined) updateValues.taxId = data.taxId;

    // Handle password change
    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json(
          { error: "يرجى إدخال كلمة المرور الحالية لتغيير كلمة المرور" },
          { status: 400 }
        );
      }
      const isMatch = await verifyPassword(data.currentPassword, existing.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: "كلمة المرور الحالية غير صحيحة" },
          { status: 400 }
        );
      }
      updateValues.password = await hashPassword(data.newPassword);
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateValues)
      .where(eq(users.id, payload.userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        address: users.address,
        city: users.city,
        businessName: users.businessName,
        taxId: users.taxId,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
      });

    return NextResponse.json({
      message: "تم تحديث البيانات بنجاح",
      user: updatedUser,
    });
  } catch (e) {
    console.error("Profile update error:", e);
    return NextResponse.json({ error: "فشل تحديث البيانات" }, { status: 500 });
  }
}
