import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";

export async function GET() {
  try {
    const cats = await db.select().from(categories);
    return NextResponse.json({ categories: cats });
  } catch (e) {
    console.error("Categories GET error:", e);
    return NextResponse.json({ error: "خطأ" }, { status: 500 });
  }
}
