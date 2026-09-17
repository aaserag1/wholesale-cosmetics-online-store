import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, users, products } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    // Join orders with users
    const allOrders = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        status: orders.status,
        total: orders.total,
        shippingAddress: orders.shippingAddress,
        shippingCity: orders.shippingCity,
        shippingPhone: orders.shippingPhone,
        notes: orders.notes,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customerName: users.name,
        customerEmail: users.email,
        customerPhone: users.phone,
        businessName: users.businessName,
        taxId: users.taxId,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt));

    if (allOrders.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    const orderIds = allOrders.map((o) => o.id);
    const allItems = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        productName: orderItems.productName,
        price: orderItems.price,
        quantity: orderItems.quantity,
        packageUnit: products.packageUnit,
        image: products.image,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(inArray(orderItems.orderId, orderIds));

    const itemsByOrder: Record<number, typeof allItems> = {};
    for (const item of allItems) {
      if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = [];
      itemsByOrder[item.orderId].push(item);
    }

    const richOrders = allOrders.map((o) => ({
      ...o,
      items: itemsByOrder[o.id] || [],
    }));

    return NextResponse.json({ orders: richOrders });
  } catch (e) {
    console.error("Admin orders GET error:", e);
    return NextResponse.json({ error: "فشل استرجاع الطلبات" }, { status: 500 });
  }
}

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
