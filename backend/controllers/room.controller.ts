import { Request, Response } from "express";
import { RoomService } from "../services/room.service";

export const RoomController = {
  // 1. Lấy danh sách phòng
  getRooms: async (req: Request, res: Response) => {
    try {
      const rooms = await RoomService.getAllRooms();
      res.json(rooms);
    } catch (error: any) {
      res.status(500).json({ message: "Lỗi server khi lấy danh sách phòng: " + error.message });
    }
  },

  // 1.5. Lấy danh sách loại phòng
  getRoomTypes: async (req: Request, res: Response) => {
    try {
      const roomTypes = await RoomService.getRoomTypes();
      res.json(roomTypes);
    } catch (error: any) {
      res.status(500).json({ message: "Lỗi server khi lấy danh sách loại phòng: " + error.message });
    }
  },

  // 2. Tạo phòng mới
  create: async (req: Request, res: Response) => {
    try {
      const newRoom = await RoomService.createRoom(req.body);
      res.status(201).json({
        message: "Thêm phòng thành công",
        data: newRoom
      });
    } catch (error: any) {
      res.status(400).json({ message: "Lỗi khi tạo phòng: " + error.message });
    }
  },

  // 3. Cập nhật thông tin phòng
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updatedRoom = await RoomService.updateRoom(id, req.body);
      res.json({
        message: "Cập nhật phòng thành công",
        data: updatedRoom
      });
    } catch (error: any) {
      res.status(400).json({ message: "Lỗi khi cập nhật phòng: " + error.message });
    }
  },

  updateHousekeeping: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const status = String(req.body.status || "").toUpperCase();
      if (!["DIRTY", "CLEANING", "AVAILABLE"].includes(status)) {
        return res.status(400).json({ message: "Trạng thái buồng phòng không hợp lệ" });
      }
      const updatedRoom = await RoomService.updateOperationalStatus(id, status);
      res.json({ message: status === "AVAILABLE" ? "Phòng đã sẵn sàng bán" : "Đã cập nhật công việc buồng phòng", data: updatedRoom });
    } catch (error: any) {
      res.status(400).json({ message: "Lỗi cập nhật buồng phòng: " + error.message });
    }
  },

  // 4. Xóa phòng
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await RoomService.deleteRoom(id);
      res.json({
        message: "Xóa phòng thành công"
      });
    } catch (error: any) {
      res.status(400).json({ message: "Lỗi khi xóa phòng: " + error.message });
    }
  }
};
