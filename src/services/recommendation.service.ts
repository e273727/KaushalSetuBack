import prisma from '../config/prisma';
import { GapEngineService } from './gapEngine.service';

export class RecommendationService {
  static async getRecommendedCourses(userId: string) {
    // 1. Calculate active skill gaps
    const { gaps, jobRole } = await GapEngineService.calculateSkillGaps(userId);

    // Filter competencies with non-zero gap
    const targetGaps = gaps.filter((g) => g.gap > 0);
    const targetCompetencyIds = targetGaps.map((g) => g.competencyId);

    if (targetCompetencyIds.length === 0) {
      // User has met all requirements for job role! Return popular advanced courses.
      const courses = await prisma.course.findMany({
        take: 5,
        where: { isActive: true },
        include: {
          courseCompetencies: {
            include: { competency: true },
          },
        },
      });

      return {
        jobRole,
        message: 'Great job! You have satisfied your role requirements. Here are recommended extension courses.',
        recommendations: courses,
      };
    }

    // 2. Query courses matching target competency gaps
    const courses = await prisma.course.findMany({
      where: {
        isActive: true,
        courseCompetencies: {
          some: {
            competencyId: {
              in: targetCompetencyIds,
            },
          },
        },
      },
      include: {
        courseCompetencies: {
          include: {
            competency: true,
          },
        },
      },
    });

    // 3. Score and prioritize courses based on gap magnitude
    const gapMap = new Map<string, number>();
    targetGaps.forEach((g) => gapMap.set(g.competencyId, g.gap));

    const scoredCourses = courses.map((course) => {
      let matchScore = 0;
      const matchedCompetencies: string[] = [];

      course.courseCompetencies.forEach((cc) => {
        if (gapMap.has(cc.competencyId)) {
          const gapSize = gapMap.get(cc.competencyId) || 1;
          matchScore += gapSize * 10;
          matchedCompetencies.push(cc.competency.name);
        }
      });

      return {
        ...course,
        matchScore,
        matchedCompetencies,
      };
    });

    scoredCourses.sort((a, b) => b.matchScore - a.matchScore);

    return {
      jobRole,
      activeGapsCount: targetGaps.length,
      recommendations: scoredCourses,
    };
  }
}
