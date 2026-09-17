import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    const { orderId, status } = await req.json();
    await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Admin orders PATCH error:", e);
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
