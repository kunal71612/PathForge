import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SkillService } from '../services/skill.service';

export class SkillController {
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const skills = await SkillService.getAll();
      res.json(skills);
    } catch (error) {
      next(error);
    }
  }

  static async getMySkills(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const skills = await SkillService.getStudentSkills(req.user!.id);
      res.json(skills);
    } catch (error) {
      next(error);
    }
  }

  static async getSkillDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const detail = await SkillService.getSkillDetail(req.user!.id, req.params.id as string);
      res.json(detail);
    } catch (error) {
      next(error);
    }
  }

  static async addStudentSkill(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const skill = await SkillService.addStudentSkill(req.user!.id, req.body);
      res.status(201).json(skill);
    } catch (error) {
      next(error);
    }
  }

  static async updateStudentSkill(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const skill = await SkillService.updateStudentSkill(
        req.user!.id,
        req.params.id as string,
        req.body
      );
      res.json(skill);
    } catch (error) {
      next(error);
    }
  }

  static async deleteStudentSkill(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await SkillService.deleteStudentSkill(req.user!.id, req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
