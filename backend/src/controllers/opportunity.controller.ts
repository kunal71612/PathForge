import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { OpportunityService } from '../services/opportunity.service';
import { RecommendationService } from '../services/recommendation.service';

export class OpportunityController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const opportunities = await OpportunityService.getAll(
        req.query as Record<string, string>
      );
      res.json(opportunities);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const opportunity = await OpportunityService.getById(req.params.id as string);
      res.json(opportunity);
    } catch (error) {
      next(error);
    }
  }

  static async getMatch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const match = await RecommendationService.getMatchForOpportunity(
        req.user!.id,
        req.params.id as string
      );
      res.json(match);
    } catch (error) {
      next(error);
    }
  }

  static async getRecommendations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const recommendations = await RecommendationService.getRecommendedOpportunities(
        req.user!.id
      );
      res.json(recommendations);
    } catch (error) {
      next(error);
    }
  }

  static async getGaps(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gaps = await RecommendationService.getSkillGaps(
        req.user!.id,
        req.params.id as string
      );
      res.json(gaps);
    } catch (error) {
      next(error);
    }
  }
}
