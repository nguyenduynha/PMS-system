"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit, KeyRound, Loader2, Plus, Shield, Sparkles, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { PermissionSelector } from "@/components/permission-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { hasPermission, useAuth } from "@/contexts/auth-context";
import { RoleAPI } from "@/services/role.service";
import { ALL_PERMISSION_IDS } from "@/lib/permissions";

type RoleRecord = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isSystem: boolean;
  permissionIds: string[];
  userCount: number;
};

const emptyForm = { code: "", name: "", description: "", permissions: [] as string[] };

export function RoleManagement() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
  const [form, setForm] = useState(emptyForm);

  const canCreate = hasPermission(user, "ROLE_CREATE");
  const canUpdate = hasPermission(user, "ROLE_UPDATE") && hasPermission(user, "ROLE_ASSIGN_PERMISSION");
  const canDelete = hasPermission(user, "ROLE_DELETE");

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try { setRoles((await RoleAPI.getRoles()).filter((role: RoleRecord) => role.code !== "SUPERADMIN")); }
    catch (error: any) { toast.error(error.message || "Không thể tải danh sách Role"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  const openCreate = () => {
    setEditingRole(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (role: RoleRecord) => {
    setEditingRole(role);
    setForm({ code: role.code, name: role.name, description: role.description || "", permissions: role.permissionIds || [] });
    setOpen(true);
  };

  const saveRole = async () => {
    if (!form.name.trim() || (!editingRole && !form.code.trim())) {
      toast.error("Vui lòng nhập mã và tên Role");
      return;
    }
    setSaving(true);
    try {
      if (editingRole) await RoleAPI.updateRole(editingRole.id, form);
      else await RoleAPI.createRole(form);
      toast.success(editingRole ? "Cập nhật Role thành công" : "Tạo Role thành công");
      setOpen(false);
      await loadRoles();
    } catch (error: any) { toast.error(error.message || "Không thể lưu Role"); }
    finally { setSaving(false); }
  };

  const deleteRole = async (role: RoleRecord) => {
    if (!confirm(`Xóa Role "${role.name}"?`)) return;
    try { await RoleAPI.deleteRole(role.id); toast.success("Xóa Role thành công"); await loadRoles(); }
    catch (error: any) { toast.error(error.message || "Không thể xóa Role"); }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-6 text-white shadow-lg shadow-blue-500/10">
        <div className="absolute -right-12 -top-12 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <span className="rounded-2xl bg-white/15 p-3 backdrop-blur"><KeyRound className="size-7" /></span>
            <div><div className="mb-1 flex items-center gap-2"><h3 className="text-xl font-bold">Role & Permission</h3><Sparkles className="size-4 text-cyan-100" /></div><p className="max-w-xl text-sm text-blue-50">Thiết lập quyền truy cập chi tiết theo từng nghiệp vụ. Tài khoản hệ thống đặc biệt luôn được bảo mật và không xuất hiện tại đây.</p></div>
          </div>
          {canCreate && <Button onClick={openCreate} className="border border-white/25 bg-white text-blue-700 shadow-md hover:bg-blue-50"><Plus />Tạo Role mới</Button>}
        </div>
      </div>

      {loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="size-7 animate-spin" /></div> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id} className="group overflow-hidden border-border/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
              <div className="h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400" />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-2.5 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950"><Shield className="size-5" /></span><div><CardTitle className="text-base">{role.name}</CardTitle><p className="mt-0.5 font-mono text-[11px] tracking-wide text-muted-foreground">{role.code}</p></div></div>
                  {role.isSystem && <Badge className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50 dark:bg-blue-950 dark:text-blue-300">Role mặc định</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="min-h-10 text-sm text-muted-foreground">{role.description || "Chưa có mô tả"}</p>
                <div className="space-y-2 rounded-xl bg-muted/40 p-3"><div className="flex items-center justify-between text-xs"><span className="font-medium text-foreground">{role.permissionIds?.length || 0}/{ALL_PERMISSION_IDS.length} quyền</span><span className="flex items-center gap-1 text-muted-foreground"><Users className="size-3.5" />{role.userCount || 0} nhân viên</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500" style={{ width: `${Math.round(((role.permissionIds?.length || 0) / ALL_PERMISSION_IDS.length) * 100)}%` }} /></div></div>
                <div className="flex justify-end gap-2 border-t pt-3">
                  {canUpdate && <Button size="sm" variant="outline" onClick={() => openEdit(role)}><Edit />Sửa quyền</Button>}
                  {canDelete && !role.isSystem && <Button size="sm" variant="destructive" onClick={() => deleteRole(role)}><Trash2 />Xóa</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader><DialogTitle>{editingRole ? `Cập nhật Role: ${editingRole.name}` : "Tạo Role mới"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2 md:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="role-code">Mã Role</Label><Input id="role-code" value={form.code} disabled={Boolean(editingRole)} placeholder="FRONT_DESK" onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} /></div>
            <div className="space-y-2"><Label htmlFor="role-name">Tên Role</Label><Input id="role-name" value={form.name} placeholder="Lễ tân" onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
            <div className="space-y-2 md:col-span-2"><Label htmlFor="role-description">Mô tả</Label><Textarea id="role-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div>
          </div>
          <PermissionSelector value={form.permissions} onChange={(permissions) => setForm({ ...form, permissions })} />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button><Button onClick={saveRole} disabled={saving}>{saving && <Loader2 className="animate-spin" />}Lưu Role</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
