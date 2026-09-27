import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { OpportunityCategory, Prisma } from '@prisma/client';

export class OpportunityService {
  static async getAll(filters?: {
    search?: string;
    category?: string;
    skill?: string;
    mode?: string;
    location?: string;
    deadline?: string;
  }) {
    const where: Prisma.OpportunityWhereInput = { isPublished: true };

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { organization: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.category) {
      where.category = filters.category as OpportunityCategory;
    }

    if (filters?.mode) {
      where.mode = { equals: filters.mode, mode: 'insensitive' };
    }

    if (filters?.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters?.deadline) {
      const now = new Date();
      if (filters.deadline === 'week') {
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        where.deadline = { gte: now, lte: nextWeek };
      } else if (filters.deadline === 'month') {
        const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        where.deadline = { gte: now, lte: nextMonth };
      } else if (filters.deadline === 'active') {
        where.OR = [{ deadline: { gte: now } }, { deadline: null }];
      }
    }

    if (filters?.skill) {
      where.skills = {
        some: {
          skill: { name: { equals: filters.skill, mode: 'insensitive' } },
        },
      };
    }

    return prisma.opportunity.findMany({
      where,
      include: {
        skills: { include: { skill: true } },
      },
      orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
    });
  }

  static async getById(id: string) {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        skills: { include: { skill: true } },
      },
    });

    if (!opportunity) throw new AppError('Opportunity not found', 404);
    return opportunity;
  }

  static async create(data: {
    title: string;
    organization?: string | null;
    description?: string | null;
    category: OpportunityCategory;
    eligibility?: string | null;
    deadline?: string | null;
    eventDate?: string | null;
    location?: string | null;
    mode?: string | null;
    cost?: string | null;
    applyUrl?: string | null;
    sourceUrl?: string | null;
    isDemo?: boolean;
    isPublished?: boolean;
    skillIds?: string[];
  }) {
    const { skillIds, deadline, eventDate, ...rest } = data;

    const opportunity = await prisma.opportunity.create({
      data: {
        ...rest,
        deadline: deadline ? new Date(deadline) : null,
        eventDate: eventDate ? new Date(eventDate) : null,
        skills: skillIds
          ? {
              create: skillIds.map((skillId) => ({ skillId })),
            }
          : undefined,
      },
      include: { skills: { include: { skill: true } } },
    });

    return opportunity;
  }

  static async update(
    id: string,
    data: {
      title?: string;
      organization?: string | null;
      description?: string | null;
      category?: OpportunityCategory;
      eligibility?: string | null;
      deadline?: string | null;
      eventDate?: string | null;
      location?: string | null;
      mode?: string | null;
      cost?: string | null;
      applyUrl?: string | null;
      sourceUrl?: string | null;
      isDemo?: boolean;
      isPublished?: boolean;
      skillIds?: string[];
    }
  ) {
    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) throw new AppError('Opportunity not found', 404);

    const { skillIds, deadline, eventDate, ...rest } = data;

    // Update skills if provided
    if (skillIds) {
      await prisma.opportunitySkill.deleteMany({ where: { opportunityId: id } });
      await prisma.opportunitySkill.createMany({
        data: skillIds.map((skillId) => ({ opportunityId: id, skillId })),
      });
    }

    return prisma.opportunity.update({
      where: { id },
      data: {
        ...rest,
        ...(deadline !== undefined
          ? { deadline: deadline ? new Date(deadline) : null }
          : {}),
        ...(eventDate !== undefined
          ? { eventDate: eventDate ? new Date(eventDate) : null }
          : {}),
      },
      include: { skills: { include: { skill: true } } },
    });
  }

  static async delete(id: string) {
    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) throw new AppError('Opportunity not found', 404);

    await prisma.opportunity.delete({ where: { id } });
    return { success: true };
  }
}
