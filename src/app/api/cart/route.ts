import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cartItems, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

function calculateUnitPrice(
  quantity: number,
  basePrice: string,
  tier1Min: number | null,
  tier1Price: string | null,
  tier2Min: number | null,
  tier2Price: string | null
): { unitPrice: number; tierApplied: "base" | "tier1" | "tier2" } {
  if (tier2Min && tier2Price && quantity >= tier2Min) {
    return { unitPrice: parseFloat(tier2Price), tierApplied: "tier2" };
  }
  if (tier1Min && tier1Price && quantity >= tier1Min) {
    return { unitPrice: parseFloat(tier1Price), tierApplied: "tier1" };
  }
  return { unitPrice: parseFloat(basePrice), tierApplied: "base" };
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ items: [], total: 0 });
    }
    const rawItems = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        productId: cartItems.productId,
        productName: products.nameAr,
        basePrice: products.price,
        originalPrice: products.originalPrice,
        productImage: products.image,
        stock: products.stock,
        minOrderQuantity: products.minOrderQuantity,
        packageUnit: products.packageUnit,
        piecesPerPackage: products.piecesPerPackage,
        tier1Min: products.tier1Min,
        tier1Price: products.tier1Price,
        tier2Min: products.tier2Min,
        tier2Price: products.tier2Price,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, user.userId));

    const items = rawItems.map((item) => {
      const { unitPrice, tierApplied } = calculateUnitPrice(
        item.quantity,
        item.basePrice,
        item.tier1Min,
        item.tier1Price,
        item.tier2Min,
        item.tier2Price
      );
      return {
        ...item,
        unitPrice: unitPrice.toFixed(2),
        subtotal: (unitPrice * item.quantity).toFixed(2),
        tierApplied,
      };
    });

    const total = items.reduce(
      (sum, item) => sum + parseFloat(item.unitPrice) * item.quantity,
      0
    );

    return NextResponse.json({ items, total });
  } catch (e) {
    console.error("Cart GET error:", e);
    return NextResponse.json({ items: [], total: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
    }
    const body = await req.json();

    // Support bulk sync for guest cart merge
    if (Array.isArray(body.items)) {
      for (const item of body.items) {
        if (!item.productId || !item.quantity) continue;
        const [existing] = await db
          .select()
          .from(cartItems)
          .where(
            and(
              eq(cartItems.userId, user.userId),
              eq(cartItems.productId, item.productId)
            )
          );

        if (existing) {
          await db
            .update(cartItems)
            .set({ quantity: existing.quantity + item.quantity })
            .where(
              and(
                eq(cartItems.id, existing.id),
                eq(cartItems.userId, user.userId)
              )
            );
        } else {
          await db
            .insert(cartItems)
            .values({
              userId: user.userId,
              productId: item.productId,
              quantity: item.quantity,
            });
        }
      }
      return NextResponse.json({ success: true });
    }

    const { productId, quantity = 1 } = body;
    if (!productId) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, user.userId),
          eq(cartItems.productId, productId)
        )
      );

    if (existing) {
      await db
        .update(cartItems)
        .set({ quantity: existing.quantity + quantity })
        .where(
          and(
            eq(cartItems.id, existing.id),
            eq(cartItems.userId, user.userId)
          )
        );
    } else {
      await db
        .insert(cartItems)
        .values({ userId: user.userId, productId, quantity });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Cart POST error:", e);
    return NextResponse.json({ error: "خطأ في إضافة المنتج" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
    }
    const { id, quantity } = await req.json();

    if (!id || typeof quantity !== "number") {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    // IDOR check: verify item belongs to user
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.id, id), eq(cartItems.userId, user.userId)));

    if (!existing) {
      return NextResponse.json({ error: "العنصر غير موجود بالسلة" }, { status: 404 });
    }

    if (quantity <= 0) {
      await db
        .delete(cartItems)
        .where(and(eq(cartItems.id, id), eq(cartItems.userId, user.userId)));
    } else {
      await db
        .update(cartItems)
        .set({ quantity })
        .where(and(eq(cartItems.id, id), eq(cartItems.userId, user.userId)));
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Cart PUT error:", e);
    return NextResponse.json({ error: "خطأ في تحديث السلة" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // IDOR check: delete only if item belongs to current user
      await db
        .delete(cartItems)
        .where(and(eq(cartItems.id, parseInt(id)), eq(cartItems.userId, user.userId)));
    } else {
      await db
        .delete(cartItems)
        .where(eq(cartItems.userId, user.userId));
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Cart DELETE error:", e);
    return NextResponse.json({ error: "خطأ في حذف من السلة" }, { status: 500 });
  }
}
