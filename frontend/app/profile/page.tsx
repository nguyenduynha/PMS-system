"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAPI } from "@/services/user.service";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Lock, Camera, Loader2, Save, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    avatarUrl: user?.avatarUrl || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Cập nhật formData khi user từ context đã load xong
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber || "",
        avatarUrl: user.avatarUrl || "",
      }));
    }
  }, [user]);

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!/^image\/(png|jpeg|jpg|gif|webp)$/.test(file.type)) {
      toast.error("Chỉ hỗ trợ ảnh PNG, JPG, GIF hoặc WEBP");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5 MB");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Không thể đọc file ảnh"));
        reader.readAsDataURL(file);
      });

      const response = await UserAPI.uploadAvatar(base64Data);
      setFormData((prev) => ({ ...prev, avatarUrl: response.url }));
      toast.success("Cập nhật ảnh đại diện tạm thời, nhấn Lưu để hoàn tất");
    } catch (error: any) {
      toast.error(error?.message || "Lỗi tải ảnh");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const wantsToChangePassword = Boolean(
      formData.currentPassword || formData.newPassword || formData.confirmPassword
    );

    if (wantsToChangePassword) {
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        toast.error("Vui lòng nhập đầy đủ ba trường mật khẩu");
        return;
      }
      if (formData.newPassword.length < 6) {
        toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("Xác nhận mật khẩu mới không khớp");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await UserAPI.updateUser(user.id, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        avatarUrl: formData.avatarUrl,
      });

      if (wantsToChangePassword) {
        await UserAPI.changeOwnPassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        });
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }
      
      if (res.data) {
        updateUser(res.data);
      }
      toast.success(wantsToChangePassword ? "Cập nhật hồ sơ và đổi mật khẩu thành công!" : "Cập nhật hồ sơ thành công!");
    } catch (error: any) {
      toast.error(error?.message || "Không thể cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-muted/30">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader title="Hồ sơ cá nhân" subtitle="Quản lý thông tin tài khoản của bạn" />
        <main className="flex-1 overflow-auto p-6 flex justify-center">
          <form onSubmit={handleUpdateProfile} className="w-full max-w-3xl space-y-6">
            <Card className="shadow-md">
              <CardHeader className="border-b">
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative size-32 group">
                    <div className="size-full rounded-full border-4 border-background shadow-xl overflow-hidden bg-muted flex items-center justify-center">
                      {formData.avatarUrl ? (
                        <img src={formData.avatarUrl} className="size-full object-cover" />
                      ) : (
                        <User className="size-12 text-muted-foreground" />
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                    >
                      {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleUploadAvatar} accept="image/*" />
                  </div>
                  <Badge variant="outline" className="px-3 py-1 uppercase">{user?.role}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Họ và tên</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input className="pl-9" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email (Liên hệ Admin để đổi)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input className="pl-9 bg-muted" value={user?.email} disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Input className="pl-9" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Mã nhân viên</Label>
                    <Input className="bg-muted" value={user?.usercode} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-amber-100">
              <CardHeader className="bg-amber-50/50">
                <CardTitle className="text-amber-800 flex items-center gap-2">
                  <Lock className="size-5" /> Bảo mật & Mật khẩu
                </CardTitle>
                <CardDescription>Nhập đủ ba trường nếu bạn muốn thay đổi mật khẩu</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Mật khẩu hiện tại</Label>
                    <Input type="password" autoComplete="current-password" placeholder="Nhập mật khẩu hiện tại" value={formData.currentPassword} onChange={(e) => setFormData({...formData, currentPassword: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Mật khẩu mới</Label>
                    <Input type="password" autoComplete="new-password" placeholder="Tối thiểu 6 ký tự" value={formData.newPassword} onChange={(e) => setFormData({...formData, newPassword: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Xác nhận mật khẩu mới</Label>
                    <Input type="password" autoComplete="new-password" placeholder="Nhập lại mật khẩu mới" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/10 p-4 flex justify-end">
                <Button type="submit" disabled={loading || uploading}>
                  {loading ? <Loader2 className="mr-2 animate-spin size-4" /> : <Save className="mr-2 size-4" />}
                  Lưu thay đổi
                </Button>
              </CardFooter>
            </Card>
          </form>
        </main>
      </div>
    </div>
  );
}
