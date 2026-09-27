import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ProfileService } from '../services/profile.service';

export class ProfileController {
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await ProfileService.getProfile(req.user!.id);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await ProfileService.updateProfile(req.user!.id, req.body);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
}
