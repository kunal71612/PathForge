import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ResourceService } from '../services/resource.service';

export class ResourceController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const resources = await ResourceService.getAll(req.query as Record<string, string>);
      res.json(resources);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await ResourceService.getById(req.params.id as string);
      res.json(resource);
    } catch (error) {
      next(error);
    }
  }

  static async updateProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const progress = await ResourceService.updateProgress(
        req.user!.id,
        req.params.id as string,
        req.body.status
      );
      res.json(progress);
    } catch (error) {
      next(error);
    }
  }

  static async getMyProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const progress = await ResourceService.getProgress(req.user!.id);
      res.json(progress);
    } catch (error) {
      next(error);
    }
  }
}
