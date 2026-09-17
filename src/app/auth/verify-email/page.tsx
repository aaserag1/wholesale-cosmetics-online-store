"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const qEmail = searchParams.get("email");
    if (qEmail) {
      setEmail(qEmail);
    }
  }, [searchParams]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) {
      setError("يرجى إدخال البريد الإلكتروني ورمز التحقق");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "رمز التحقق غير صحيح أو انتهت صلاحيته");
      } else {
        setSuccess("🎉 " + data.message);
        await refreshUser();
        setTimeout(() => {
          router.push("/account/profile");
        }, 1500);
      }
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !email) return;
    setResending(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل إعادة إرسال الرمز");
      } else {
        setSuccess("✓ " + data.message);
        setCountdown(60);
      }
    } catch {
      setError("حدث خطأ أثناء محاولة إعادة إرسال الرمز");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-4xl shadow-lg mb-4">
            ✉️
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
            تأكيد البريد الإلكتروني
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            لحماية حسابك التجاري ومنع التسجيلات العشوائية، أرسلنا رمز تحقق مكون من 6 أرقام إلى:
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-5 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl mb-5 text-xs font-bold flex items-center gap-2">
              <span>✓</span> {success}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 text-center">
                أدخل رمز التحقق (OTP)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="------"
                autoComplete="one-time-code"
                className="w-full text-center tracking-[12px] font-mono text-3xl font-black py-3 border-2 border-dashed border-pink-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-primary text-primary placeholder:text-gray-300"
              />
              <span className="block text-[11px] text-gray-400 text-center mt-1.5">
                ⏳ صلاحية الرمز 15 دقيقة من وقت الإرسال
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full bg-gradient-to-l from-primary to-secondary text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> جاري التحقق...
                </>
              ) : (
                <>
                  <span>🚀</span> تأكيد وتفعيل الحساب
                </>
              )}
            </button>
          </form>

          {/* Resend Section */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-3">لم يصلك الرمز؟ تفقد مجلد الرسائل غير المرغوبة (Spam)</p>
            {countdown > 0 ? (
              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full inline-block">
                إعادة الإرسال متاحة بعد {countdown} ثانية
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || !email}
                className="text-xs font-bold text-primary hover:underline hover:text-secondary transition-colors"
              >
                {resending ? "جاري الإرسال..." : "🔄 إعادة إرسال رمز التحقق"}
              </button>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/auth/login"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← العودة لصفحة تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-spin text-4xl">🌸</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
