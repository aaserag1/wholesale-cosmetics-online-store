import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) throw new Error("Unauthorized");
  return user;
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const values = {
      name: data.name,
      nameAr: data.nameAr,
      description: data.description || null,
      descriptionAr: data.descriptionAr || null,
      price: data.price.toFixed(2),
      originalPrice: data.originalPrice ? data.originalPrice.toFixed(2) : null,
      minOrderQuantity: data.minOrderQuantity,
      packageUnit: data.packageUnit,
      piecesPerPackage: data.piecesPerPackage,
      tier1Min: data.tier1Min || null,
      tier1Price: data.tier1Price ? data.tier1Price.toFixed(2) : null,
      tier2Min: data.tier2Min || null,
      tier2Price: data.tier2Price ? data.tier2Price.toFixed(2) : null,
      image: data.image || null,
      categoryId: data.categoryId,
      stock: data.stock,
      isFeatured: data.isFeatured ?? false,
    };

    const [product] = await db.insert(products).values(values).returning();
    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    console.error("Admin product POST error:", e);
    return NextResponse.json({ error: "غير مصرح أو بيانات غير صالحة" }, { status: 403 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }

    const parsed = productSchema.partial().safeParse(rest);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const updateValues: Record<string, unknown> = { ...data };
    if (data.price !== undefined) updateValues.price = data.price.toFixed(2);
    if (data.originalPrice !== undefined) {
      updateValues.originalPrice = data.originalPrice ? data.originalPrice.toFixed(2) : null;
    }
    if (data.tier1Price !== undefined) {
      updateValues.tier1Price = data.tier1Price ? data.tier1Price.toFixed(2) : null;
    }
    if (data.tier2Price !== undefined) {
      updateValues.tier2Price = data.tier2Price ? data.tier2Price.toFixed(2) : null;
    }

    const [product] = await db
      .update(products)
      .set(updateValues)
      .where(eq(products.id, id))
      .returning();
    return NextResponse.json({ product });
  } catch (e) {
    console.error("Admin product PUT error:", e);
    return NextResponse.json({ error: "غير مصرح أو خطأ في التعديل" }, { status: 403 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    await db.delete(products).where(eq(products.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Admin product DELETE error:", e);
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }
}
