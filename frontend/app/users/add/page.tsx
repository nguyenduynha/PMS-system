"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { PermissionSelector } from "@/components/permission-selector";
import { getDefaultPermissions as getFineGrainedDefaults } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { UserAPI } from "@/services/user.service";
import { RoleAPI } from "@/services/role.service";
import { toast } from "sonner";

import {
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Plus,
  Save,
  ShieldCheck,
  Upload,
  UserPlus,
  X,
} from "lucide-react";

type CurrentUser = {
  id?: string;
  usercode?: string;
  fullName?: string;
  email?: string;
  role?: string;
};

type Position = {
  id: string | number;
  position_name: string;
  description?: string | null;
};

type UserFormData = {
  usercode: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  avatarUrl: string;
  role: string;
  roleId: string;
  status: string;
  positionId: string;
  permissions: string[];
};

const AVAILABLE_PERMISSIONS = [
  {
    key: "DASHBOARD",
    name: "Tổng quan (Dashboard)",
    desc: "Xem biểu đồ doanh thu và số liệu tổng hợp hệ thống",
  },
  {
    key: "ROOMS",
    name: "Quản lý phòng (Rooms)",
    desc: "Xem trạng thái, sơ đồ phòng và thực hiện dọn dẹp phòng",
  },
  {
    key: "BOOKINGS",
    name: "Đặt phòng (Bookings)",
    desc: "Tạo đặt phòng, nhận phòng và trả phòng",
  },
  {
    key: "CUSTOMERS",
    name: "Quản lý khách hàng (Customers)",
    desc: "Xem danh sách khách hàng, lịch sử đặt phòng và chi tiêu",
  },
  {
    key: "SERVICES",
    name: "Dịch vụ phòng (Services)",
    desc: "Quản lý dịch vụ ăn uống, giặt là và các dịch vụ khác",
  },
  {
    key: "INVOICES",
    name: "Hóa đơn & In ấn (Invoices)",
    desc: "Thanh toán, xuất hóa đơn và in hóa đơn",
  },
  {
    key: "INVENTORY",
    name: "Quản lý kho (Inventory)",
    desc: "Quản lý nhập xuất hàng hóa và trang thiết bị",
  },
  {
    key: "FINANCE",
    name: "Thu chi (Finance)",
    desc: "Theo dõi giao dịch, quỹ tiền mặt và dòng tiền",
  },
  {
    key: "REPORTS",
    name: "Thống kê (Reports)",
    desc: "Xem báo cáo doanh thu theo ngày, tháng và năm",
  },
  {
    key: "USERS",
    name: "Tài khoản & Phân quyền (Users)",
    desc: "Quản lý tài khoản, vai trò và quyền truy cập hệ thống",
  },
];

const getDefaultPermissions = (role: string): string[] => {
  return getFineGrainedDefaults(role);
};

const normalizeRole = (role: unknown): string => {
  return String(role || "")
    .trim()
    .toUpperCase();
};

const readCurrentUser = (): CurrentUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const possibleKeys = [
    "user",
    "currentUser",
    "authUser",
    "auth",
  ];

  for (const key of possibleKeys) {
    const storedValue = localStorage.getItem(key);

    if (!storedValue) {
      continue;
    }

    try {
      const parsedValue = JSON.parse(storedValue);

      const userData =
        parsedValue?.user ??
        parsedValue?.data?.user ??
        parsedValue;

      if (userData && typeof userData === "object") {
        return {
          ...userData,
          role: normalizeRole(userData.role),
        };
      }
    } catch {
      continue;
    }
  }

  return null;
};

