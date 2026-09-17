import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { eq, desc, sql, and, ne } from "drizzle-orm";
import { getCurrentUser, hashPassword, createToken } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const allUsers = await db
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
      .orderBy(desc(users.createdAt));

    // Get order aggregations per user
    const orderStats = await db
      .select({
        userId: orders.userId,
        orderCount: sql<number>`count(${orders.id})::int`,
        totalSpent: sql<number>`coalesce(sum(${orders.total}::numeric), 0)::float`,
      })
      .from(orders)
      .groupBy(orders.userId);

    const statsMap = Object.fromEntries(
      orderStats.map((s) => [s.userId, { orderCount: s.orderCount, totalSpent: s.totalSpent }])
    );

    const usersWithStats = allUsers.map((u) => ({
      ...u,
      orderCount: statsMap[u.id]?.orderCount || 0,
      totalSpent: statsMap[u.id]?.totalSpent || 0,
    }));

    return NextResponse.json({ users: usersWithStats });
  } catch (e) {
    console.error("Admin users GET error:", e);
    return NextResponse.json({ error: "فشل استرجاع العملاء" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const body = await req.json();
    const {
      targetUserId,
      name,
      email,
      phone,
      address,
      city,
      businessName,
      taxId,
      isAdmin,
      isVerified,
      newPassword,
    } = body;

    if (!targetUserId || typeof targetUserId !== "number") {
      return NextResponse.json({ error: "معرف المستخدم غير صالح" }, { status: 400 });
    }

    // Fetch existing target user
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.id, targetUserId));

    if (!existing) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // Protect against self-demotion
    if (targetUserId === admin.userId && typeof isAdmin === "boolean" && !isAdmin) {
      return NextResponse.json(
        { error: "لا يمكنك إلغاء صلاحية الأدمن الخاصة بحسابك" },
        { status: 400 }
      );
    }

    const updateValues: Partial<typeof users.$inferInsert> = {};

    if (typeof name === "string" && name.trim()) {
      updateValues.name = name.trim();
    }

    let emailChanged = false;
    if (typeof email === "string" && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail !== existing.email.toLowerCase()) {
        const [duplicate] = await db
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.email, cleanEmail), ne(users.id, targetUserId)));

        if (duplicate) {
          return NextResponse.json(
            { error: "البريد الإلكتروني مسجل بالفعل لمستخدم آخر" },
            { status: 409 }
          );
        }
        updateValues.email = cleanEmail;
        emailChanged = true;
      }
    }

    if (phone !== undefined) updateValues.phone = phone;
    if (address !== undefined) updateValues.address = address;
    if (city !== undefined) updateValues.city = city;
    if (businessName !== undefined) updateValues.businessName = businessName;
    if (taxId !== undefined) updateValues.taxId = taxId;
    if (typeof isAdmin === "boolean") updateValues.isAdmin = isAdmin;
    if (typeof isVerified === "boolean") updateValues.isVerified = isVerified;

    if (typeof newPassword === "string" && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 6) {
        return NextResponse.json(
          { error: "كلمة المرور يجب ألا تقل عن 6 أحرف" },
          { status: 400 }
        );
      }
      updateValues.password = await hashPassword(newPassword.trim());
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateValues)
      .where(eq(users.id, targetUserId))
      .returning();

    const res = NextResponse.json({
      success: true,
      message: "تم تحديث بيانات المستخدم بنجاح",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        businessName: updatedUser.businessName,
        taxId: updatedUser.taxId,
        isAdmin: updatedUser.isAdmin,
        isVerified: updatedUser.isVerified,
      },
    });

    // If current admin updated their own email or admin status, refresh their session cookie
    if (targetUserId === admin.userId && emailChanged) {
      const newToken = await createToken({
        userId: updatedUser.id,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
      res.cookies.set("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    return res;
  } catch (e) {
    console.error("Admin users PATCH error:", e);
    return NextResponse.json({ error: "فشل تحديث المستخدم" }, { status: 500 });
  }
}
