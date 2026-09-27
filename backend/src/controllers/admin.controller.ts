import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AdminService } from '../services/admin.service';
import { OpportunityService } from '../services/opportunity.service';

export class AdminController {
  // Platform stats
  static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  // Student management
  static async getStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string | undefined;
      const students = await AdminService.getStudents(search);
      res.json(students);
    } catch (error) {
      next(error);
    }
  }

  // Opportunities
  static async createOpportunity(req: Request, res: Response, next: NextFunction) {
    try {
      const opportunity = await OpportunityService.create(req.body);
      res.status(201).json(opportunity);
    } catch (error) {
      next(error);
    }
  }

  static async updateOpportunity(req: Request, res: Response, next: NextFunction) {
    try {
      const opportunity = await OpportunityService.update(req.params.id as string, req.body);
      res.json(opportunity);
    } catch (error) {
      next(error);
    }
  }

  static async deleteOpportunity(req: Request, res: Response, next: NextFunction) {
    try {
      await OpportunityService.delete(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // Resources
  static async createResource(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await AdminService.createResource(req.body);
      res.status(201).json(resource);
    } catch (error) {
      next(error);
    }
  }

  static async updateResource(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await AdminService.updateResource(req.params.id as string, req.body);
      res.json(resource);
    } catch (error) {
      next(error);
    }
  }

  static async deleteResource(req: Request, res: Response, next: NextFunction) {
    try {
      await AdminService.deleteResource(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // Assessments
  static async getAssessments(_req: Request, res: Response, next: NextFunction) {
    try {
      const assessments = await AdminService.getAssessments();
      res.json(assessments);
    } catch (error) {
      next(error);
    }
  }

  static async createAssessment(req: Request, res: Response, next: NextFunction) {
    try {
      const assessment = await AdminService.createAssessment(req.body);
      res.status(201).json(assessment);
    } catch (error) {
      next(error);
    }
  }

  static async createQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const question = await AdminService.createQuestion(req.body);
      res.status(201).json(question);
    } catch (error) {
      next(error);
    }
  }

  static async updateQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const question = await AdminService.updateQuestion(req.params.id as string, req.body);
      res.json(question);
    } catch (error) {
      next(error);
    }
  }

  static async deleteQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      await AdminService.deleteQuestion(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  // Roadmaps
  static async createRoadmap(req: Request, res: Response, next: NextFunction) {
    try {
      const roadmap = await AdminService.createRoadmap(req.body);
      res.status(201).json(roadmap);
    } catch (error) {
      next(error);
    }
  }

  static async updateRoadmap(req: Request, res: Response, next: NextFunction) {
    try {
      const roadmap = await AdminService.updateRoadmap(req.params.id as string, req.body);
      res.json(roadmap);
    } catch (error) {
      next(error);
    }
  }

  static async deleteRoadmap(req: Request, res: Response, next: NextFunction) {
    try {
      await AdminService.deleteRoadmap(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async createModule(req: Request, res: Response, next: NextFunction) {
    try {
      const mod = await AdminService.createModule(req.body);
      res.status(201).json(mod);
    } catch (error) {
      next(error);
    }
  }

  static async updateModule(req: Request, res: Response, next: NextFunction) {
    try {
      const mod = await AdminService.updateModule(req.params.id as string, req.body);
      res.json(mod);
    } catch (error) {
      next(error);
    }
  }

  static async deleteModule(req: Request, res: Response, next: NextFunction) {
    try {
      await AdminService.deleteModule(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
