"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { UserAPI } from "@/services/user.service";
import { normalizePermissions } from "@/lib/permissions";

export function hasPermission(user: any, permissionKey: string): boolean {
  if (!user) return false;
  if (user.role === "SUPERADMIN") return true;
  // `permissions` returned by the API is the effective permission set.
  // An empty array intentionally means that the user has no permissions.
  const effectivePermissions = normalizePermissions(user.permissions);
  const requestedPermissions = normalizePermissions([permissionKey]);
  return requestedPermissions.length > 0
    ? requestedPermissions.some((permission) => effectivePermissions.includes(permission))
    : effectivePermissions.includes(permissionKey);
}

const AuthContext = createContext<any>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Danh sách các trang KHÔNG cần đăng nhập
  const publicRoutes = ["/login"];

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      const isPublicRoute = publicRoutes.includes(pathname);

      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        let authenticatedUser = parsedUser;

        // Always refresh the current user before rendering or checking access.
        // This prevents stale permissions from localStorage being used after an
        // administrator changes a user's permissions.
        try {
          if (parsedUser.id !== "0" && parsedUser.id !== "admin-env") {
            authenticatedUser = await UserAPI.getUserById(parsedUser.id);

            if (authenticatedUser.status === "LOCKED" || authenticatedUser.status === "INACTIVE") {
              toast.error("Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động!");
              localStorage.clear();
              setUser(null);
              router.replace("/login");
              return;
            }

            localStorage.setItem("user", JSON.stringify(authenticatedUser));
          }
          setUser(authenticatedUser);
        } catch (error: any) {
          console.error("Lỗi kiểm tra xác thực:", error);
          localStorage.clear();
          setUser(null);
          router.replace("/login");
          return;
        }

        // --- ROUTING GUARD ---
        let pageKey = "";
        if (pathname.startsWith("/users")) pageKey = "USER_VIEW";
        else if (pathname.startsWith("/customers")) pageKey = "CUSTOMER_VIEW";
        else if (pathname.startsWith("/finance")) pageKey = "FINANCE_VIEW";
        else if (pathname.startsWith("/reports")) pageKey = "REPORT_VIEW";
        else if (pathname.startsWith("/rooms")) pageKey = "ROOM_VIEW";
        else if (pathname.startsWith("/bookings")) pageKey = "BOOKING_VIEW";
        else if (pathname.startsWith("/services")) pageKey = "SERVICE_VIEW";
        else if (pathname.startsWith("/invoices")) pageKey = "INVOICE_VIEW";
        else if (pathname.startsWith("/inventory")) pageKey = "INVENTORY_VIEW";

        if (pageKey && !hasPermission(authenticatedUser, pageKey)) {
          toast.error("Bạn không có quyền truy cập chức năng này!");
          router.replace("/dashboard");
          return;
        }

        // Nếu đã login mà cố vào trang login thì đẩy vào dashboard
        if (pathname === "/login") {
          router.replace("/dashboard");
        }

      } else {
        // Nếu CHƯA login và đang vào trang bảo mật -> đá ra login ngay
        if (!isPublicRoute) {
          setUser(null);
          router.replace("/login");
        }
      }
      
      // Chỉ tắt loading khi đã kiểm tra xong logic chuyển hướng
      setTimeout(() => setIsLoading(false), 50); 
    };

    checkAuth();
  }, [pathname]);

  // --- CƠ CHẾ CHẶN NỘI DUNG (IMPORTANT) ---

  // 1. Nếu đang ở trang Login: Cho hiện luôn không cần check
  if (pathname === "/login") {
    return (
      <AuthContext.Provider value={{ 
        user, 
        login: (data: any) => {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
          router.push("/dashboard");
        },
        updateUser: (updatedData: any) => {
          setUser((prev: any) => {
            if (!prev) return null;
            const newUser = { ...prev, ...updatedData };
            localStorage.setItem("user", JSON.stringify(newUser));
            return newUser;
          });
        }
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

  // 2. Nếu đang load hoặc không có user ở trang bảo mật: 
  // Trả về màn hình trống hoàn toàn hoặc màn hình chờ.
  // Tuyệt đối KHÔNG trả về {children} ở đây để tránh bị lộ nội dung.
  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        {/* Bạn có thể để một icon loading ở đây */}
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // 3. Nếu đã xác minh có User và không phải trang login: Cho phép hiện nội dung trang web
  return (
    <AuthContext.Provider value={{ 
      user, 
      login: (data: any) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        router.push("/dashboard");
      },
      logout: () => {
        localStorage.clear();
        setUser(null);
        window.location.href = "/login";
      },
      updateUser: (updatedData: any) => {
        setUser((prev: any) => {
          if (!prev) return null;
          const newUser = { ...prev, ...updatedData };
          localStorage.setItem("user", JSON.stringify(newUser));
          return newUser;
        });
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
