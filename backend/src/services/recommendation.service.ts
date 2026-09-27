import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

/**
 * Recommendation Engine
 *
 * Match Score formula:
 *   Skill Match       40%  — overlap between student skills and opportunity required skills
 *   Interest Match    25%  — student interests match opportunity category/skills
 *   Education Match   15%  — student education level meets eligibility
 *   Category Match    10%  — opportunity category matches student goal interests
 *   Goal Match        10%  — opportunity aligns with student goal
 *
 * Readiness Score:
 *   Average confidence in required skills (0-100)
 *
 * Skill Gap:
 *   Required skills where student confidence < 60%
 */

interface MatchResult {
  matchScore: number;
  readinessScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  skillGaps: Array<{
    skillId: string;
    skillName: string;
    confidence: number;
    needed: boolean;
  }>;
  reasons: string[];
  breakdown: {
    skillMatch: number;
    interestMatch: number;
    educationMatch: number;
    categoryMatch: number;
    goalMatch: number;
  };
  nextAction?: {
    type: 'assessment' | 'learning' | 'apply';
    message: string;
    resourceId?: string;
    assessmentId?: string;
  };
}

// Map opportunity categories to related interest keywords
const CATEGORY_INTERESTS: Record<string, string[]> = {
  HACKATHON: ['Hackathons', 'Competitive Programming', 'Web Development', 'AI'],
  INTERNSHIP: ['Internships', 'Web Development', 'AI', 'Data Science'],
  SCHOLARSHIP: ['Research', 'AI', 'Data Science'],
  COMPETITION: ['Competitive Programming', 'Hackathons'],
  WORKSHOP: ['Web Development', 'AI', 'Cybersecurity'],
  COURSE: ['Web Development', 'AI', 'Data Science'],
  CERTIFICATION: ['Cloud', 'Cybersecurity', 'AI'],
  RESEARCH: ['Research', 'AI', 'Data Science'],
};

// Map goal names to related categories
const GOAL_CATEGORIES: Record<string, string[]> = {
  'Become a Web Developer': ['INTERNSHIP', 'HACKATHON', 'WORKSHOP', 'COURSE'],
  'Become an AI Engineer': ['INTERNSHIP', 'HACKATHON', 'RESEARCH', 'COURSE', 'COMPETITION'],
  'Learn Python': ['COURSE', 'WORKSHOP', 'HACKATHON'],
  'Learn DSA': ['COMPETITION', 'COURSE', 'INTERNSHIP'],
  'Prepare for Internships': ['INTERNSHIP', 'HACKATHON', 'WORKSHOP'],
  'Prepare for Hackathons': ['HACKATHON', 'COMPETITION', 'WORKSHOP'],
  'Learn Cybersecurity': ['CERTIFICATION', 'WORKSHOP', 'COURSE', 'COMPETITION'],
};

