import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        address: users.address,
        city: users.city,
        isAdmin: users.isAdmin,
      })
      .from(users)
      .where(eq(users.id, payload.userId));
    return NextResponse.json({ user: user || null });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
