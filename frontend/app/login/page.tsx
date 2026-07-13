"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  BedDouble,
  CalendarCheck2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { LANDING_PAGE_URL } from "@/lib/app-config";
import { UserAPI } from "@/services/user.service";

const highlights = [
  {
    icon: CalendarCheck2,
    title: "Vận hành tập trung",
    description: "Quản lý đặt phòng, nhận phòng và trả phòng trên một hệ thống.",
  },
  {
    icon: BarChart3,
    title: "Báo cáo trực quan",
    description: "Theo dõi công suất phòng và doanh thu theo thời gian thực.",
  },
  {
    icon: ShieldCheck,
    title: "Phân quyền an toàn",
    description: "Kiểm soát quyền truy cập chi tiết cho từng vị trí nhân sự.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.username || !formData.password) {
      return toast.error("Vui lòng nhập đầy đủ thông tin");
    }

    setLoading(true);
    try {
      const response = await UserAPI.login(formData);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      login(response);
      toast.success("Đăng nhập thành công!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Đăng nhập thất bại";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(480px,0.92fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-slate-950 px-10 py-10 text-white lg:flex lg:flex-col xl:px-16 xl:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(59,130,246,0.28),transparent_35%),radial-gradient(circle_at_82%_80%,rgba(14,165,233,0.18),transparent_34%)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white shadow-lg shadow-blue-950/30">
            <Image src="/hospicore-mark.svg" alt="HospiCore" width={34} height={34} priority />
          </div>
          <div>
            <p className="text-xl font-semibold tracking-tight">HospiCore</p>
            <p className="text-xs tracking-[0.16em] text-slate-400">HOSPITALITY MANAGEMENT</p>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-2xl py-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-sm font-medium text-blue-200">
            <BedDouble className="size-4" />
            Nền tảng quản trị khách sạn toàn diện
          </div>
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.15] tracking-[-0.04em] xl:text-5xl">
            Đơn giản hóa vận hành,
            <span className="block text-blue-400">nâng tầm trải nghiệm.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 xl:text-lg">
            Một không gian làm việc thống nhất giúp đội ngũ khách sạn quản lý hiệu quả, chính xác và bảo mật hơn mỗi ngày.
          </p>

          <div className="mt-10 grid gap-4 xl:grid-cols-3">
            {highlights.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                  <Icon className="size-5" />
                </div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1.5 text-xs leading-5 text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">© 2026 HospiCore. Modern Hospitality Solutions.</p>
      </section>

      <section className="relative flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-10 lg:bg-white lg:px-12 xl:px-20">
        <div className="absolute left-5 top-5 flex items-center gap-2.5 lg:hidden">
          <div className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
            <Image src="/hospicore-mark.svg" alt="HospiCore" width={28} height={28} priority />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-900">HospiCore</span>
        </div>
        <a
          href={LANDING_PAGE_URL}
          className="absolute right-5 top-7 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:right-10 lg:right-12 lg:top-10 xl:right-20"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Về trang giới thiệu</span>
          <span className="sm:hidden">Trang chủ</span>
        </a>

        <div className="w-full max-w-[440px]">
          <div className="mb-9 hidden lg:block">
            <Image
              src="/hospicore-logo.svg"
              alt="HospiCore - Modern Hospitality Solutions"
              width={210}
              height={128}
              priority
              className="h-auto w-44"
            />
          </div>

          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">Chào mừng trở lại</p>
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">Đăng nhập hệ thống</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Nhập thông tin tài khoản được cấp để tiếp tục vào hệ thống quản lý.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-slate-700">Tên đăng nhập</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  placeholder="Nhập tên đăng nhập"
                  className="h-12 rounded-xl border-slate-200 bg-white pl-11 text-[15px] shadow-sm transition-shadow placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                  value={formData.username}
                  onChange={(event) => setFormData({ ...formData, username: event.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">Mật khẩu</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  className="h-12 rounded-xl border-slate-200 bg-white pl-11 pr-12 text-[15px] shadow-sm transition-shadow placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <Button
              className="h-12 w-full rounded-xl bg-blue-600 text-[15px] font-semibold shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            <p className="leading-6">Phiên đăng nhập được bảo vệ. Không chia sẻ tài khoản hoặc mật khẩu cho người khác.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