export default function AddUserPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const [newPosName, setNewPosName] = useState("");
  const [isAddingPos, setIsAddingPos] = useState(false);
  const [posLoading, setPosLoading] = useState(false);

  const [formData, setFormData] =
    useState<UserFormData>({
      usercode: "",
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
      avatarUrl: "",
      role: "STAFF",
      roleId: "",
      status: "ACTIVE",
      positionId: "",
      permissions: getDefaultPermissions("STAFF"),
    });

  const currentRole = normalizeRole(currentUser?.role);
  const isSuperAdmin = currentRole === "SUPERADMIN";

  // Lấy thông tin tài khoản đang đăng nhập
  useEffect(() => {
    const user = readCurrentUser();
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    RoleAPI.getRoles().then(setRoles).catch(() => setRoles([]));
  }, []);

  // Nếu tài khoản không phải SUPERADMIN nhưng form đang chứa SUPERADMIN,
  // tự động đưa về ADMIN
  useEffect(() => {
    if (
      currentUser &&
      !isSuperAdmin &&
      formData.role === "SUPERADMIN"
    ) {
      setFormData((previous) => ({
        ...previous,
        role: "ADMIN",
        roleId: roles.find((role) => role.code === "ADMIN")?.id || "",
        permissions: getDefaultPermissions("ADMIN"),
      }));
    }
  }, [currentUser, isSuperAdmin, formData.role, roles]);

  // Lấy danh sách chức vụ
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await UserAPI.getPositions();

        if (Array.isArray(response)) {
          setPositions(response);
          return;
        }

        if (
          response &&
          Array.isArray(response.data)
        ) {
          setPositions(response.data);
          return;
        }

        setPositions([]);
      } catch (error) {
        console.error(
          "Lỗi khi lấy danh sách chức vụ:",
          error
        );

        setPositions([]);

        toast.error(
          "Không thể tải danh sách chức vụ"
        );
      }
    };

    fetchPositions();
  }, []);

  // Đồng bộ vai trò theo chức vụ
  useEffect(() => {
    if (
      !formData.positionId ||
      positions.length === 0
    ) {
      return;
    }

    const selectedPosition = positions.find(
      (position) =>
        position.id.toString() ===
        formData.positionId
    );

    if (!selectedPosition) {
      return;
    }

    const positionName =
      selectedPosition.position_name
        .trim()
        .toUpperCase();

    let newRole = "STAFF";

    if (
      positionName === "SUPERADMIN" &&
      isSuperAdmin
    ) {
      newRole = "SUPERADMIN";
    } else if (positionName === "ADMIN") {
      newRole = "ADMIN";
    } else if (
      positionName.includes("QUẢN LÝ") ||
      positionName.includes("MANAGER") ||
      positionName.includes("TRƯỞNG BỘ PHẬN")
    ) {
      newRole = "MANAGER";
    }

    setFormData((previous) => ({
      ...previous,
      role: newRole,
      roleId: roles.find((role) => role.code === newRole)?.id || "",
      permissions:
        getDefaultPermissions(newRole),
    }));
  }, [
    formData.positionId,
    positions,
    roles,
    isSuperAdmin,
  ]);

  const handleUploadImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn đúng định dạng ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "Ảnh đại diện phải nhỏ hơn 5 MB"
      );
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string;

          const response =
            await UserAPI.uploadAvatar(base64Data);

          if (!response?.url) {
            throw new Error(
              "Không nhận được URL ảnh đại diện"
            );
          }

          setFormData((previous) => ({
            ...previous,
            avatarUrl: response.url,
          }));

          toast.success(
            "Tải ảnh đại diện thành công"
          );
        } catch (error: any) {
          console.error(
            "Lỗi upload ảnh:",
            error
          );

          toast.error(
            error?.message ||
              "Không thể tải ảnh lên server"
          );
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        setUploading(false);

        toast.error(
          "Không thể đọc dữ liệu hình ảnh"
        );
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      setUploading(false);

      toast.error(
        error?.message ||
          "Không thể xử lý hình ảnh"
      );
    }
  };

  const handleRoleChange = (value: string) => {
    const selectedRole = normalizeRole(value);

    if (
      selectedRole === "SUPERADMIN" &&
      !isSuperAdmin
    ) {
      toast.error(
        "Chỉ SUPERADMIN mới được cấp vai trò SUPERADMIN"
      );

      return;
    }

    setFormData((previous) => ({
      ...previous,
      role: selectedRole,
      roleId: roles.find((role) => role.code === selectedRole)?.id || "",
      permissions: roles.find((role) => role.code === selectedRole)?.permissionIds || getDefaultPermissions(selectedRole),
    }));
  };

  const handlePermissionChange = (
    permissionKey: string,
    checked: boolean
  ) => {
    setFormData((previous) => {
      const permissions = checked
        ? Array.from(
            new Set([
              ...previous.permissions,
              permissionKey,
            ])
          )
        : previous.permissions.filter(
            (permission) =>
              permission !== permissionKey
          );

      return {
        ...previous,
        permissions,
      };
    });
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const requestedRole = normalizeRole(
      formData.role
    );

    if (!currentUser) {
      toast.error(
        "Không xác định được tài khoản đang đăng nhập. Vui lòng đăng nhập lại."
      );

      return;
    }

    if (
      requestedRole === "SUPERADMIN" &&
      !isSuperAdmin
    ) {
      toast.error(
        "Chỉ SUPERADMIN mới được tạo tài khoản SUPERADMIN"
      );

      return;
    }

    if (!formData.usercode.trim()) {
      toast.error("Vui lòng nhập mã nhân viên");
      return;
    }

    if (!formData.fullName.trim()) {
      toast.error("Vui lòng nhập họ và tên");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }

    if (!formData.password.trim()) {
      toast.error("Vui lòng nhập mật khẩu");
      return;
    }

    if (formData.password.length < 6) {
      toast.error(
        "Mật khẩu phải có ít nhất 6 ký tự"
      );
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        usercode: formData.usercode
          .trim()
          .toUpperCase(),
        fullName: formData.fullName.trim(),
        email: formData.email
          .trim()
          .toLowerCase(),
        phoneNumber:
          formData.phoneNumber.trim() || null,
        role: requestedRole,
        positionId: formData.positionId
          ? Number(formData.positionId)
          : null,
      };

      await UserAPI.createUser(submitData);

      toast.success(
        "Thêm nhân viên mới thành công"
      );

      router.push("/users");
      router.refresh();
    } catch (error: any) {
      console.error("Submit error:", error);

      toast.error(
        error?.message ||
          "Không thể tạo nhân viên"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePosition = async () => {
    const positionName = newPosName.trim();

    if (!positionName) {
      toast.error(
        "Vui lòng nhập tên chức vụ"
      );

      return;
    }

    setPosLoading(true);

    try {
      const response =
        await UserAPI.createPosition({
          position_name: positionName,
        });

      const createdPosition =
        response?.data ?? response;

      if (!createdPosition?.id) {
        throw new Error(
          "Không nhận được dữ liệu chức vụ mới"
        );
      }

      setPositions((previous) => [
        ...previous,
        createdPosition,
      ]);

      setFormData((previous) => ({
        ...previous,
        positionId:
          createdPosition.id.toString(),
      }));

      setNewPosName("");
      setIsAddingPos(false);

      toast.success(
        "Thêm chức vụ mới thành công"
      );
    } catch (error: any) {
      console.error(
        "Lỗi tạo chức vụ:",
        error
      );

      toast.error(
        error?.message ||
          "Không thể tạo chức vụ"
      );
    } finally {
      setPosLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-muted/30">
      <AppSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          title="Thêm nhân viên"
          subtitle="Tạo tài khoản và phân quyền chức vụ"
        />

        <main className="flex flex-1 justify-center overflow-auto p-6">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-4xl space-y-4"
          >
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              <ChevronLeft className="mr-2 size-4" />
              Quay lại danh sách
            </Button>

            <Card className="border-t-4 border-t-primary shadow-lg">
              <CardHeader className="border-b bg-background">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <UserPlus className="size-6 text-primary" />
                  </div>

                  <div>
                    <CardTitle>
                      Hồ sơ nhân viên mới
                    </CardTitle>

                    <CardDescription>
                      Thiết lập thông tin tài khoản,
                      chức vụ và quyền truy cập
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8 pt-6">
                <div className="flex flex-col items-start gap-8 md:flex-row">
                  <div className="flex flex-col items-center gap-4">
                    <Label className="font-medium">
                      Ảnh đại diện
                    </Label>

                    <div className="group relative flex size-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed bg-muted">
                      {formData.avatarUrl ? (
                        <>
                          <img
                            src={formData.avatarUrl}
                            alt="Ảnh đại diện"
                            className="size-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setFormData(
                                (previous) => ({
                                  ...previous,
                                  avatarUrl: "",
                                })
                              )
                            }
                            className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label="Xóa ảnh đại diện"
                          >
                            <X className="size-3" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-[10px] text-muted-foreground">
                          {uploading ? (
                            <Loader2 className="size-6 animate-spin" />
                          ) : (
                            <Upload className="mb-1 size-6" />
                          )}

                          <span>
                            {uploading
                              ? "Đang tải"
                              : "Tải ảnh"}
                          </span>
                        </div>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                        onChange={handleUploadImage}
                        className="hidden"
                      />

                      <button
                        type="button"
                        className="absolute inset-0 cursor-pointer"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        aria-label="Chọn ảnh đại diện"
                        disabled={uploading}
                      />
                    </div>
                  </div>

                  <div className="w-full flex-1 space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="usercode">
                          Mã nhân viên *
                        </Label>

                        <Input
                          id="usercode"
                          placeholder="NV-001"
                          required
                          value={formData.usercode}
                          onChange={(event) =>
                            setFormData(
                              (previous) => ({
                                ...previous,
                                usercode:
                                  event.target.value,
                              })
                            )
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="fullName">
                          Họ và tên *
                        </Label>

                        <Input
                          id="fullName"
                          placeholder="Nguyễn Văn A"
                          required
                          value={formData.fullName}
                          onChange={(event) =>
                            setFormData(
                              (previous) => ({
                                ...previous,
                                fullName:
                                  event.target.value,
                              })
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">
                        Email công việc *
                      </Label>

                      <Input
                        id="email"
                        type="email"
                        placeholder="email@company.com"
                        required
                        value={formData.email}
                        onChange={(event) =>
                          setFormData(
                            (previous) => ({
                              ...previous,
                              email:
                                event.target.value,
                            })
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-dashed" />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">
                        Chức vụ
                      </Label>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-primary"
                        onClick={() =>
                          setIsAddingPos(
                            (previous) => !previous
                          )
                        }
                      >
                        {isAddingPos ? (
                          <X className="mr-1 size-3" />
                        ) : (
                          <Plus className="mr-1 size-3" />
                        )}

                        {isAddingPos
                          ? "Hủy"
                          : "Thêm mới"}
                      </Button>
                    </div>

                    {isAddingPos ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Tên chức vụ mới"
                          value={newPosName}
                          onChange={(event) =>
                            setNewPosName(
                              event.target.value
                            )
                          }
                          className="h-9"
                        />

                        <Button
                          type="button"
                          size="sm"
                          className="h-9"
                          onClick={
                            handleCreatePosition
                          }
                          disabled={posLoading}
                        >
                          {posLoading ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            "Lưu"
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Select
                        value={formData.positionId}
                        onValueChange={(value) =>
                          setFormData(
                            (previous) => ({
                              ...previous,
                              positionId: value,
                            })
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chức vụ" />
                        </SelectTrigger>

                        <SelectContent>
                          {positions.length > 0 ? (
                            positions.map(
                              (position) => (
                                <SelectItem
                                  key={position.id}
                                  value={position.id.toString()}
                                >
                                  {
                                    position.position_name
                                  }
                                </SelectItem>
                              )
                            )
                          ) : (
                            <SelectItem
                              value="none"
                              disabled
                            >
                              Chưa có chức vụ
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">
                      Số điện thoại
                    </Label>

                    <Input
                      id="phone"
                      type="tel"
                      placeholder="09xxxxxxxx"
                      value={formData.phoneNumber}
                      onChange={(event) =>
                        setFormData(
                          (previous) => ({
                            ...previous,
                            phoneNumber:
                              event.target.value,
                          })
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>
                      Vai trò hệ thống
                    </Label>

                    <Select
                      value={formData.role}
                      onValueChange={
                        handleRoleChange
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="ADMIN">
                          ADMIN - Quản trị viên
                        </SelectItem>

                        <SelectItem value="MANAGER">
                          MANAGER - Quản lý bộ phận
                        </SelectItem>

                        <SelectItem value="STAFF">
                          STAFF - Nhân viên nghiệp vụ
                        </SelectItem>
                        {roles.filter((role) => !["SUPERADMIN", "ADMIN", "MANAGER", "STAFF"].includes(role.code)).map((role) => (
                          <SelectItem key={role.id} value={role.code}>{role.name} ({role.code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="password"
                      className="font-medium"
                    >
                      Mật khẩu khởi tạo *
                    </Label>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        placeholder="Nhập mật khẩu"
                        className="pl-9 pr-10"
                        required
                        value={formData.password}
                        onChange={(event) =>
                          setFormData(
                            (previous) => ({
                              ...previous,
                              password:
                                event.target.value,
                            })
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (previous) =>
                              !previous
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
                        aria-label={
                          showPassword
                            ? "Ẩn mật khẩu"
                            : "Hiện mật khẩu"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <hr className="border-dashed" />

                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <ShieldCheck className="size-5 text-blue-600" />
                      Quyền truy cập chức năng
                    </Label>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Các quyền được tự động chọn theo
                      vai trò và có thể điều chỉnh
                      theo nhu cầu.
                    </p>
                  </div>

                  <PermissionSelector
                    value={formData.permissions}
                    onChange={(permissions) => setFormData((previous) => ({ ...previous, permissions }))}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-between border-t bg-muted/10 p-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Hủy bỏ
                </Button>

                <Button
                  type="submit"
                  disabled={
                    loading || uploading
                  }
                >
                  {loading ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 size-4" />
                  )}

                  Lưu thông tin
                </Button>
              </CardFooter>
            </Card>
          </form>
        </main>
      </div>
    </div>
  );
}
