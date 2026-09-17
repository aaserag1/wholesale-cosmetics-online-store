import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, verificationCodes } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "يرجى إدخال البريد الإلكتروني ورمز التحقق" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();

    // Check if code matches and has not expired
    const [validCode] = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.email, cleanEmail),
          eq(verificationCodes.code, cleanCode),
          gt(verificationCodes.expiresAt, new Date())
        )
      );

    if (!validCode) {
      return NextResponse.json(
        { error: "رمز التحقق غير صحيح أو انتهت صلاحيته (15 دقيقة)" },
        { status: 400 }
      );
    }

    // Find the user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail));

    if (!user) {
      return NextResponse.json(
        { error: "الحساب غير موجود، يرجى التسجيل أولاً" },
        { status: 404 }
      );
    }

    // Mark user as verified
    const [verifiedUser] = await db
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.id, user.id))
      .returning();

    // Clean up verification codes for this email
    await db.delete(verificationCodes).where(eq(verificationCodes.email, cleanEmail));

    // Create login session token
    const token = await createToken({
      userId: verifiedUser.id,
      email: verifiedUser.email,
      isAdmin: verifiedUser.isAdmin,
    });

    const res = NextResponse.json({
      success: true,
      message: "تهانينا! تم تفعيل حسابك التجاري بنجاح.",
      user: {
        id: verifiedUser.id,
        name: verifiedUser.name,
        email: verifiedUser.email,
        isAdmin: verifiedUser.isAdmin,
        businessName: verifiedUser.businessName,
      },
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
    console.error("Verify email error:", e);
    return NextResponse.json({ error: "فشل التحقق من الرمز" }, { status: 500 });
  }
}