export class RecommendationService {
  static async getMatchForOpportunity(
    userId: string,
    opportunityId: string
  ): Promise<MatchResult> {
    // Get student profile with skills and interests
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: { include: { goal: true } },
        studentSkills: { include: { skill: true } },
      },
    });

    if (!user) throw new AppError('User not found', 404);

    // Get opportunity with required skills
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { skills: { include: { skill: true } } },
    });

    if (!opportunity) throw new AppError('Opportunity not found', 404);

    return this.calculateMatch(user, opportunity);
  }

  static async getRecommendedOpportunities(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: { include: { goal: true } },
        studentSkills: { include: { skill: true } },
      },
    });

    if (!user) throw new AppError('User not found', 404);

    const opportunities = await prisma.opportunity.findMany({
      where: { isPublished: true },
      include: { skills: { include: { skill: true } } },
    });

    const recommendations = opportunities.map((opp) => ({
      opportunity: opp,
      ...this.calculateMatch(user, opp),
    }));

    // Sort by match score descending
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    return recommendations;
  }

  static async getSkillGaps(userId: string, opportunityId: string) {
    const result = await this.getMatchForOpportunity(userId, opportunityId);

    // For each missing/weak skill, find recommended resources
    const gapRecommendations = await Promise.all(
      result.skillGaps
        .filter((g) => g.confidence < 60)
        .map(async (gap) => {
          // Find resources for this skill
          const resources = await prisma.resource.findMany({
            where: { skillId: gap.skillId },
            take: 3,
            orderBy: { title: 'asc' },
          });

          // Find assessments for this skill
          const assessments = await prisma.assessment.findMany({
            where: { skillId: gap.skillId },
            take: 1,
          });

          return {
            ...gap,
            resources,
            assessments,
          };
        })
    );

    return {
      ...result,
      gapRecommendations,
    };
  }

  private static calculateMatch(
    user: {
      profile: { goal: { name: string } | null; interests: string[]; year?: number | null; degree?: string | null } | null;
      studentSkills: Array<{ skill: { name: string; id: string }; confidence: number }>;
    },
    opportunity: {
      category: string;
      eligibility?: string | null;
      skills: Array<{ skill: { name: string; id: string } }>;
    }
  ): MatchResult {
    const studentSkillMap = new Map(
      user.studentSkills.map((ss) => [ss.skill.name.toLowerCase(), ss])
    );
    const studentSkillNames = new Set(
      user.studentSkills.map((ss) => ss.skill.name.toLowerCase())
    );
    const studentInterests = new Set(
      (user.profile?.interests ?? []).map((i) => i.toLowerCase())
    );
    const goalName = user.profile?.goal?.name ?? '';

    const requiredSkills = opportunity.skills.map((os) => os.skill);
    const requiredSkillNames = requiredSkills.map((s) => s.name.toLowerCase());

    // 1. Skill Match (40%)
    let skillMatch = 0;
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    if (requiredSkillNames.length > 0) {
      for (const skillName of requiredSkillNames) {
        if (studentSkillNames.has(skillName)) {
          matchedSkills.push(skillName);
        } else {
          missingSkills.push(skillName);
        }
      }
      skillMatch = (matchedSkills.length / requiredSkillNames.length) * 100;
    } else {
      skillMatch = 50; // Neutral if no skills specified
    }

    // 2. Interest Match (25%)
    let interestMatch = 0;
    const relatedInterests = CATEGORY_INTERESTS[opportunity.category] ?? [];
    if (relatedInterests.length > 0) {
      const matching = relatedInterests.filter((ri) =>
        studentInterests.has(ri.toLowerCase())
      );
      interestMatch = (matching.length / relatedInterests.length) * 100;
    }

    // Also check if required skill names match interests
    for (const skillName of requiredSkillNames) {
      if (studentInterests.has(skillName)) {
        interestMatch = Math.min(100, interestMatch + 20);
      }
    }

    // 3. Education Match (15%)
    let educationMatch = 50; // Default neutral
    if (opportunity.eligibility) {
      const elig = opportunity.eligibility.toLowerCase();
      const year = user.profile?.year;
      if (year) {
        if (elig.includes('all years') || elig.includes('any year')) {
          educationMatch = 100;
        } else if (elig.includes(`${year}`) || elig.includes('year')) {
          educationMatch = 90;
        } else if (elig.includes('undergraduate') || elig.includes('student')) {
          educationMatch = 80;
        }
      } else {
        educationMatch = 60;
      }
    }

    // 4. Category Match (10%)
    let categoryMatch = 0;
    const goalCategories = GOAL_CATEGORIES[goalName] ?? [];
    if (goalCategories.includes(opportunity.category)) {
      categoryMatch = 100;
    } else if (goalCategories.length === 0) {
      categoryMatch = 30;
    }

    // 5. Goal Match (10%)
    let goalMatch = 0;
    if (goalName) {
      const goalLower = goalName.toLowerCase();
      // Check if opportunity title/description relates to goal
      for (const skill of requiredSkillNames) {
        if (goalLower.includes(skill)) {
          goalMatch = 100;
          break;
        }
      }
      if (goalMatch === 0) {
        // Check category alignment
        if (goalCategories.includes(opportunity.category)) {
          goalMatch = 70;
        }
      }
    }

    // Calculate weighted match score
    const matchScore = Math.round(
      skillMatch * 0.4 +
        interestMatch * 0.25 +
        educationMatch * 0.15 +
        categoryMatch * 0.1 +
        goalMatch * 0.1
    );

    // Readiness: average confidence of required skills
    const skillGaps = requiredSkills.map((rs) => {
      const ss = studentSkillMap.get(rs.name.toLowerCase());
      return {
        skillId: rs.id,
        skillName: rs.name,
        confidence: ss?.confidence ?? 0,
        needed: true,
      };
    });

    let readinessScore = 0;
    if (skillGaps.length > 0) {
      readinessScore = Math.round(
        skillGaps.reduce((sum, g) => sum + g.confidence, 0) / skillGaps.length
      );
    } else {
      readinessScore = 50; // Neutral if no skills specified
    }

    // Build reasons
    const reasons: string[] = [];
    if (matchedSkills.length > 0) {
      reasons.push(
        `${matchedSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')} match${matchedSkills.length === 1 ? 'es' : ''} your skills`
      );
    }
    if (interestMatch > 50) {
      reasons.push(`${opportunity.category.charAt(0) + opportunity.category.slice(1).toLowerCase()}s match your interests`);
    }
    if (educationMatch > 60) {
      reasons.push('Your education meets the requirements');
    }
    if (goalMatch > 50) {
      reasons.push(`This aligns with your goal: ${goalName}`);
    }

    // Determine next action
    let nextAction: MatchResult['nextAction'];
    const weakestGap = skillGaps
      .filter((g) => g.confidence < 60)
      .sort((a, b) => a.confidence - b.confidence)[0];

    if (readinessScore >= 70) {
      nextAction = { type: 'apply', message: 'You\'re ready! Complete your application.' };
    } else if (weakestGap) {
      nextAction = {
        type: 'learning',
        message: `Improve your ${weakestGap.skillName} confidence (currently ${weakestGap.confidence}%)`,
      };
    }

    return {
      matchScore: Math.min(100, Math.max(0, matchScore)),
      readinessScore: Math.min(100, Math.max(0, readinessScore)),
      matchedSkills,
      missingSkills,
      skillGaps,
      reasons,
      breakdown: {
        skillMatch: Math.round(skillMatch),
        interestMatch: Math.round(interestMatch),
        educationMatch: Math.round(educationMatch),
        categoryMatch: Math.round(categoryMatch),
        goalMatch: Math.round(goalMatch),
      },
      nextAction,
    };
  }
}
