import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "الاسم بالإنجليزية مطلوب"),
  nameAr: z.string().min(2, "الاسم بالعربية مطلوب"),
  slug: z.string().min(2, "الرابط اللطيف (slug) مطلوب"),
  icon: z.string().default("✨"),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, nameAr, slug, icon } = parsed.data;

    // Check slug uniqueness
    const existing = await db.select().from(categories).where(eq(categories.slug, slug));
    if (existing.length > 0) {
      return NextResponse.json({ error: "الرابط اللطيف (slug) مستخدم بالفعل" }, { status: 409 });
    }

    const [newCat] = await db
      .insert(categories)
      .values({ name, nameAr, slug, icon })
      .returning();

    return NextResponse.json({ success: true, category: newCat });
  } catch (e) {
    console.error("Admin category POST error:", e);
    return NextResponse.json({ error: "فشل إضافة القسم" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, nameAr, slug, icon } = body;
    if (!id) return NextResponse.json({ error: "معرف القسم مطلوب" }, { status: 400 });

    const [updatedCat] = await db
      .update(categories)
      .set({ name, nameAr, slug, icon })
      .where(eq(categories.id, id))
      .returning();

    return NextResponse.json({ success: true, category: updatedCat });
  } catch (e) {
    console.error("Admin category PUT error:", e);
    return NextResponse.json({ error: "فشل تعديل القسم" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "0");
    if (!id) return NextResponse.json({ error: "معرف القسم غير صحيح" }, { status: 400 });

    // Check if products exist in category
    const [prodCount] = await db
      .select({ val: count() })
      .from(products)
      .where(eq(products.categoryId, id));

    if (prodCount.val > 0) {
      return NextResponse.json(
        { error: `لا يمكن حذف هذا القسم لأنه يحتوي على ${prodCount.val} منتج. قم بنقل المنتجات أولاً.` },
        { status: 400 }
      );
    }

    await db.delete(categories).where(eq(categories.id, id));
    return NextResponse.json({ success: true, message: "تم حذف القسم بنجاح" });
  } catch (e) {
    console.error("Admin category DELETE error:", e);
    return NextResponse.json({ error: "فشل حذف القسم" }, { status: 500 });
  }
}
