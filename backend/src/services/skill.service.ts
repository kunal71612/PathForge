import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class SkillService {
  static async getAll() {
    return prisma.skill.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async getStudentSkills(userId: string) {
    return prisma.studentSkill.findMany({
      where: { userId },
      include: { skill: true },
      orderBy: { confidence: 'desc' },
    });
  }

  static async getSkillDetail(userId: string, skillId: string) {
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
    });

    const studentSkill = await prisma.studentSkill.findUnique({
      where: { userId_skillId: { userId, skillId } },
    });

    // Get resources for this skill
    const resources = await prisma.resource.findMany({
      where: { skillId },
      include: {
        learningProgress: {
          where: { userId },
        },
      },
    });

    // Get assessments for this skill
    const assessments = await prisma.assessment.findMany({
      where: { skillId },
      include: {
        _count: { select: { questions: true } },
        attempts: {
          where: { userId },
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
      },
    });

    return {
      skill,
      confidence: studentSkill?.confidence ?? 0,
      assessmentScore: studentSkill?.assessmentScore ?? 0,
      learningScore: studentSkill?.learningScore ?? 0,
      resources,
      assessments,
    };
  }

  static async addStudentSkill(
    userId: string,
    data: { skillId?: string; name?: string; confidence?: number }
  ) {
    let skillId = data.skillId;
    if (!skillId && data.name) {
      const skill = await prisma.skill.upsert({
        where: { name: data.name },
        create: { name: data.name },
        update: {},
      });
      skillId = skill.id;
    }
    if (!skillId) throw new AppError('Skill ID or name is required', 400);

    return prisma.studentSkill.upsert({
      where: { userId_skillId: { userId, skillId } },
      create: {
        userId,
        skillId,
        confidence: data.confidence ?? 0,
      },
      update: {
        confidence: data.confidence !== undefined ? data.confidence : undefined,
      },
      include: { skill: true },
    });
  }

  static async updateStudentSkill(
    userId: string,
    id: string,
    data: { confidence?: number }
  ) {
    const existing = await prisma.studentSkill.findFirst({
      where: {
        userId,
        OR: [{ id }, { skillId: id }],
      },
    });
    if (!existing) throw new AppError('Student skill not found', 404);

    return prisma.studentSkill.update({
      where: { id: existing.id },
      data: {
        confidence: data.confidence !== undefined ? data.confidence : undefined,
      },
      include: { skill: true },
    });
  }

  static async deleteStudentSkill(userId: string, id: string) {
    const existing = await prisma.studentSkill.findFirst({
      where: {
        userId,
        OR: [{ id }, { skillId: id }],
      },
    });
    if (!existing) throw new AppError('Student skill not found', 404);

    await prisma.studentSkill.delete({ where: { id: existing.id } });
    return { success: true };
  }
}
