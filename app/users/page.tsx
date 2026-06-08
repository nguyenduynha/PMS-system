import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Shield, UserCheck, Lock, Edit } from "lucide-react";

const users = [
  {
    id: 1,
    fullName: "Nguyễn Văn A",
    email: "admin@hotel.com",
    phone: "0901234567",
    role: "ADMIN",
    status: "ACTIVE",
  },
  {
    id: 2,
    fullName: "Trần Thị B",
    email: "letan@hotel.com",
    phone: "0908888888",
    role: "STAFF",
    status: "ACTIVE",
  },
  {
    id: 3,
    fullName: "Lê Văn C",
    email: "khachhang@gmail.com",
    phone: "0912345678",
    role: "CUSTOMER",
    status: "LOCKED",
  },
];

function roleLabel(role: string) {
  switch (role) {
    case "ADMIN":
      return "Quản trị viên";
    case "STAFF":
      return "Nhân viên";
    case "CUSTOMER":
      return "Khách hàng";
    default:
      return role;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Đang hoạt động";
    case "LOCKED":
      return "Đã khóa";
    case "DEACTIVATED":
      return "Ngừng hoạt động";
    default:
      return status;
  }
}

function statusClass(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700";
    case "LOCKED":
      return "bg-red-100 text-red-700";
    case "DEACTIVATED":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function roleClass(role: string) {
  switch (role) {
    case "ADMIN":
      return "bg-blue-100 text-blue-700";
    case "STAFF":
      return "bg-amber-100 text-amber-700";
    case "CUSTOMER":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function UsersPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          title="Quản lý người dùng"
          subtitle="Quản lý tài khoản, vai trò và phân quyền trong hệ thống"
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Danh sách người dùng</h2>
              <p className="text-muted-foreground">
                Theo dõi tài khoản nhân viên, khách hàng và quyền truy cập hệ thống
              </p>
            </div>

            <Button>
              <Plus className="mr-2 size-4" />
              Thêm người dùng
            </Button>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-blue-100 p-3">
                  <Shield className="size-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quản trị viên</p>
                  <h3 className="text-2xl font-bold">
                    {users.filter((user) => user.role === "ADMIN").length}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-amber-100 p-3">
                  <UserCheck className="size-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nhân viên</p>
                  <h3 className="text-2xl font-bold">
                    {users.filter((user) => user.role === "STAFF").length}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-red-100 p-3">
                  <Lock className="size-6 text-red-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tài khoản bị khóa</p>
                  <h3 className="text-2xl font-bold">
                    {users.filter((user) => user.status === "LOCKED").length}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-left">Người dùng</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4 text-left">Số điện thoại</th>
                    <th className="p-4 text-left">Vai trò</th>
                    <th className="p-4 text-left">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/40">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Users className="size-5" />
                          </div>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">{user.email}</td>
                      <td className="p-4">{user.phone}</td>

                      <td className="p-4">
                        <Badge className={roleClass(user.role)}>
                          {roleLabel(user.role)}
                        </Badge>
                      </td>

                      <td className="p-4">
                        <Badge className={statusClass(user.status)}>
                          {statusLabel(user.status)}
                        </Badge>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="mr-1 size-4" />
                            Sửa
                          </Button>

                          <Button variant="outline" size="sm">
                            <Lock className="mr-1 size-4" />
                            Khóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}