import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AssessmentService } from '../services/assessment.service';

export class AssessmentController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const assessments = await AssessmentService.getAll();
      res.json(assessments);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const assessment = await AssessmentService.getById(req.params.id as string);
      res.json(assessment);
    } catch (error) {
      next(error);
    }
  }

  static async submit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await AssessmentService.submit(
        req.user!.id,
        req.params.id as string,
        req.body.answers
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getAttempts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const attempts = await AssessmentService.getAttempts(
        req.user!.id,
        req.query.assessmentId as string | undefined
      );
      res.json(attempts);
    } catch (error) {
      next(error);
    }
  }
}
