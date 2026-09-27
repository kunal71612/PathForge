import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ApplicationService } from '../services/application.service';

import prisma from '../config/database';

export class ApplicationController {
  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const apps = await ApplicationService.getAll(
        req.user!.id,
        req.query.status as string | undefined
      );
      res.json(apps);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const app = await ApplicationService.create(
        req.user!.id,
        req.body.opportunityId,
        req.body.notes
      );
      res.status(201).json(app);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const app = await ApplicationService.update(
        req.user!.id,
        req.params.id as string,
        req.body
      );
      res.json(app);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await ApplicationService.delete(req.user!.id, req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async getDeadlines(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const deadlines = await ApplicationService.getDeadlines(req.user!.id);
      res.json(deadlines);
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await ApplicationService.getStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  static async saveOpportunity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const opportunityId = req.params.id as string;
      const existing = await prisma.application.findUnique({
        where: { userId_opportunityId: { userId: req.user!.id, opportunityId } },
      });
      if (existing) {
        const app = await prisma.application.update({
          where: { id: existing.id },
          data: { status: 'SAVED' },
          include: { opportunity: true },
        });
        return res.json(app);
      }
      const app = await ApplicationService.create(req.user!.id, opportunityId, req.body.notes);
      res.status(201).json(app);
    } catch (error) {
      next(error);
    }
  }

  static async unsaveOpportunity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const opportunityId = req.params.id as string;
      const existing = await prisma.application.findUnique({
        where: { userId_opportunityId: { userId: req.user!.id, opportunityId } },
      });
      if (existing) {
        await prisma.application.delete({ where: { id: existing.id } });
      }
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async getSavedOpportunities(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const saved = await ApplicationService.getAll(req.user!.id, 'SAVED');
      res.json(saved);
    } catch (error) {
      next(error);
    }
  }

  static async applyOpportunity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const opportunityId = req.params.id as string;
      const existing = await prisma.application.findUnique({
        where: { userId_opportunityId: { userId: req.user!.id, opportunityId } },
      });
      if (existing) {
        const app = await prisma.application.update({
          where: { id: existing.id },
          data: { status: 'APPLIED' },
          include: { opportunity: true },
        });
        return res.json(app);
      }
      const app = await prisma.application.create({
        data: {
          userId: req.user!.id,
          opportunityId,
          status: 'APPLIED',
          notes: req.body.notes,
        },
        include: { opportunity: true },
      });
      res.status(201).json(app);
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const app = await ApplicationService.update(
        req.user!.id,
        req.params.id as string,
        { status: req.body.status, notes: req.body.notes }
      );
      res.json(app);
    } catch (error) {
      next(error);
    }
  }
}
