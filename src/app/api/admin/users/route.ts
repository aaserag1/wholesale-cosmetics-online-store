import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getCurrentUser();
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
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
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { targetUserId, isAdmin } = await req.json();
    if (!targetUserId || typeof isAdmin !== "boolean") {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    // Protect against self-demotion
    if (targetUserId === admin.userId && !isAdmin) {
      return NextResponse.json(
        { error: "لا يمكنك إلغاء صلاحية الأدمن الخاصة بحسابك" },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({ isAdmin })
      .where(eq(users.id, targetUserId));

    return NextResponse.json({ success: true, message: "تم تحديث الصلاحية بنجاح" });
  } catch (e) {
    console.error("Admin users PATCH error:", e);
    return NextResponse.json({ error: "فشل تحديث المستخدم" }, { status: 500 });
  }
}
