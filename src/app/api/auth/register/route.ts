import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const { name, email, password, phone, address, city, businessName, taxId } = parsed.data;

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مسجل بالفعل" },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({ name, email, password: hashed, phone, address, city, businessName, taxId })
      .returning();

    const token = await createToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    const res = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "حدث خطأ في السيرفر" }, { status: 500 });
  }
}
