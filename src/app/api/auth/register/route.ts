import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, verificationCodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { sendVerificationEmail } from "@/lib/email";

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
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail));

    if (existing && existing.isVerified) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مسجل ومفعل بالفعل. يرجى تسجيل الدخول." },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);

    if (existing && !existing.isVerified) {
      // Update existing unverified account with new details
      await db
        .update(users)
        .set({
          name,
          password: hashed,
          phone: phone || null,
          address: address || null,
          city: city || null,
          businessName: businessName || null,
          taxId: taxId || null,
        })
        .where(eq(users.id, existing.id));
    } else {
      // Insert new unverified user
      await db.insert(users).values({
        name,
        email: cleanEmail,
        password: hashed,
        phone: phone || null,
        address: address || null,
        city: city || null,
        businessName: businessName || null,
        taxId: taxId || null,
        isAdmin: false,
        isVerified: false,
      });
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Clean up older verification codes for this email
    await db.delete(verificationCodes).where(eq(verificationCodes.email, cleanEmail));

    // Store new code
    await db.insert(verificationCodes).values({
      email: cleanEmail,
      code,
      expiresAt,
    });

    // Send verification email
    const mailResult = await sendVerificationEmail(cleanEmail, code, name);

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      sentViaSmtp: mailResult.sentViaSmtp,
      ...(mailResult.sentViaSmtp ? {} : { devCode: code }),
      message: mailResult.sentViaSmtp
        ? "تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني بنجاح."
        : "تم تسجيل الحساب. خادم إرسال البريد (SMTP) غير مهيأ بعد على السيرفر.",
    });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "حدث خطأ في السيرفر أثناء التسجيل" }, { status: 500 });
  }
}
