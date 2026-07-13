import { Request, Response } from "express";
import { HotelProfileService } from "../services/hotel-profile.service";

export const HotelProfileController = {
  get: async (_req: Request, res: Response) => {
    try {
      res.json(await HotelProfileService.get());
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Không thể tải thông tin khách sạn" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      res.json(await HotelProfileService.update(req.body));
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Không thể lưu thông tin khách sạn" });
    }
  },
};
