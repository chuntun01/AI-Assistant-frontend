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