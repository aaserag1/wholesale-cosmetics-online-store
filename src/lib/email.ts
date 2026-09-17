import nodemailer from "nodemailer";

export function isSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!isSmtpConfigured()) {
    return null;
  }

  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const isSecure = port === 465 || process.env.SMTP_SECURE === "true";

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendVerificationEmail(
  toEmail: string,
  code: string,
  recipientName?: string
): Promise<{ success: boolean; error?: string; sentViaSmtp: boolean }> {
  const displayName = recipientName ? `أهلاً بك أ. ${recipientName}` : "مرحباً بك";
  const fromAddress = process.env.SMTP_FROM || '"BeautyMart B2B" <noreply@beautymart.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; direction: rtl; text-align: right; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .logo { text-align: center; margin-bottom: 24px; }
        .logo-title { font-size: 24px; font-weight: 900; color: #db2777; margin: 8px 0 0; }
        .logo-subtitle { font-size: 13px; color: #64748b; margin: 0; }
        .greeting { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
        .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .code-box { background: #fdf2f8; border: 2px dashed #f472b6; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
        .code-label { font-size: 12px; font-weight: 700; color: #9d174d; margin-bottom: 8px; text-transform: uppercase; }
        .code-digits { font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #db2777; font-family: monospace; display: block; }
        .expiry { font-size: 12px; color: #ef4444; margin-top: 8px; font-weight: 600; }
        .footer { border-top: 1px solid #f1f5f9; margin-top: 32px; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
        .warning { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 12px; font-size: 12px; color: #991b1b; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">
          <div style="font-size: 40px;">🌸</div>
          <h1 class="logo-title">BeautyMart B2B</h1>
          <p class="logo-subtitle">منصة توريد مستحضرات التجميل بالجملة للصالونات والمتاجر</p>
        </div>

        <div class="greeting">${displayName}،</div>
        <p class="message">
          شكراً لتسجيلك في منصة <b>BeautyMart</b>. لتأكيد بريدك الإلكتروني وتفعيل حسابك التجاري للبدء في تصفح عروض الجملة، يرجى استخدام رمز التحقق التالي:
        </p>

        <div class="code-box">
          <div class="code-label">رمز التحقق لتفعيل الحساب</div>
          <div class="code-digits">${code}</div>
          <div class="expiry">⏳ ينتهي هذا الرمز خلال 15 دقيقة</div>
        </div>

        <div class="warning">
          ⚠️ <b>تنبيه أمني:</b> لا تشارك هذا الرمز مع أي شخص. موظفو BeautyMart لن يطلبوا منك هذا الرمز أبداً.
        </div>

        <div class="footer">
          إذا لم تقم بإنشاء حساب على BeautyMart، يمكنك تجاهل هذا البريد بأمان.<br>
          © ${new Date().getFullYear()} BeautyMart B2B Wholesale. جميع الحقوق محفوظة.
        </div>
      </div>
    </body>
    </html>
  `;

  // Always log to server logs for diagnostics and instant local/dev verification
  console.log("=================================================");
  console.log(`📧 [BeautyMart Email OTP]`);
  console.log(`To: ${toEmail}`);
  console.log(`Recipient: ${recipientName || "New User"}`);
  console.log(`Verification Code: [ ${code} ]`);
  console.log(`Expires: 15 minutes from now`);
  console.log("=================================================");

  const transporter = getTransporter();
  if (!transporter) {
    console.log("ℹ️ SMTP is not configured in .env. Verification code logged above.");
    return { success: true, sentViaSmtp: false };
  }

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `🌸 رمز تأكيد حسابك في BeautyMart: ${code}`,
      html: htmlContent,
      text: `رمز التحقق الخاص بك في BeautyMart هو: ${code}\nصلاحية الرمز 15 دقيقة.`,
    });
    console.log(`✅ Verification email sent successfully via SMTP to ${toEmail}`);
    return { success: true, sentViaSmtp: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`❌ Failed to send verification email via SMTP to ${toEmail}:`, message);
    return { success: false, error: message, sentViaSmtp: true };
  }
}
