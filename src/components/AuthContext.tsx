"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  businessName?: string | null;
  taxId?: string | null;
  isAdmin: boolean;
  isVerified?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{
    error?: string;
    requiresVerification?: boolean;
    email?: string;
    sentViaSmtp?: boolean;
    devCode?: string;
  }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
    businessName?: string;
    taxId?: string;
  }) => Promise<{
    error?: string;
    requiresVerification?: boolean;
    email?: string;
    sentViaSmtp?: boolean;
    devCode?: string;
  }>;
  updateProfile: (data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    businessName?: string;
    taxId?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<{ error?: string; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        error: data.error,
        requiresVerification: data.requiresVerification,
        email: data.email,
        sentViaSmtp: data.sentViaSmtp,
        devCode: data.devCode,
      };
    }
    await refreshUser();
    return {};
  };

  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    city?: string;
    businessName?: string;
    taxId?: string;
  }) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    if (data.requiresVerification) {
      return {
        requiresVerification: true,
        email: data.email,
        sentViaSmtp: data.sentViaSmtp,
        devCode: data.devCode,
      };
    }
    await refreshUser();
    return {};
  };

  const updateProfile = async (updateData: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    businessName?: string;
    taxId?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    await refreshUser();
    return { message: data.message };
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, updateProfile, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
