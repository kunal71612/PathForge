import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, profileSchema, assessmentSubmitSchema, applicationSchema, applicationUpdateSchema, opportunitySchema, resourceSchema, questionSchema } from '../validators';

import { AuthController } from '../controllers/auth.controller';
import { ProfileController } from '../controllers/profile.controller';
import { RoadmapController } from '../controllers/roadmap.controller';
import { ResourceController } from '../controllers/resource.controller';
import { AssessmentController } from '../controllers/assessment.controller';
import { SkillController } from '../controllers/skill.controller';
import { OpportunityController } from '../controllers/opportunity.controller';
import { ApplicationController } from '../controllers/application.controller';
import { DashboardController } from '../controllers/dashboard.controller';
import { AdminController } from '../controllers/admin.controller';

import prisma from '../config/database';

export const router = Router();

// ── Health Check ──
router.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// ── Auth ──
router.post('/auth/register', validate(registerSchema), AuthController.register);
router.post('/auth/login', validate(loginSchema), AuthController.login);
router.get('/auth/me', authenticate, AuthController.getMe);

// ── Profile ──
router.get('/profile', authenticate, ProfileController.getProfile);
router.put('/profile', authenticate, validate(profileSchema), ProfileController.updateProfile);
router.get('/profile/skills', authenticate, SkillController.getMySkills);
router.post('/profile/skills', authenticate, SkillController.addStudentSkill);
router.put('/profile/skills/:id', authenticate, SkillController.updateStudentSkill);
router.delete('/profile/skills/:id', authenticate, SkillController.deleteStudentSkill);

// ── Goals ──
router.get('/goals', RoadmapController.getGoals);
router.post('/goals', authenticate, requireAdmin, RoadmapController.createGoal);
router.put('/goals/:id', authenticate, requireAdmin, RoadmapController.updateGoal);
router.delete('/goals/:id', authenticate, requireAdmin, RoadmapController.deleteGoal);

// ── Roadmaps ──
router.get('/roadmaps', RoadmapController.getAll);
router.get('/roadmaps/:id', authenticate, RoadmapController.getById);

// ── Resources ──
router.get('/resources', ResourceController.getAll);
router.get('/resources/:id', ResourceController.getById);
router.post('/resources/:id/progress', authenticate, ResourceController.updateProgress);
router.get('/learning/progress', authenticate, ResourceController.getMyProgress);

// ── Assessments ──
router.get('/assessments', AssessmentController.getAll);
router.get('/assessments/:id', AssessmentController.getById);
router.post('/assessments/:id/submit', authenticate, validate(assessmentSubmitSchema), AssessmentController.submit);
router.get('/assessment-attempts', authenticate, AssessmentController.getAttempts);

// ── Skills ──
router.get('/skills', SkillController.getAll);
router.get('/skills/me', authenticate, SkillController.getMySkills);
router.get('/skills/:id', authenticate, SkillController.getSkillDetail);

// ── Opportunities ──
router.get('/opportunities', OpportunityController.getAll);
router.get('/opportunities/recommended', authenticate, OpportunityController.getRecommendations);
router.get('/opportunities/saved', authenticate, ApplicationController.getSavedOpportunities);
router.post('/opportunities/:id/save', authenticate, ApplicationController.saveOpportunity);
router.delete('/opportunities/:id/save', authenticate, ApplicationController.unsaveOpportunity);
router.post('/opportunities/:id/apply', authenticate, ApplicationController.applyOpportunity);
router.get('/opportunities/:id', OpportunityController.getById);
router.get('/opportunities/:id/match', authenticate, OpportunityController.getMatch);
router.get('/opportunities/:id/gaps', authenticate, OpportunityController.getGaps);

// ── Applications ──
router.get('/applications', authenticate, ApplicationController.getAll);
router.post('/applications', authenticate, validate(applicationSchema), ApplicationController.create);
router.put('/applications/:id', authenticate, validate(applicationUpdateSchema), ApplicationController.update);
router.put('/applications/:id/status', authenticate, ApplicationController.updateStatus);
router.delete('/applications/:id', authenticate, ApplicationController.delete);
router.get('/applications/deadlines', authenticate, ApplicationController.getDeadlines);
router.get('/applications/stats', authenticate, ApplicationController.getStats);

// ── Dashboard ──
router.get('/dashboard', authenticate, DashboardController.getDashboard);

// ── Admin ──
const adminRouter = Router();
adminRouter.use(authenticate, requireAdmin);

adminRouter.get('/stats', AdminController.getStats);
adminRouter.get('/students', AdminController.getStudents);

adminRouter.post('/opportunities', validate(opportunitySchema), AdminController.createOpportunity);
adminRouter.put('/opportunities/:id', AdminController.updateOpportunity);
adminRouter.delete('/opportunities/:id', AdminController.deleteOpportunity);

adminRouter.get('/resources', ResourceController.getAll);
adminRouter.post('/resources', validate(resourceSchema), AdminController.createResource);
adminRouter.put('/resources/:id', AdminController.updateResource);
adminRouter.delete('/resources/:id', AdminController.deleteResource);

adminRouter.get('/assessments', AdminController.getAssessments);
adminRouter.post('/assessments', AdminController.createAssessment);
adminRouter.post('/questions', validate(questionSchema), AdminController.createQuestion);
adminRouter.put('/questions/:id', AdminController.updateQuestion);
adminRouter.delete('/questions/:id', AdminController.deleteQuestion);

adminRouter.get('/roadmaps', RoadmapController.getAll);
adminRouter.post('/roadmaps', AdminController.createRoadmap);
adminRouter.put('/roadmaps/:id', AdminController.updateRoadmap);
adminRouter.delete('/roadmaps/:id', AdminController.deleteRoadmap);
adminRouter.post('/modules', AdminController.createModule);
adminRouter.put('/modules/:id', AdminController.updateModule);
adminRouter.delete('/modules/:id', AdminController.deleteModule);

router.use('/admin', adminRouter);
