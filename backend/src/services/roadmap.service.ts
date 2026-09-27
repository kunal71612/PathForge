import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class RoadmapService {
  static async getAll() {
    return prisma.roadmap.findMany({
      include: {
        goal: true,
        modules: {
          orderBy: { order: 'asc' },
          include: {
            skill: true,
            _count: { select: { resources: true, assessments: true } },
          },
        },
      },
    });
  }

  static async getById(id: string, userId?: string) {
    const roadmap = await prisma.roadmap.findUnique({
      where: { id },
      include: {
        goal: true,
        modules: {
          orderBy: { order: 'asc' },
          include: {
            skill: true,
            resources: true,
            assessments: {
              include: { _count: { select: { questions: true } } },
            },
          },
        },
      },
    });

    if (!roadmap) {
      throw new AppError('Roadmap not found', 404);
    }

    // If user is logged in, get their progress
    let progress = null;
    if (userId) {
      const allResourceIds = roadmap.modules.flatMap((m) =>
        m.resources.map((r) => r.id)
      );

      if (allResourceIds.length > 0) {
        const completed = await prisma.learningProgress.count({
          where: {
            userId,
            resourceId: { in: allResourceIds },
            status: 'COMPLETED',
          },
        });

        progress = {
          totalResources: allResourceIds.length,
          completedResources: completed,
          percentage:
            allResourceIds.length > 0
              ? Math.round((completed / allResourceIds.length) * 100)
              : 0,
        };
      }

      // Get learning progress for each resource
      const learningProgress = await prisma.learningProgress.findMany({
        where: { userId, resourceId: { in: allResourceIds } },
      });

      const progressMap = new Map(
        learningProgress.map((lp) => [lp.resourceId, lp])
      );

      // Attach progress to resources
      const modulesWithProgress = roadmap.modules.map((m) => ({
        ...m,
        resources: m.resources.map((r) => ({
          ...r,
          progress: progressMap.get(r.id) || null,
        })),
      }));

      return { ...roadmap, modules: modulesWithProgress, progress };
    }

    return { ...roadmap, progress };
  }

  static async getByGoal(goalId: string) {
    return prisma.roadmap.findMany({
      where: { goalId },
      include: {
        goal: true,
        modules: {
          orderBy: { order: 'asc' },
          include: { skill: true },
        },
      },
    });
  }
}
