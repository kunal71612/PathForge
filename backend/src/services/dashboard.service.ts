import prisma from '../config/database';

export class DashboardService {
  static async getDashboard(userId: string) {
    // Get user with profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: { include: { goal: true } },
        studentSkills: {
          include: { skill: true },
          orderBy: { confidence: 'desc' },
          take: 6,
        },
      },
    });

    if (!user) return null;

    // Today's plan: incomplete resources/assessments from user's goal roadmap
    let todaysPlan: Array<{ type: string; title: string; id: string; moduleTitle?: string }> = [];
    if (user.profile?.goalId) {
      const roadmaps = await prisma.roadmap.findMany({
        where: { goalId: user.profile.goalId },
        include: {
          modules: {
            orderBy: { order: 'asc' },
            include: {
              resources: {
                include: {
                  learningProgress: { where: { userId } },
                },
              },
              assessments: {
                include: {
                  attempts: { where: { userId }, take: 1 },
                },
              },
            },
          },
        },
      });

      for (const roadmap of roadmaps) {
        for (const mod of roadmap.modules) {
          // Find incomplete resources
          for (const resource of mod.resources) {
            const progress = resource.learningProgress[0];
            if (!progress || progress.status !== 'COMPLETED') {
              todaysPlan.push({
                type: 'resource',
                title: resource.title,
                id: resource.id,
                moduleTitle: mod.title,
              });
            }
          }
          // Find unattempted assessments
          for (const assessment of mod.assessments) {
            if (assessment.attempts.length === 0) {
              todaysPlan.push({
                type: 'assessment',
                title: assessment.title,
                id: assessment.id,
                moduleTitle: mod.title,
              });
            }
          }
        }
      }
      // Limit to 5 items
      todaysPlan = todaysPlan.slice(0, 5);
    }

    // Upcoming saved opportunities with deadlines
    const upcomingOpps = await prisma.application.findMany({
      where: {
        userId,
        status: { in: ['SAVED', 'PREPARING', 'READY'] },
        opportunity: {
          deadline: { gte: new Date() },
        },
      },
      include: {
        opportunity: { include: { skills: { include: { skill: true } } } },
      },
      orderBy: { opportunity: { deadline: 'asc' } },
      take: 3,
    });

    // Recommended opportunities (top 5)
    const allOpps = await prisma.opportunity.findMany({
      where: { isPublished: true },
      include: { skills: { include: { skill: true } } },
      take: 50,
    });

    // Simple scoring for dashboard recommendations
    const studentSkillNames = new Set(
      user.studentSkills.map((ss) => ss.skill.name.toLowerCase())
    );
    const studentInterests = new Set(
      (user.profile?.interests ?? []).map((i) => i.toLowerCase())
    );

    const scored = allOpps.map((opp) => {
      let score = 0;
      const requiredSkills = opp.skills.map((s) => s.skill.name.toLowerCase());
      const matched = requiredSkills.filter((s) => studentSkillNames.has(s));
      if (requiredSkills.length > 0) {
        score += (matched.length / requiredSkills.length) * 50;
      }
      // Interest bonus
      if (studentInterests.has(opp.category.toLowerCase())) {
        score += 20;
      }
      // Deadline urgency bonus
      if (opp.deadline) {
        const daysUntil = (opp.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (daysUntil > 0 && daysUntil < 30) score += 15;
      }

      return { opportunity: opp, matchScore: Math.round(score) };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    const recommended = scored.slice(0, 5);

    // Application stats
    const appStats = await prisma.application.groupBy({
      by: ['status'],
      where: { userId },
      _count: { id: true },
    });

    const stats: Record<string, number> = {};
    for (const s of appStats) stats[s.status] = s._count.id;

    // Roadmap progress
    let roadmapProgress = null;
    if (user.profile?.goalId) {
      const roadmap = await prisma.roadmap.findFirst({
        where: { goalId: user.profile.goalId },
        include: {
          modules: {
            include: {
              resources: true,
            },
          },
        },
      });

      if (roadmap) {
        const totalResources = roadmap.modules.reduce(
          (sum, m) => sum + m.resources.length, 0
        );
        const completedResources = totalResources > 0
          ? await prisma.learningProgress.count({
              where: {
                userId,
                resourceId: {
                  in: roadmap.modules.flatMap((m) => m.resources.map((r) => r.id)),
                },
                status: 'COMPLETED',
              },
            })
          : 0;

        roadmapProgress = {
          roadmapId: roadmap.id,
          roadmapTitle: roadmap.title,
          totalResources,
          completedResources,
          percentage: totalResources > 0
            ? Math.round((completedResources / totalResources) * 100)
            : 0,
        };
      }
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        goal: user.profile?.goal ?? null,
      },
      todaysPlan,
      skills: user.studentSkills,
      upcomingOpportunities: upcomingOpps,
      recommended,
      applicationStats: stats,
      roadmapProgress,
    };
  }
}
