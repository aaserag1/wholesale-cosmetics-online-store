import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        nameAr: products.nameAr,
        description: products.description,
        descriptionAr: products.descriptionAr,
        price: products.price,
        originalPrice: products.originalPrice,
        minOrderQuantity: products.minOrderQuantity,
        packageUnit: products.packageUnit,
        piecesPerPackage: products.piecesPerPackage,
        tier1Min: products.tier1Min,
        tier1Price: products.tier1Price,
        tier2Min: products.tier2Min,
        tier2Price: products.tier2Price,
        image: products.image,
        stock: products.stock,
        isFeatured: products.isFeatured,
        rating: products.rating,
        reviewCount: products.reviewCount,
        categoryId: products.categoryId,
        categoryName: categories.nameAr,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, parseInt(id)));

    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (e) {
    console.error("Product GET error:", e);
    return NextResponse.json({ error: "خطأ في جلب المنتج" }, { status: 500 });
  }
}
