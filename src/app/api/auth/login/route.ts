import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, verificationCodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;
    const cleanEmail = email.trim().toLowerCase();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail));

    if (!user) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // Safeguard: Check if account email is verified
    if (!user.isVerified) {
      // Generate a fresh code and send it immediately
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await db.delete(verificationCodes).where(eq(verificationCodes.email, cleanEmail));
      await db.insert(verificationCodes).values({
        email: cleanEmail,
        code,
        expiresAt,
      });

      const mailResult = await sendVerificationEmail(cleanEmail, code, user.name);

      return NextResponse.json(
        {
          error: "حسابك التجاري غير مفعل بعد. يرجى إدخال رمز التحقق لتفعيله.",
          requiresVerification: true,
          email: cleanEmail,
          sentViaSmtp: mailResult.sentViaSmtp,
          ...(mailResult.sentViaSmtp ? {} : { devCode: code }),
        },
        { status: 403 }
      );
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    const res = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        businessName: user.businessName,
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
    console.error("Login error:", e);
    return NextResponse.json({ error: "حدث خطأ في السيرفر أثناء تسجيل الدخول" }, { status: 500 });
  }
}
