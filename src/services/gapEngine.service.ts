import prisma from '../config/prisma';

export interface SkillGapResult {
  competencyId: string;
  competencyName: string;
  domain: string;
  requiredLevel: number;
  currentLevel: number;
  gap: number;
  currentScore: number;
}

export class GapEngineService {
  /**
   * Calculates dynamic skill gaps for a user based on their current job role requirements
   */
  static async calculateSkillGaps(userId: string): Promise<{
    jobRole: string | null;
    gaps: SkillGapResult[];
    totalGapScore: number;
  }> {
    // 1. Fetch user profile to identify current job role
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    const jobRoleTitle = profile?.currentJobRole || 'Statistical Officer';

    // 2. Fetch job role requirements
    const jobRole = await prisma.jobRole.findFirst({
      where: { name: { equals: jobRoleTitle, mode: 'insensitive' } },
      include: {
        jobRoleCompetencies: {
          include: {
            competency: true,
          },
        },
      },
    });

    if (!jobRole) {
      // Fallback: Return user competencies if job role is not mapped
      const userComps = await prisma.userCompetency.findMany({
        where: { userId },
        include: { competency: true },
      });

      const fallbackGaps = userComps.map((uc) => ({
        competencyId: uc.competencyId,
        competencyName: uc.competency.name,
        domain: uc.competency.domain,
        requiredLevel: 3, // Default baseline required level
        currentLevel: uc.currentLevel,
        gap: Math.max(0, 3 - uc.currentLevel),
        currentScore: uc.score,
      }));

      return {
        jobRole: jobRoleTitle,
        gaps: fallbackGaps,
        totalGapScore: fallbackGaps.reduce((acc, curr) => acc + curr.gap, 0),
      };
    }

    // 3. Fetch user's current assessed competencies
    const userCompetencies = await prisma.userCompetency.findMany({
      where: { userId },
    });

    const userCompMap = new Map<string, { currentLevel: number; score: number }>();
    userCompetencies.forEach((uc) => {
      userCompMap.set(uc.competencyId, {
        currentLevel: uc.currentLevel,
        score: uc.score,
      });
    });

    // 4. Derive dynamic gap: Gap = Math.max(0, Required Level - Current Level)
    const gaps: SkillGapResult[] = jobRole.jobRoleCompetencies.map((jrc) => {
      const userState = userCompMap.get(jrc.competencyId) || { currentLevel: 0, score: 0 };
      const gap = Math.max(0, jrc.requiredLevel - userState.currentLevel);

      return {
        competencyId: jrc.competencyId,
        competencyName: jrc.competency.name,
        domain: jrc.competency.domain,
        requiredLevel: jrc.requiredLevel,
        currentLevel: userState.currentLevel,
        gap,
        currentScore: userState.score,
      };
    });

    // Sort by largest gap first
    gaps.sort((a, b) => b.gap - a.gap);

    const totalGapScore = gaps.reduce((acc, curr) => acc + curr.gap, 0);

    return {
      jobRole: jobRole.name,
      gaps,
      totalGapScore,
    };
  }
}
