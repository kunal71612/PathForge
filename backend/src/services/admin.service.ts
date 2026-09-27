import prisma from '../config/database';

export class AdminService {
  static async getStats() {
    const [
      totalStudents,
      totalOpportunities,
      totalRoadmaps,
      totalResources,
      totalAssessmentAttempts,
      totalApplications,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.opportunity.count(),
      prisma.roadmap.count(),
      prisma.resource.count(),
      prisma.assessmentAttempt.count(),
      prisma.application.count(),
    ]);

    return {
      totalStudents,
      totalOpportunities,
      totalRoadmaps,
      totalResources,
      totalAssessmentAttempts,
      totalApplications,
    };
  }

  static async getStudents(search?: string) {
    const where = search
      ? {
          role: 'STUDENT' as const,
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : { role: 'STUDENT' as const };

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        profile: { include: { goal: true } },
        _count: {
          select: {
            studentSkills: true,
            assessmentAttempts: true,
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Resource CRUD
  static async createResource(data: {
    title: string;
    description?: string | null;
    provider?: string | null;
    url: string;
    type: 'YOUTUBE' | 'COURSE' | 'DOCUMENTATION' | 'ARTICLE' | 'PRACTICE' | 'GITHUB';
    duration?: string | null;
    difficulty?: string | null;
    moduleId?: string | null;
    skillId?: string | null;
  }) {
    return prisma.resource.create({ data });
  }

  static async updateResource(id: string, data: Record<string, unknown>) {
    return prisma.resource.update({ where: { id }, data });
  }

  static async deleteResource(id: string) {
    await prisma.resource.delete({ where: { id } });
    return { success: true };
  }

  // Assessment/Question CRUD
  static async createAssessment(data: {
    title: string;
    description?: string;
    moduleId?: string;
    skillId?: string;
  }) {
    return prisma.assessment.create({ data });
  }

  static async getAssessments() {
    return prisma.assessment.findMany({
      include: {
        skill: true,
        module: true,
        _count: { select: { questions: true, attempts: true } },
      },
    });
  }

  static async createQuestion(data: {
    assessmentId: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string | null;
    difficulty?: string | null;
    skillId?: string | null;
  }) {
    return prisma.question.create({ data });
  }

  static async updateQuestion(id: string, data: Record<string, unknown>) {
    return prisma.question.update({ where: { id }, data });
  }

  static async deleteQuestion(id: string) {
    await prisma.question.delete({ where: { id } });
    return { success: true };
  }

  // Roadmap management
  static async createRoadmap(data: {
    title: string;
    description?: string;
    goalId?: string;
  }) {
    return prisma.roadmap.create({ data, include: { goal: true } });
  }

  static async updateRoadmap(id: string, data: Record<string, unknown>) {
    return prisma.roadmap.update({
      where: { id },
      data,
      include: { goal: true, modules: true },
    });
  }

  static async deleteRoadmap(id: string) {
    await prisma.roadmap.delete({ where: { id } });
    return { success: true };
  }

  static async createModule(data: {
    roadmapId: string;
    title: string;
    description?: string;
    order: number;
    difficulty?: string;
    estimatedMinutes?: number;
    skillId?: string;
  }) {
    return prisma.roadmapModule.create({ data, include: { skill: true } });
  }

  static async updateModule(id: string, data: Record<string, unknown>) {
    return prisma.roadmapModule.update({ where: { id }, data });
  }

  static async deleteModule(id: string) {
    await prisma.roadmapModule.delete({ where: { id } });
    return { success: true };
  }
}
