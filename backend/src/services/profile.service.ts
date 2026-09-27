import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class ProfileService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profile: {
          include: { goal: true },
        },
        studentSkills: {
          include: { skill: true },
          orderBy: { confidence: 'desc' },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async updateProfile(
    userId: string,
    data: {
      name?: string;
      college?: string | null;
      degree?: string | null;
      branch?: string | null;
      year?: number | null;
      bio?: string | null;
      goalId?: string | null;
      interests?: string[];
      skills?: string[]; // skill IDs
    }
  ) {
    // Update user name if provided
    if (data.name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: data.name },
      });
    }

    // Update or create profile
    const profileData: Record<string, unknown> = {};
    if (data.college !== undefined) profileData.college = data.college;
    if (data.degree !== undefined) profileData.degree = data.degree;
    if (data.branch !== undefined) profileData.branch = data.branch;
    if (data.year !== undefined) profileData.year = data.year;
    if (data.bio !== undefined) profileData.bio = data.bio;
    if (data.goalId !== undefined) profileData.goalId = data.goalId;
    if (data.interests !== undefined) profileData.interests = data.interests;

    await prisma.studentProfile.upsert({
      where: { userId },
      create: { userId, ...profileData },
      update: profileData,
    });

    // Sync student skills if provided
    if (data.skills) {
      // Get existing skill records
      const existingSkills = await prisma.studentSkill.findMany({
        where: { userId },
        select: { skillId: true },
      });
      const existingIds = new Set(existingSkills.map((s) => s.skillId));

      // Add new skills
      const newSkillIds = data.skills.filter((id) => !existingIds.has(id));
      if (newSkillIds.length > 0) {
        await prisma.studentSkill.createMany({
          data: newSkillIds.map((skillId) => ({
            userId,
            skillId,
            confidence: 0,
          })),
          skipDuplicates: true,
        });
      }
    }

    return this.getProfile(userId);
  }
}
