"use client";

import { CheckSquare2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PERMISSIONS, PERMISSION_MODULE_LABELS, normalizePermissions } from "@/lib/permissions";

type PermissionSelectorProps = {
  value: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
};

export function PermissionSelector({ value, onChange, disabled = false }: PermissionSelectorProps) {
  const selected = normalizePermissions(value);
  const modules = Object.keys(PERMISSION_MODULE_LABELS);

  const toggleModule = (module: string, checked: boolean) => {
    const moduleIds = PERMISSIONS.filter((permission) => permission.module === module).map((permission) => permission.id);
    onChange(checked ? Array.from(new Set([...selected, ...moduleIds])) : selected.filter((id) => !moduleIds.includes(id)));
  };

  const togglePermission = (permissionId: string, checked: boolean) => {
    onChange(checked ? Array.from(new Set([...selected, permissionId])) : selected.filter((id) => id !== permissionId));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {modules.map((module) => {
        const permissions = PERMISSIONS.filter((permission) => permission.module === module);
        const selectedCount = permissions.filter((permission) => selected.includes(permission.id)).length;
        const allChecked = selectedCount === permissions.length;
        const parentState = allChecked ? true : selectedCount > 0 ? "indeterminate" : false;
        return (
          <Card key={module} className={allChecked ? "border-primary/40 shadow-sm" : ""}>
            <CardHeader className="border-b bg-muted/30 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <CardTitle className="text-sm">{PERMISSION_MODULE_LABELS[module]}</CardTitle>
                </div>
                <Label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                  <Checkbox checked={parentState} disabled={disabled} onCheckedChange={(checked) => toggleModule(module, checked === true)} />
                  Chọn tất cả
                </Label>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 p-3">
              {permissions.map((permission) => (
                <Label key={permission.id} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-muted/50">
                  <Checkbox className="mt-0.5" checked={selected.includes(permission.id)} disabled={disabled} onCheckedChange={(checked) => togglePermission(permission.id, checked === true)} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-medium"><CheckSquare2 className="size-3.5 text-muted-foreground" />{permission.name}</span>
                    <span className="block text-xs font-normal text-muted-foreground">{permission.description}</span>
                    <span className="mt-0.5 block font-mono text-[10px] font-normal text-muted-foreground/70">{permission.id}</span>
                  </span>
                </Label>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
