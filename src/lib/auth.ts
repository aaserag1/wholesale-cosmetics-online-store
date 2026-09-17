import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "beautymart-super-secret-key-2024"
);

export function getAuthCookieOptions(req?: NextRequest) {
  let isHttps = false;
  if (req) {
    const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol;
    isHttps = proto === "https" || proto === "https:";
  } else if (process.env.COOKIE_SECURE === "true") {
    isHttps = true;
  }

  return {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: {
  userId: number;
  email: string;
  isAdmin: boolean;
}) {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as {
      userId: number;
      email: string;
      isAdmin: boolean;
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(req?: Request) {
  let token: string | undefined;

  // 1. Check direct request authorization header if passed
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  // 2. Check next/headers Authorization
  if (!token) {
    try {
      const headerStore = await headers();
      const authHeader = headerStore.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    } catch {
      // Ignored if outside request scope
    }
  }

  // 3. Check cookies
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("token")?.value;
    } catch {
      // Ignored if outside request scope
    }
  }

  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  return payload;
}

export async function requireAuth(req?: Request) {
  const user = await getCurrentUser(req);
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin(req?: Request) {
  const user = await getCurrentUser(req);
  if (!user || !user.isAdmin) throw new Error("Admin access required");
  return user;
}
