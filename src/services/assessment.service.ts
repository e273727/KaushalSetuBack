import prisma from '../config/prisma';
import { CompetencyService } from './competency.service';

export class AssessmentService {
  static async startAssessment(userId: string, assessmentType = 'initial', competencyId?: string) {
    // 1. Create Assessment Record
    const assessment = await prisma.assessment.create({
      data: {
        userId,
        assessmentType,
        status: 'started',
        startedAt: new Date(),
      },
    });

    // 2. Fetch Questions based on filters
    const whereClause: any = {};
    if (competencyId) {
      whereClause.competencyId = competencyId;
    }

    const questions = await prisma.question.findMany({
      where: whereClause,
      take: 10,
      include: {
        options: {
          select: {
            id: true,
            questionId: true,
            optionText: true,
            // Exclude isCorrect for client delivery during assessment
          },
        },
        competency: true,
      },
    });

    await prisma.assessment.update({
      where: { id: assessment.id },
      data: { totalQuestions: questions.length },
    });

    return {
      assessmentId: assessment.id,
      assessmentType: assessment.assessmentType,
      totalQuestions: questions.length,
      questions,
    };
  }

  static async submitAnswer(assessmentId: string, questionId: string, selectedOptionId: string) {
    // Check if correct option
    const option = await prisma.questionOption.findUnique({
      where: { id: selectedOptionId },
    });

    const isCorrect = option?.isCorrect || false;

    const answer = await prisma.assessmentAnswer.create({
      data: {
        assessmentId,
        questionId,
        selectedOptionId,
        isCorrect,
      },
    });

    return { answerId: answer.id, isCorrect };
  }

  static async completeAssessment(assessmentId: string) {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!assessment) {
      throw { statusCode: 404, message: 'Assessment session not found' };
    }

    const total = assessment.answers.length;
    const correctCount = assessment.answers.filter((a) => a.isCorrect).length;
    const finalScorePercentage = total > 0 ? (correctCount / total) * 100 : 0;

    // Update Assessment record
    const updatedAssessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        score: finalScorePercentage,
        completedAt: new Date(),
        status: 'completed',
      },
    });

    // Determine target level based on score
    // Score >= 80% => Level 4-5, >= 60% => Level 3, >= 40% => Level 2, else Level 1
    let evaluatedLevel = 1;
    if (finalScorePercentage >= 85) evaluatedLevel = 5;
    else if (finalScorePercentage >= 70) evaluatedLevel = 4;
    else if (finalScorePercentage >= 55) evaluatedLevel = 3;
    else if (finalScorePercentage >= 40) evaluatedLevel = 2;

    // Group answers by competency and update UserCompetency records
    const competencyMap = new Map<string, { correct: number; total: number }>();

    for (const ans of assessment.answers) {
      if (ans.question.competencyId) {
        const current = competencyMap.get(ans.question.competencyId) || { correct: 0, total: 0 };
        competencyMap.set(ans.question.competencyId, {
          correct: current.correct + (ans.isCorrect ? 1 : 0),
          total: current.total + 1,
        });
      }
    }

    for (const [compId, stats] of competencyMap.entries()) {
      const compScore = (stats.correct / stats.total) * 100;
      let compLevel = 1;
      if (compScore >= 85) compLevel = 5;
      else if (compScore >= 70) compLevel = 4;
      else if (compScore >= 55) compLevel = 3;
      else if (compScore >= 40) compLevel = 2;

      await CompetencyService.updateUserCompetencyLevel(assessment.userId, compId, compLevel, compScore);
    }

    return {
      assessment: updatedAssessment,
      totalQuestions: total,
      correctCount,
      scorePercentage: finalScorePercentage,
      evaluatedLevel,
    };
  }

  static async getAssessmentHistory(userId: string) {
    return prisma.assessment.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        answers: {
          include: {
            question: true,
            selectedOption: true,
          },
        },
      },
    });
  }

  static async recordAssessmentSubmission(userId: string, data: {
    assessmentType?: string;
    totalQuestions: number;
    correctCount: number;
    scorePercentage: number;
    targetRole?: string;
  }) {
    const assessment = await prisma.assessment.create({
      data: {
        userId,
        assessmentType: data.assessmentType || 'diagnostic',
        totalQuestions: data.totalQuestions || 10,
        score: data.scorePercentage || 0,
        startedAt: new Date(),
        completedAt: new Date(),
        status: 'completed',
      },
    });

    return assessment;
  }
}
