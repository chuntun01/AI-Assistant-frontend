"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveAuth } from "@/lib/auth";
import { Loader2, Bot } from "lucide-react";

export default function AuthCallbackPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token     = searchParams.get("token");
    const name      = searchParams.get("name") || "";
    const role      = searchParams.get("role") || "user";
    const avatar    = searchParams.get("avatar") || null;
    const idFromUrl = searchParams.get("id") || null;

    if (token) {
      try {
        // Giai ma JWT payload de lay email va sub (id)
        const payload = JSON.parse(atob(token.split(".")[1]));
        saveAuth(token, {
          id:     idFromUrl || payload.sub,
          email:  payload.email,
          name:   decodeURIComponent(name),
          role:   role as "admin" | "user",
          avatar: avatar ? decodeURIComponent(avatar) : null,
        });
        router.replace("/");
      } catch {
        router.replace("/login?error=google_failed");
      }
    } else {
      router.replace("/login?error=google_failed");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4 animate-pulse">
          <Bot size={32} className="text-white" />
        </div>
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <Loader2 size={18} className="animate-spin text-blue-500" />
          <p className="text-sm font-medium">Đang xác thực với Google...</p>
        </div>
        <p className="text-xs text-slate-400">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );
}