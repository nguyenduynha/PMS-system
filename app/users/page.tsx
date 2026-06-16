"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Plus, Shield, UserCheck, Lock, Edit, Unlock } from "lucide-react";

interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

function roleLabel(role: string) {
  switch (role) {
    case "ADMIN":
      return "Quản trị viên";
    case "STAFF":
      return "Nhân viên";
    case "MAINTENANCE":
      return "Kỹ thuật";
    case "HOUSEKEEPING":
      return "Buồng phòng";
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
    case "MAINTENANCE":
      return "bg-indigo-100 text-indigo-700";
    case "HOUSEKEEPING":
      return "bg-teal-100 text-teal-700";
    case "CUSTOMER":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("STAFF");
  const [status, setStatus] = useState("ACTIVE");

  const loadData = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setRole("STAFF");
    setStatus("ACTIVE");
    setOpenDialog(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setFullName(user.fullName);
    setEmail(user.email);
    setPhone(user.phone);
    setRole(user.role);
    setStatus(user.status);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!fullName || !email) {
      alert("Vui lòng điền họ tên và email");
      return;
    }

    try {
      const url = "/api/users";
      const method = editingUser ? "PUT" : "POST";
      const body = editingUser
        ? { id: editingUser.id, fullName, email, phone, role, status }
        : { fullName, email, phone, role, status };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setOpenDialog(false);
        loadData();
      }
    } catch (err) {
      console.error("Failed to save user", err);
    }
  };

  const handleToggleLock = async (user: UserAccount) => {
    const nextStatus = user.status === "LOCKED" ? "ACTIVE" : "LOCKED";
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Failed to toggle lock state", err);
    }
  };

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

            <Button onClick={handleOpenAdd}>
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
                  <p className="text-sm text-muted-foreground">Nhân viên & Staff</p>
                  <h3 className="text-2xl font-bold">
                    {users.filter((user) => user.role !== "ADMIN").length}
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
                            <p className="text-xs text-muted-foreground font-mono">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono">{user.email}</td>
                      <td className="p-4 font-mono">{user.phone || "N/A"}</td>

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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(user)}
                          >
                            <Edit className="mr-1 size-4" />
                            Sửa
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleLock(user)}
                          >
                            {user.status === "LOCKED" ? (
                              <>
                                <Unlock className="mr-1 size-4" />
                                Mở khóa
                              </>
                            ) : (
                              <>
                                <Lock className="mr-1 size-4" />
                                Khóa
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "Cập nhật người dùng" : "Tạo người dùng mới"}
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div>
                  <Label>Họ và tên</Label>
                  <Input
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="email@hotel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Số điện thoại</Label>
                  <Input
                    placeholder="0901234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Vai trò</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                      <SelectItem value="STAFF">Nhân viên</SelectItem>
                      <SelectItem value="MAINTENANCE">Kỹ thuật viên</SelectItem>
                      <SelectItem value="HOUSEKEEPING">Buồng phòng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Trạng thái</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                      <SelectItem value="LOCKED">Đã khóa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSave}>
                  Lưu
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}