import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { LearningStatus } from '@prisma/client';

export class ResourceService {
  static async getAll(filters?: { moduleId?: string; skillId?: string; type?: string }) {
    const where: Record<string, unknown> = {};
    if (filters?.moduleId) where.moduleId = filters.moduleId;
    if (filters?.skillId) where.skillId = filters.skillId;
    if (filters?.type) where.type = filters.type;

    return prisma.resource.findMany({
      where,
      include: { skill: true, module: true },
      orderBy: { title: 'asc' },
    });
  }

  static async getById(id: string) {
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: { skill: true, module: true },
    });
    if (!resource) throw new AppError('Resource not found', 404);
    return resource;
  }

  static async updateProgress(
    userId: string,
    resourceId: string,
    status: LearningStatus
  ) {
    // Verify resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });
    if (!resource) throw new AppError('Resource not found', 404);

    const now = new Date();
    const progressData: Record<string, unknown> = { status };

    if (status === 'IN_PROGRESS') {
      progressData.startedAt = now;
    } else if (status === 'COMPLETED') {
      progressData.completedAt = now;
    }

    const progress = await prisma.learningProgress.upsert({
      where: {
        userId_resourceId: { userId, resourceId },
      },
      create: {
        userId,
        resourceId,
        ...progressData,
        ...(status === 'IN_PROGRESS' ? { startedAt: now } : {}),
        ...(status === 'COMPLETED' ? { startedAt: now, completedAt: now } : {}),
      },
      update: progressData,
    });

    // After completing a resource, update skill confidence
    if (status === 'COMPLETED' && resource.skillId) {
      await this.updateSkillLearningScore(userId, resource.skillId);
    }

    return progress;
  }

  static async getProgress(userId: string) {
    return prisma.learningProgress.findMany({
      where: { userId },
      include: { resource: { include: { skill: true, module: true } } },
    });
  }

  private static async updateSkillLearningScore(userId: string, skillId: string) {
    // Count completed vs total resources for this skill
    const totalResources = await prisma.resource.count({
      where: { skillId },
    });

    if (totalResources === 0) return;

    const completedResources = await prisma.learningProgress.count({
      where: {
        userId,
        resource: { skillId },
        status: 'COMPLETED',
      },
    });

    const learningScore = Math.round((completedResources / totalResources) * 100);

    // Update or create student skill
    const existing = await prisma.studentSkill.findUnique({
      where: { userId_skillId: { userId, skillId } },
    });

    const assessmentScore = existing?.assessmentScore ?? 0;
    // Confidence = 80% assessment + 20% learning
    const confidence = Math.round(assessmentScore * 0.8 + learningScore * 0.2);

    await prisma.studentSkill.upsert({
      where: { userId_skillId: { userId, skillId } },
      create: { userId, skillId, confidence, learningScore },
      update: { learningScore, confidence },
    });
  }
}
