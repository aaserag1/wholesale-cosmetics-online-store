import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, verificationCodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Check user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail));

    if (!user) {
      return NextResponse.json(
        { error: "لم يتم العثور على حساب بهذا البريد، يرجى التسجيل أولاً" },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: "هذا الحساب مفعل بالفعل، يمكنك تسجيل الدخول مباشرة" },
        { status: 400 }
      );
    }

    // Rate-limit check (prevent spamming resend within 45s)
    const [recentCode] = await db
      .select()
      .from(verificationCodes)
      .where(eq(verificationCodes.email, cleanEmail));

    if (recentCode) {
      const ageMs = Date.now() - new Date(recentCode.createdAt).getTime();
      if (ageMs < 45 * 1000) {
        const waitSeconds = Math.ceil((45 * 1000 - ageMs) / 1000);
        return NextResponse.json(
          { error: `يرجى الانتظار ${waitSeconds} ثانية قبل طلب رمز جديد` },
          { status: 429 }
        );
      }
    }

    // Generate new 6-digit code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Delete older codes
    await db.delete(verificationCodes).where(eq(verificationCodes.email, cleanEmail));

    // Save new code
    await db.insert(verificationCodes).values({
      email: cleanEmail,
      code: newCode,
      expiresAt,
    });

    // Send email
    const mailResult = await sendVerificationEmail(cleanEmail, newCode, user.name);

    return NextResponse.json({
      success: true,
      sentViaSmtp: mailResult.sentViaSmtp,
      ...(mailResult.sentViaSmtp ? {} : { devCode: newCode }),
      message: mailResult.sentViaSmtp
        ? "تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني بنجاح."
        : "تم توليد رمز تحقق جديد (خادم SMTP غير مهيأ بعد).",
    });
  } catch (e) {
    console.error("Resend code error:", e);
    return NextResponse.json({ error: "فشل إعادة إرسال الرمز" }, { status: 500 });
  }
}
