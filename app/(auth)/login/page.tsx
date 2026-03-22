"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {authApi} from "@/lib/api";
import {saveAuth} from "@/lib/auth";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Chrome,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({email: "", password: ""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(form);
      saveAuth(res.data.token, res.data.user);
      router.push("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Thông tin đăng nhập không chính xác.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Chào mừng trở lại
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Hệ thống quản lý định danh thông minh AI IAM
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-slate-700 ml-1">
                Email công việc
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail
                    size={18}
                    className="text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  />
                </div>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-[15px]"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[13px] font-semibold text-slate-700">
                  Mật khẩu
                </label>
                <Link
                  href="#"
                  className="text-[12px] text-blue-600 hover:text-blue-700 font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock
                    size={18}
                    className="text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-[15px]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs py-3 px-4 rounded-xl flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Đăng nhập ngay
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <span className="relative px-4 bg-white text-[12px] text-slate-400 uppercase font-medium tracking-widest">
              Hoặc tiếp tục với
            </span>
          </div>

          {/* Social Login */}
          <button className="w-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-3 text-[14px]">
            <Chrome size={18} className="text-blue-500" />
            Google
          </button>
        </div>

        {/* Footer Link */}
        <p className="text-center mt-8 text-sm text-slate-500">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-bold hover:underline decoration-2 underline-offset-4"
          >
            Đăng ký miễn phí
          </Link>
        </p>
      </div>
    </div>
  );
}
