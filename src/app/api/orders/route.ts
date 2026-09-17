import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, cartItems, products } from "@/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { orderSchema, MIN_ORDER_VALUE } from "@/lib/validations";

function getWholesalePrice(item: {
  quantity: number;
  price: string;
  tier1Min: number | null;
  tier1Price: string | null;
  tier2Min: number | null;
  tier2Price: string | null;
}): number {
  if (item.tier2Min && item.tier2Price && item.quantity >= item.tier2Min) {
    return parseFloat(item.tier2Price);
  }
  if (item.tier1Min && item.tier1Price && item.quantity >= item.tier1Min) {
    return parseFloat(item.tier1Price);
  }
  return parseFloat(item.price);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    // Admin can see all orders
    const whereClause = all && user.isAdmin ? undefined : eq(orders.userId, user.userId);

    const userOrders = await db
      .select({
        id: orders.id,
        status: orders.status,
        total: orders.total,
        shippingAddress: orders.shippingAddress,
        shippingCity: orders.shippingCity,
        shippingPhone: orders.shippingPhone,
        notes: orders.notes,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt));

    if (userOrders.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    // Solve N+1: fetch all items for these orders in one query
    const orderIds = userOrders.map((o) => o.id);
    const allItems = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productName: orderItems.productName,
        price: orderItems.price,
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    const itemsByOrder = allItems.reduce<Record<number, typeof allItems>>((acc, item) => {
      if (!acc[item.orderId]) acc[item.orderId] = [];
      acc[item.orderId].push(item);
      return acc;
    }, {});

    const ordersWithItems = userOrders.map((order) => ({
      ...order,
      items: itemsByOrder[order.id] || [],
    }));

    return NextResponse.json({ orders: ordersWithItems });
  } catch (e) {
    console.error("Orders GET error:", e);
    return NextResponse.json({ error: "خطأ في جلب الأوردرات" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const { shippingAddress, shippingCity, shippingPhone, businessName, notes } = parsed.data;

    // Get cart items with wholesale info
    const cart = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        productName: products.nameAr,
        price: products.price,
        stock: products.stock,
        minOrderQuantity: products.minOrderQuantity,
        tier1Min: products.tier1Min,
        tier1Price: products.tier1Price,
        tier2Min: products.tier2Min,
        tier2Price: products.tier2Price,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, user.userId));

    if (cart.length === 0) {
      return NextResponse.json({ error: "السلة فارغة" }, { status: 400 });
    }

    // Check MOQ for each item
    for (const item of cart) {
      if (item.quantity < item.minOrderQuantity) {
        return NextResponse.json(
          {
            error: `أقل كمية للطلب من "${item.productName}" هي ${item.minOrderQuantity} قطع`,
          },
          { status: 400 }
        );
      }
      if (item.quantity > item.stock) {
        return NextResponse.json(
          { error: `الكمية المطلوبة من "${item.productName}" أكبر من المتاح بالمخزن (${item.stock} قطع)` },
          { status: 400 }
        );
      }
    }

    // Calculate wholesale unit prices and order total
    const calculatedItems = cart.map((item) => {
      const appliedPrice = getWholesalePrice(item);
      return {
        ...item,
        appliedPrice,
      };
    });

    const total = calculatedItems.reduce(
      (sum, item) => sum + item.appliedPrice * item.quantity,
      0
    );

    // Enforce Minimum Order Value for Wholesale
    if (total < MIN_ORDER_VALUE) {
      return NextResponse.json(
        {
          error: `الحد الأدنى لقيمة الطلب بالجملة هو ${MIN_ORDER_VALUE} ج.م (إجمالي سلتك الحالي: ${total.toFixed(0)} ج.م)`,
        },
        { status: 400 }
      );
    }

    const finalNotes = [
      businessName ? `[اسم المنشأة: ${businessName}]` : null,
      notes || null,
    ]
      .filter(Boolean)
      .join(" - ");

    // Execute order placement inside a database transaction to ensure atomicity
    const order = await db.transaction(async (tx) => {
      // 1. Atomically check and deduct stock
      for (const item of calculatedItems) {
        const updated = await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${item.quantity}` })
          .where(
            and(
              eq(products.id, item.productId),
              sql`${products.stock} >= ${item.quantity}`
            )
          )
          .returning({ id: products.id });

        if (updated.length === 0) {
          throw new Error(
            `نفد المخزون أو الكمية المطلوبة غير كافية لمنتج "${item.productName}"`
          );
        }
      }

      // 2. Insert order
      const [newOrder] = await tx
        .insert(orders)
        .values({
          userId: user.userId,
          total: total.toFixed(2),
          shippingAddress,
          shippingCity,
          shippingPhone,
          notes: finalNotes || null,
        })
        .returning();

      // 3. Insert order items
      for (const item of calculatedItems) {
        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          productId: item.productId,
          productName: item.productName,
          price: item.appliedPrice.toFixed(2),
          quantity: item.quantity,
        });
      }

      // 4. Clear user's cart
      await tx.delete(cartItems).where(eq(cartItems.userId, user.userId));

      return newOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (e: unknown) {
    console.error("Order POST error:", e);
    const msg = e instanceof Error ? e.message : "خطأ في إنشاء الأوردر";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
