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