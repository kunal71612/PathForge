import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  static async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dashboard = await DashboardService.getDashboard(req.user!.id);
      res.json(dashboard);
    } catch (error) {
      next(error);
    }
  }
}
