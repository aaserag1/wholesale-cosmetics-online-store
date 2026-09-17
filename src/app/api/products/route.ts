import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, and, ilike, sql, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const sort = searchParams.get("sort") || "newest";

    const conditions = [eq(products.isActive, true)];

    if (category) {
      const [cat] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, category));
      if (cat) conditions.push(eq(products.categoryId, cat.id));
    }

    if (search) {
      conditions.push(
        sql`(${products.nameAr} ILIKE ${"%" + search + "%"} OR ${products.name} ILIKE ${"%" + search + "%"})`
      );
    }

    if (featured === "true") {
      conditions.push(eq(products.isFeatured, true));
    }

    const whereClause = and(...conditions);

    let orderExpr = desc(products.createdAt);
    if (sort === "price-asc") {
      orderExpr = sql`${products.price} ASC`;
    } else if (sort === "price-desc") {
      orderExpr = sql`${products.price} DESC`;
    }

    const items = await db
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
      .where(whereClause)
      .orderBy(orderExpr)
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    return NextResponse.json({ products: items, total: Number(count), page, limit });
  } catch (e) {
    console.error("Products GET error:", e);
    return NextResponse.json({ error: "خطأ في جلب المنتجات" }, { status: 500 });
  }
}
