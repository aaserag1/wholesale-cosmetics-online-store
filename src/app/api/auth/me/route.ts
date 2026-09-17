import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hashPassword, verifyPassword, createToken, getAuthCookieOptions } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").optional(),
  email: z.string().email("البريد الإلكتروني غير صالح").optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  businessName: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف").optional(),
});

export async function GET(req: NextRequest) {
  try {
    const payload = await getCurrentUser(req);
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
        isVerified: users.isVerified,
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

    let emailChanged = false;
    if (data.email && data.email.toLowerCase().trim() !== existing.email.toLowerCase().trim()) {
      const cleanEmail = data.email.toLowerCase().trim();
      const [duplicate] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, cleanEmail), ne(users.id, payload.userId)));

      if (duplicate) {
        return NextResponse.json(
          { error: "البريد الإلكتروني مسجل بالفعل لمستخدم آخر" },
          { status: 409 }
        );
      }
      updateValues.email = cleanEmail;
      emailChanged = true;
    }

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
        isVerified: users.isVerified,
        createdAt: users.createdAt,
      });

    const res = NextResponse.json({
      message: "تم تحديث البيانات بنجاح",
      user: updatedUser,
    });

    // If email or critical info changed, reissue JWT token
    if (emailChanged) {
      const newToken = await createToken({
        userId: updatedUser.id,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
      res.cookies.set("token", newToken, getAuthCookieOptions(req));
    }

    return res;
  } catch (e) {
    console.error("Profile update error:", e);
    return NextResponse.json({ error: "فشل تحديث البيانات" }, { status: 500 });
  }
}
