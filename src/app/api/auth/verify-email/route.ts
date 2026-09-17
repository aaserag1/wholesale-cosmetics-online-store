import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, verificationCodes } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { createToken, getAuthCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "البريد الإلكتروني ورمز التأكيد مطلوبان" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Check verification code in DB
    const [record] = await db
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.email, cleanEmail),
          eq(verificationCodes.code, cleanCode)
        )
      );

    if (!record) {
      return NextResponse.json(
        { error: "رمز التأكيد غير صحيح أو غير موجود" },
        { status: 400 }
      );
    }

    if (new Date() > new Date(record.expiresAt)) {
      return NextResponse.json(
        { error: "عذراً، لقد انتهت صلاحية هذا الرمز. يرجى طلب رمز جديد." },
        { status: 400 }
      );
    }

    // Mark user as verified
    const [verifiedUser] = await db
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.email, cleanEmail))
      .returning();

    if (!verifiedUser) {
      return NextResponse.json(
        { error: "لم يتم العثور على حساب بهذا البريد الإلكتروني" },
        { status: 404 }
      );
    }

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
      token,
      user: {
        id: verifiedUser.id,
        name: verifiedUser.name,
        email: verifiedUser.email,
        isAdmin: verifiedUser.isAdmin,
        businessName: verifiedUser.businessName,
      },
    });

    res.cookies.set("token", token, getAuthCookieOptions(req));

    return res;
  } catch (e) {
    console.error("Verify email error:", e);
    return NextResponse.json({ error: "فشل التحقق من الرمز" }, { status: 500 });
  }
}
