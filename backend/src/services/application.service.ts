import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { ApplicationStatus } from '@prisma/client';

export class ApplicationService {
  static async getAll(userId: string, status?: string) {
    const where: Record<string, unknown> = { userId };
    if (status) where.status = status as ApplicationStatus;

    return prisma.application.findMany({
      where,
      include: {
        opportunity: {
          include: { skills: { include: { skill: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async create(userId: string, opportunityId: string, notes?: string) {
    // Check if already exists
    const existing = await prisma.application.findUnique({
      where: { userId_opportunityId: { userId, opportunityId } },
    });

    if (existing) {
      throw new AppError('You have already saved this opportunity', 409);
    }

    // Verify opportunity exists
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });
    if (!opportunity) throw new AppError('Opportunity not found', 404);

    return prisma.application.create({
      data: { userId, opportunityId, notes },
      include: {
        opportunity: { include: { skills: { include: { skill: true } } } },
      },
    });
  }

  static async update(
    userId: string,
    applicationId: string,
    data: { status?: ApplicationStatus; notes?: string | null }
  ) {
    const application = await prisma.application.findFirst({
      where: { id: applicationId, userId },
    });

    if (!application) throw new AppError('Application not found', 404);

    return prisma.application.update({
      where: { id: applicationId },
      data,
      include: {
        opportunity: { include: { skills: { include: { skill: true } } } },
      },
    });
  }

  static async delete(userId: string, applicationId: string) {
    const application = await prisma.application.findFirst({
      where: { id: applicationId, userId },
    });

    if (!application) throw new AppError('Application not found', 404);

    await prisma.application.delete({ where: { id: applicationId } });
    return { success: true };
  }

  static async getDeadlines(userId: string) {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const applications = await prisma.application.findMany({
      where: {
        userId,
        status: { in: ['SAVED', 'PREPARING', 'READY'] },
        opportunity: {
          deadline: { gte: now },
        },
      },
      include: {
        opportunity: { include: { skills: { include: { skill: true } } } },
      },
      orderBy: { opportunity: { deadline: 'asc' } },
    });

    const critical = applications.filter((a) => {
      if (!a.opportunity.deadline) return false;
      const diff = a.opportunity.deadline.getTime() - now.getTime();
      return diff <= 2 * 24 * 60 * 60 * 1000;
    });

    const closingSoon = applications.filter((a) => {
      if (!a.opportunity.deadline) return false;
      const diff = a.opportunity.deadline.getTime() - now.getTime();
      return diff > 2 * 24 * 60 * 60 * 1000 && diff <= 7 * 24 * 60 * 60 * 1000;
    });

    const upcoming = applications.filter((a) => {
      if (!a.opportunity.deadline) return false;
      const diff = a.opportunity.deadline.getTime() - now.getTime();
      return diff > 7 * 24 * 60 * 60 * 1000 && diff <= 30 * 24 * 60 * 60 * 1000;
    });

    const future = applications.filter((a) => {
      if (!a.opportunity.deadline) return false;
      return a.opportunity.deadline.getTime() - now.getTime() > 30 * 24 * 60 * 60 * 1000;
    });

    return { critical, closingSoon, upcoming, future };
  }

  static async getStats(userId: string) {
    const counts = await prisma.application.groupBy({
      by: ['status'],
      where: { userId },
      _count: { id: true },
    });

    const stats: Record<string, number> = {};
    for (const c of counts) {
      stats[c.status] = c._count.id;
    }

    return {
      saved: stats['SAVED'] ?? 0,
      preparing: stats['PREPARING'] ?? 0,
      ready: stats['READY'] ?? 0,
      applied: stats['APPLIED'] ?? 0,
      shortlisted: stats['SHORTLISTED'] ?? 0,
      rejected: stats['REJECTED'] ?? 0,
      selected: stats['SELECTED'] ?? 0,
      completed: stats['COMPLETED'] ?? 0,
      total: Object.values(stats).reduce((a, b) => a + b, 0),
    };
  }
}
