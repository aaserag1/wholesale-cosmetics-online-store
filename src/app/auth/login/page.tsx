"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">💄</span>
          <h1 className="text-3xl font-black mb-2">تسجيل الدخول</h1>
          <p className="text-gray-500">أهلاً بيك! سجّل دخولك عشان تكمل تسوق</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-l from-primary to-secondary text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500">
            ليس لديك حساب؟{" "}
            <Link href="/auth/register" className="text-primary font-bold hover:underline">
              سجّل الآن
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">حسابات تجريبية:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => { setEmail("admin@beautymart.com"); setPassword("admin123"); }}
                className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors"
              >
                ⚙️ أدمن
              </button>
              <button
                onClick={() => { setEmail("ahmed@test.com"); setPassword("customer123"); }}
                className="bg-pink-50 text-pink-700 px-3 py-2 rounded-lg hover:bg-pink-100 transition-colors"
              >
                👤 عميل
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
