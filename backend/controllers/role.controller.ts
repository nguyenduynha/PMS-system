import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { RoleService } from "../services/role.service";

export const RoleController = {
  getPermissions: async (_req: AuthRequest, res: Response) => {
    try { return res.json(await RoleService.getPermissions()); }
    catch (error: any) { return res.status(500).json({ message: error.message }); }
  },
  getRoles: async (_req: AuthRequest, res: Response) => {
    try { return res.json(await RoleService.getRoles()); }
    catch (error: any) { return res.status(500).json({ message: error.message }); }
  },
  create: async (req: AuthRequest, res: Response) => {
    try { return res.status(201).json({ message: "Tạo Role thành công", data: await RoleService.createRole(req.body) }); }
    catch (error: any) { return res.status(400).json({ message: error.message }); }
  },
  update: async (req: AuthRequest, res: Response) => {
    try { return res.json({ message: "Cập nhật Role thành công", data: await RoleService.updateRole(req.params.id, req.body) }); }
    catch (error: any) { return res.status(400).json({ message: error.message }); }
  },
  delete: async (req: AuthRequest, res: Response) => {
    try { await RoleService.deleteRole(req.params.id); return res.json({ message: "Xóa Role thành công" }); }
    catch (error: any) { return res.status(400).json({ message: error.message }); }
  },
};
