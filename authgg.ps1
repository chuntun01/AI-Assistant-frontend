# setup-google-auth-reset-password-frontend.ps1
# Chay trong thu muc ai-iam-frontend
# .\setup-google-auth-reset-password-frontend.ps1

$utf8NoBom = New-Object System.Text.UTF8Encoding $false

function Write-File($relativePath, $content) {
    $full = Join-Path (Get-Location) $relativePath
    $dir  = Split-Path $full
    if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    [System.IO.File]::WriteAllText($full, $content, $utf8NoBom)
    Write-Host "  [OK] $relativePath" -ForegroundColor Green
}

Write-Host "Tao Frontend pages..." -ForegroundColor Cyan

# ============================================================
# app/auth/callback/page.tsx — nhan token tu Google redirect
# ============================================================
Write-File "app\auth\callback\page.tsx" @'
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveAuth } from "@/lib/auth";

export default function AuthCallbackPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const name  = searchParams.get("name") || "";
    const role  = searchParams.get("role") || "user";

    if (token) {
      // Lay thong tin user tu token
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        saveAuth(token, {
          id:    payload.sub,
          email: payload.email,
          name:  decodeURIComponent(name),
          role:  role as "admin" | "user",
        });
        router.replace("/");
      } catch {
        router.replace("/login?error=google_failed");
      }
    } else {
      router.replace("/login?error=google_failed");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center">
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4, margin: "0 auto 16px" }} />
        <p className="text-gray-500 text-sm">Dang dang nhap...</p>
      </div>
    </div>
  );
}
'@

# ============================================================
# app/(auth)/forgot-password/page.tsx
# ============================================================
Write-File "app\(auth)\forgot-password\page.tsx" @'
"use client";
import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Mail, ArrowRight, Loader2, Bot, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Co loi xay ra. Vui long thu lai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-3xl" />
      </div>

      <div className="bg-white rounded-[24px] shadow-2xl shadow-blue-900/5 p-10 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <Bot size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Quen mat khau?</h1>
          <p className="text-slate-500 text-sm mt-2">Nhap email de nhan link dat lai mat khau</p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <p className="text-slate-700 font-medium">Da gui email!</p>
            <p className="text-slate-500 text-sm mt-2">
              Kiem tra hop thu cua <strong>{email}</strong>.<br/>
              Link het han sau 15 phut.
            </p>
            <Link href="/login" className="mt-6 inline-block text-blue-600 hover:underline text-sm font-medium">
              Quay lai dang nhap
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email" required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="group w-full bg-slate-900 hover:bg-blue-600 disabled:opacity-70 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading
                ? <Loader2 size={20} className="animate-spin" />
                : <><span>Gui link dat lai mat khau</span><ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              }
            </button>

            <p className="text-center text-sm text-slate-500 pt-2">
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold">
                Quay lai dang nhap
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
'@

# ============================================================
# app/(auth)/reset-password/page.tsx
# ============================================================
Write-File "app\(auth)\reset-password\page.tsx" @'
"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Lock, Eye, EyeOff, Loader2, Bot, CheckCircle, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get("token") || "";
  const email        = searchParams.get("email") || "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) return setError("Mat khau phai co it nhat 6 ky tu");
    if (password !== confirm)  return setError("Mat khau xac nhan khong khop");

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, email, newPassword: password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Token khong hop le hoac da het han");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="text-center py-4">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <p className="text-slate-700 font-medium">Link khong hop le</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-blue-600 hover:underline text-sm">
          Yeu cau link moi
        </Link>
      </div>
    );
  }

  return success ? (
    <div className="text-center py-4">
      <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
      <p className="text-slate-700 font-medium">Mat khau da duoc dat lai!</p>
      <p className="text-slate-500 text-sm mt-2">Dang chuyen huong den trang dang nhap...</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Mat khau moi</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Lock size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type={showPwd ? "text" : "password"}
            required minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
            placeholder="Toi thieu 6 ky tu"
          />
          <button type="button" onClick={() => setShowPwd(!showPwd)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600">
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Xac nhan mat khau</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Lock size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type={showPwd ? "text" : "password"}
            required
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
            placeholder="Nhap lai mat khau moi"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] px-4 py-3 rounded-xl flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit" disabled={loading}
        className="w-full bg-slate-900 hover:bg-blue-600 disabled:opacity-70 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 size={20} className="animate-spin" /> : "Dat lai mat khau"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-3xl" />
      </div>
      <div className="bg-white rounded-[24px] shadow-2xl shadow-blue-900/5 p-10 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <Bot size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Dat lai mat khau</h1>
          <p className="text-slate-500 text-sm mt-2">Nhap mat khau moi cua ban</p>
        </div>
        <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
'@

# ============================================================
# Cap nhat Login page — them nut Google + link Forgot Password
# ============================================================
Write-File "app\(auth)\login\page.tsx" @'
"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Bot, AlertCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm]         = useState({ email: "", password: "" });
  const [error, setError]       = useState(searchParams.get("error") === "google_failed" ? "Dang nhap Google that bai. Vui long thu lai." : "");
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await authApi.login(form);
      saveAuth(res.data.token, res.data.user);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Dang nhap that bai. Vui long kiem tra lai.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-3xl" />
      </div>

      <div className="bg-white rounded-[24px] shadow-2xl shadow-blue-900/5 p-10 w-full max-w-md border border-gray-100">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
            <Bot size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Chao mung tro lai!</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Dang nhap vao AI IAM Assistant</p>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors mb-6 group"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Tiep tuc voi Google</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">hoac</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mat khau</label>
              <Link href="/forgot-password" className="text-[11px] text-blue-600 hover:underline font-semibold">
                Quen mat khau?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] px-4 py-3 rounded-xl flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="group relative w-full bg-slate-900 hover:bg-blue-600 disabled:opacity-70 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-slate-200 active:scale-[0.98]"
          >
            <div className="relative flex items-center justify-center gap-2">
              {loading
                ? <Loader2 size={20} className="animate-spin" />
                : <><span>Dang nhap ngay</span><ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              }
            </div>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-center text-sm text-slate-500">
            Chua co tai khoan?{" "}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
              Dang ky mien phi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
'@

Write-Host ""
Write-Host "=== Frontend xong! ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "Cac trang da tao:" -ForegroundColor Cyan
Write-Host "  /auth/callback      -> nhan token tu Google"
Write-Host "  /forgot-password    -> nhap email nhan link"
Write-Host "  /reset-password     -> dat lai mat khau"
Write-Host "  /login              -> them nut Google + link Forgot Password"