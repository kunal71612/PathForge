import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { RoadmapService } from '../services/roadmap.service';
import prisma from '../config/database';

export class RoadmapController {
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const roadmaps = await RoadmapService.getAll();
      res.json(roadmaps);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const roadmap = await RoadmapService.getById(req.params.id as string, req.user?.id);
      res.json(roadmap);
    } catch (error) {
      next(error);
    }
  }

  static async getGoals(_req: Request, res: Response, next: NextFunction) {
    try {
      const goals = await prisma.goal.findMany({
        include: { _count: { select: { roadmaps: true } } },
        orderBy: { name: 'asc' },
      });
      res.json(goals);
    } catch (error) {
      next(error);
    }
  }

  static async createGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = await prisma.goal.create({ data: req.body });
      res.status(201).json(goal);
    } catch (error) {
      next(error);
    }
  }

  static async updateGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = await prisma.goal.update({
        where: { id: req.params.id as string },
        data: req.body,
      });
      res.json(goal);
    } catch (error) {
      next(error);
    }
  }

  static async deleteGoal(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.goal.delete({ where: { id: req.params.id as string } });
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
