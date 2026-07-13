"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Building2, Database, ImagePlus, Info, Loader2, Moon, Save, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
import { hasPermission, useAuth } from "@/contexts/auth-context";
import { EMPTY_HOTEL_PROFILE, HotelProfile, HotelProfileAPI } from "@/services/hotel-profile.service";

type ProfileFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
};

function ProfileField({ label, value, onChange, placeholder, type = "text", required, disabled }: ProfileFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-11 rounded-xl bg-background"
      />
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const canEdit = hasPermission(user, "ROLE_ASSIGN");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<HotelProfile>(EMPTY_HOTEL_PROFILE);

  useEffect(() => {
    setMounted(true);
    HotelProfileAPI.get()
      .then(setProfile)
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (field: keyof HotelProfile, value: string | null) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const chooseLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
      toast.error("Chỉ chấp nhận ảnh PNG, JPG hoặc WEBP");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo không được vượt quá 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateField("logoDataUrl", String(reader.result));
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      setProfile(await HotelProfileAPI.update(profile));
      toast.success("Đã lưu thông tin khách sạn");
    } catch (error: any) {
      toast.error(error.message || "Không thể lưu thông tin khách sạn");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader title="Cài đặt hệ thống" subtitle="Thông tin pháp lý và cấu hình chung của khách sạn" />
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl"><Building2 className="size-5 text-primary" /> Thông tin khách sạn</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">Dữ liệu này được sử dụng trên báo cáo và hóa đơn in cho khách hàng.</p>
                  </div>
                  {canEdit && <Button onClick={saveProfile} disabled={loading || saving} className="min-w-32 rounded-xl"><Save />{saving ? "Đang lưu..." : "Lưu thông tin"}</Button>}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="flex h-72 items-center justify-center"><Loader2 className="size-7 animate-spin text-primary" /></div>
                ) : (
                  <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
                    <section className="space-y-5 border-b p-6 lg:border-b-0 lg:border-r">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100">Thông tin hoạt động</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <ProfileField label="Tên khách sạn" required value={profile.hotelName} onChange={(value) => updateField("hotelName", value)} disabled={!canEdit} placeholder="Tên thương hiệu khách sạn" />
                        <ProfileField label="Số điện thoại" value={profile.phone} onChange={(value) => updateField("phone", value)} disabled={!canEdit} placeholder="Số điện thoại lễ tân" />
                        <ProfileField label="Email khách sạn" type="email" value={profile.email} onChange={(value) => updateField("email", value)} disabled={!canEdit} placeholder="contact@hotel.com" />
                        <ProfileField label="Website" value={profile.website} onChange={(value) => updateField("website", value)} disabled={!canEdit} placeholder="https://hotel.com" />
                        <div className="sm:col-span-2"><ProfileField label="Địa chỉ khách sạn" required value={profile.address} onChange={(value) => updateField("address", value)} disabled={!canEdit} placeholder="Số nhà, đường, phường/xã" /></div>
                        <ProfileField label="Quốc gia" value={profile.country} onChange={(value) => updateField("country", value)} disabled={!canEdit} />
                        <ProfileField label="Tỉnh / Thành phố" value={profile.province} onChange={(value) => updateField("province", value)} disabled={!canEdit} />
                        <ProfileField label="Loại hình kinh doanh" value={profile.businessType} onChange={(value) => updateField("businessType", value)} disabled={!canEdit} />
                        <ProfileField label="Mã số thuế" value={profile.taxCode} onChange={(value) => updateField("taxCode", value)} disabled={!canEdit} />
                        <div className="sm:col-span-2"><ProfileField label="Số giấy phép kinh doanh" value={profile.businessLicense} onChange={(value) => updateField("businessLicense", value)} disabled={!canEdit} placeholder="Số đăng ký/giấy phép kinh doanh" /></div>
                      </div>

                      <div className="space-y-2 border-t pt-5">
                        <Label className="font-semibold">Logo khách sạn</Label>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          <div className="flex size-40 items-center justify-center overflow-hidden rounded-xl border bg-muted/20">
                            {profile.logoDataUrl ? <img src={profile.logoDataUrl} alt="Logo khách sạn" className="max-h-full max-w-full object-contain p-3" /> : <Building2 className="size-12 text-muted-foreground/40" />}
                          </div>
                          {canEdit && <div className="space-y-2"><Label htmlFor="hotel-logo" className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border bg-background px-4 text-sm font-semibold hover:bg-muted"><ImagePlus className="size-4" /> Chọn logo</Label><Input id="hotel-logo" type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={chooseLogo} />{profile.logoDataUrl && <Button type="button" variant="ghost" className="block text-destructive" onClick={() => updateField("logoDataUrl", null)}><Trash2 /> Xóa logo</Button>}<p className="text-xs text-muted-foreground">PNG, JPG hoặc WEBP, tối đa 2MB.</p></div>}
                        </div>
                      </div>
                    </section>

                    <section className="space-y-5 bg-muted/10 p-6">
                      <div><h3 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100"><ShieldCheck className="size-4 text-primary" /> Thông tin chủ khách sạn</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">Thông tin xác định chủ thể sở hữu, phục vụ đối chiếu khi có tranh chấp.</p></div>
                      <ProfileField label="Tên chủ khách sạn / pháp nhân" required value={profile.ownerName} onChange={(value) => updateField("ownerName", value)} disabled={!canEdit} />
                      <ProfileField label="Email chủ khách sạn" type="email" value={profile.ownerEmail} onChange={(value) => updateField("ownerEmail", value)} disabled={!canEdit} />
                      <ProfileField label="Số điện thoại chủ khách sạn" value={profile.ownerPhone} onChange={(value) => updateField("ownerPhone", value)} disabled={!canEdit} />
                      <ProfileField label="CCCD/Hộ chiếu người đại diện" value={profile.ownerIdentity} onChange={(value) => updateField("ownerIdentity", value)} disabled={!canEdit} />
                      {!canEdit && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">Bạn chỉ có quyền xem. Chỉ tài khoản được phép gán phân quyền mới có thể thay đổi thông tin sở hữu.</div>}
                    </section>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Moon className="size-4" /> Giao diện</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between"><div><Label className="text-base">Chế độ tối</Label><p className="text-sm text-muted-foreground">Chuyển giao diện sang tông màu tối</p></div>{mounted ? <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} /> : <Switch disabled />}</div></CardContent></Card>
              <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Info className="size-4" /> Thông tin hệ thống</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between border-b pb-3"><span className="text-muted-foreground">Phiên bản</span><strong>v1.2.0-stable</strong></div><div className="flex justify-between"><span className="flex items-center gap-1 text-muted-foreground"><Database className="size-3.5" /> Database</span><span>PostgreSQL</span></div></CardContent></Card>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 text-sm italic text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              <p>* Thông tin khách sạn được hiển thị trên báo cáo và hóa đơn in cho khách hàng.</p>
              <p className="mt-1">* Thông tin chủ sở hữu giúp xác định quyền sở hữu khách sạn và hỗ trợ đối chiếu khi phát sinh tranh chấp.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
