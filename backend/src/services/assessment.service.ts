import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface SubmittedAnswer {
  questionId: string;
  selectedAnswer: number;
}

export class AssessmentService {
  static async getAll() {
    return prisma.assessment.findMany({
      include: {
        skill: true,
        module: { include: { roadmap: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { title: 'asc' },
    });
  }

  static async getById(id: string) {
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        skill: true,
        module: true,
        questions: {
          select: {
            id: true,
            question: true,
            options: true,
            difficulty: true,
            // Do NOT return correctAnswer to frontend
          },
        },
        _count: { select: { questions: true } },
      },
    });

    if (!assessment) throw new AppError('Assessment not found', 404);
    return assessment;
  }

  static async submit(userId: string, assessmentId: string, answers: SubmittedAnswer[]) {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: true, skill: true },
    });

    if (!assessment) throw new AppError('Assessment not found', 404);
    if (assessment.questions.length === 0) {
      throw new AppError('This assessment has no questions', 400);
    }

    // Grade answers
    const questionMap = new Map(
      assessment.questions.map((q) => [q.id, q])
    );

    let score = 0;
    const gradedAnswers = answers.map((a) => {
      const question = questionMap.get(a.questionId);
      if (!question) return { ...a, isCorrect: false };

      const isCorrect = question.correctAnswer === a.selectedAnswer;
      if (isCorrect) score++;

      return {
        questionId: a.questionId,
        selectedAnswer: a.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
      };
    });

    const totalQuestions = assessment.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    // Store attempt
    const attempt = await prisma.assessmentAttempt.create({
      data: {
        userId,
        assessmentId,
        score,
        totalQuestions,
        percentage,
        answers: gradedAnswers,
      },
    });

    // Update skill confidence if assessment has a skill
    if (assessment.skillId) {
      await this.updateSkillAssessmentScore(userId, assessment.skillId, percentage);
    }

    // Also update module-level skill confidence
    const moduleSkills = new Set<string>();
    for (const question of assessment.questions) {
      if (question.skillId) moduleSkills.add(question.skillId);
    }
    for (const skillId of moduleSkills) {
      if (skillId !== assessment.skillId) {
        await this.updateSkillAssessmentScore(userId, skillId, percentage);
      }
    }

    return {
      attempt,
      gradedAnswers,
      score,
      totalQuestions,
      percentage,
    };
  }

  static async getAttempts(userId: string, assessmentId?: string) {
    const where: Record<string, unknown> = { userId };
    if (assessmentId) where.assessmentId = assessmentId;

    return prisma.assessmentAttempt.findMany({
      where,
      include: { assessment: { include: { skill: true } } },
      orderBy: { completedAt: 'desc' },
    });
  }

  private static async updateSkillAssessmentScore(
    userId: string,
    skillId: string,
    newPercentage: number
  ) {
    const existing = await prisma.studentSkill.findUnique({
      where: { userId_skillId: { userId, skillId } },
    });

    // Use the best score (keep highest assessment)
    const prevScore = existing?.assessmentScore ?? 0;
    const assessmentScore = Math.max(prevScore, newPercentage);

    const learningScore = existing?.learningScore ?? 0;
    // Confidence = 80% assessment + 20% learning
    const confidence = Math.round(assessmentScore * 0.8 + learningScore * 0.2);

    await prisma.studentSkill.upsert({
      where: { userId_skillId: { userId, skillId } },
      create: {
        userId,
        skillId,
        confidence,
        assessmentScore,
        learningScore: 0,
      },
      update: { assessmentScore, confidence },
    });
  }
}
